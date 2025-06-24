import db from '../config/database';
import {
  Watchlist,
  WatchlistWithMovie,
  AddToWatchlistDto,
  WatchlistQueryParams,
  WatchlistPaginated,
  UpdateWatchlistDto,
} from '../types/watchlist';
import { NotFoundException, BadRequestException } from '../utils/exceptions';

class WatchlistModel {
  /**
   * Check if a movie exists
   * @param movieId Movie ID
   * @returns True if movie exists, false otherwise
   */
  private async checkMovieExists(movieId: number): Promise<boolean> {
    const result = (await db.query('SELECT EXISTS(SELECT 1 FROM movies WHERE id = $1)', [
      movieId,
    ])) as any;
    return result[0].exists;
  }

  /**
   * Add movie to watchlist
   * @param userId User ID
   * @param data Watchlist data containing movie ID
   * @returns Created watchlist item
   */
  async addToWatchlist(userId: number, data: AddToWatchlistDto): Promise<Watchlist> {
    // Check if the movie exists
    const movieExists = await this.checkMovieExists(data.movie_id);
    if (!movieExists) {
      throw new NotFoundException('Movie');
    }

    // Check if movie is already in user's watchlist
    const existingItems = await db.query(
      'SELECT id FROM watchlist WHERE user_id = $1 AND movie_id = $2',
      [userId, data.movie_id],
    );
    console.log({ existingItems });

    if (existingItems.length > 0) {
      throw new BadRequestException('Movie is already in your watchlist');
    }

    // Set default status if not provided
    const status = data.status || 'to_watch';

    // Add to watchlist
    const result = (await db.query(
      'INSERT INTO watchlist (user_id, movie_id, status) VALUES ($1, $2, $3) RETURNING *',
      [userId, data.movie_id, status],
    )) as any;
    console.log({ result });

    return result[0] as Watchlist;
  }

  /**
   * Update watchlist item status
   * @param userId User ID
   * @param movieId Movie ID
   * @param data Update data with new status
   * @returns Updated watchlist item
   */
  async updateWatchlistStatus(
    userId: number,
    movieId: number,
    data: UpdateWatchlistDto,
  ): Promise<Watchlist | null> {
    // Check if the item exists in user's watchlist
    const existingItem = (await db.query(
      'SELECT id FROM watchlist WHERE user_id = $1 AND movie_id = $2',
      [userId, movieId],
    )) as any;

    if (existingItem.rowCount === 0) {
      throw new NotFoundException('Movie not found in your watchlist');
    }

    // Update the status
    const result = (await db.query(
      'UPDATE watchlist SET status = $1 WHERE user_id = $2 AND movie_id = $3 RETURNING *',
      [data.status, userId, movieId],
    )) as any;

    return result[0] as Watchlist;
  }

  /**
   * Get user's watchlist with pagination
   * @param userId User ID
   * @param params Query parameters with pagination
   * @returns Watchlist items with movie details and pagination data
   */
  async getUserWatchlist(
    userId: number,
    params: WatchlistQueryParams,
  ): Promise<WatchlistPaginated> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    // Build query
    const values: any[] = [userId];
    let paramIndex = 2;

    // Start building the query
    let query = `
      SELECT w.id, w.user_id, w.movie_id, w.added_at, w.status,
             m.title, m.release_year, m.genre, m.poster, m.rating
      FROM watchlist w
      JOIN movies m ON w.movie_id = m.id
      WHERE w.user_id = $1
    `;

    // Add status filter if specified
    if (params.status && params.status !== 'all') {
      query += ` AND w.status = $${paramIndex++}`;
      values.push(params.status);
    }

    // Add sorting
    const sortField = params.sort_by || 'added_at';
    const sortOrder = params.order || 'DESC';

    // Map sort fields to their proper table prefixes
    let sortClause: string;
    if (sortField === 'added_at') {
      sortClause = 'w.added_at';
    } else if (sortField === 'title' || sortField === 'rating') {
      sortClause = `m.${sortField}`;
    } else {
      sortClause = 'w.added_at';
    }

    query += ` ORDER BY ${sortClause} ${sortOrder}`;

    // Add pagination
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    values.push(limit, offset);

    const watchlist = await db.query<WatchlistWithMovie>(query, values);

    // Count total items with the same filters (except pagination)
    let countQuery = 'SELECT COUNT(*) FROM watchlist w WHERE w.user_id = $1';
    const countValues = [userId];

    if (params.status && params.status !== 'all') {
      countQuery += ' AND w.status = $2';
      countValues.push(Number(countQuery));
    }

    const countResult = await db.query<{ count: string }>(countQuery, countValues);

    const total = parseInt(countResult[0].count, 10);
    const pages = Math.ceil(total / limit);

    return {
      watchlist,
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    };
  }

  /**
   * Check if a movie is in user's watchlist
   * @param userId User ID
   * @param movieId Movie ID
   * @returns True if movie is in watchlist, false otherwise
   */
  async isInWatchlist(userId: number, movieId: number): Promise<boolean> {
    const result = (await db.query(
      'SELECT EXISTS(SELECT 1 FROM watchlist WHERE user_id = $1 AND movie_id = $2)',
      [userId, movieId],
    )) as any;
    return (result[0] as { exists: boolean }).exists;
  }

  /**
   * Check if a movie is in user's watchlist and get its status
   * @param userId User ID
   * @param movieId Movie ID
   * @returns Object with inWatchlist flag and status if in watchlist
   */
  async checkMovieInWatchlist(
    userId: number,
    movieId: number,
  ): Promise<{ inWatchlist: boolean; status?: string }> {
    // Check if movie is in watchlist and get status if it is
    const result = (await db.query(
      'SELECT status FROM watchlist WHERE user_id = $1 AND movie_id = $2',
      [userId, movieId],
    )) as any;

    const inWatchlist = result.rowCount > 0;
    return {
      inWatchlist,
      status: inWatchlist ? result.rows[0].status : undefined,
    };
  }

  /**
   * Remove movie from watchlist
   * @param userId User ID
   * @param movieId Movie ID
   * @returns True if removed
   */
  async removeFromWatchlist(userId: number, movieId: number): Promise<boolean> {
    // Check if movie is in watchlist
    const inWatchlist = await this.isInWatchlist(userId, movieId);

    if (!inWatchlist) {
      throw new NotFoundException('Watchlist entry');
    }

    const result = await db.query('DELETE FROM watchlist WHERE user_id = $1 AND movie_id = $2', [
      userId,
      movieId,
    ]);

    return (result as any).rowCount > 0;
  }
}

export default new WatchlistModel();
