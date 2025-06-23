import db from '../config/database';
import { Comment, CommentWithUser, CreateCommentDto, UpdateCommentDto, CommentQueryParams, CommentsPaginated } from '../types/comment';
import { NotFoundException, BadRequestException } from '../utils/exceptions';

class CommentModel {
  /**
   * Check if a movie exists
   * @param movieId Movie ID
   * @returns True if movie exists, false otherwise
   */
  private async checkMovieExists(movieId: number): Promise<boolean> {
    const result = await db.query<{ exists: boolean }>('SELECT EXISTS(SELECT 1 FROM movies WHERE id = $1)', [movieId]);
    return result[0]?.exists || false;
  }

  /**
   * Create comment table
   */
  async setupTable(): Promise<void> {
    await db.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP,
        CONSTRAINT unique_user_movie_comment UNIQUE(user_id, movie_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_comments_movie_id ON comments(movie_id);
      CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
    `);
  }

  /**
   * Create a new comment
   * @param userId User ID
   * @param movieId Movie ID
   * @param data Comment data
   * @returns Created comment
   */
  async createComment(userId: number, movieId: number, data: CreateCommentDto): Promise<Comment> {
    // Check if the movie exists
    const movieExists = await this.checkMovieExists(movieId);
    if (!movieExists) {
      throw new NotFoundException('Movie');
    }

    // Check if user already commented on this movie
    const existingComments = await db.query<{ id: number }>('SELECT id FROM comments WHERE user_id = $1 AND movie_id = $2', [userId, movieId]);
    if (existingComments.length > 0) {
      throw new BadRequestException('You have already commented on this movie');
    }

    const result = await db.query<Comment>(
      `INSERT INTO comments (movie_id, user_id, content, rating)
       VALUES ($1, $2, $3, $4)
       RETURNING id, movie_id, user_id, content, rating, created_at, updated_at`,
      [movieId, userId, data.content, data.rating]
    );

    return result[0];
  }

  /**
   * Get comments by movie ID with pagination
   * @param params Query parameters with optional pagination
   * @returns Comments with pagination data
   */
  async getComments(params: CommentQueryParams): Promise<CommentsPaginated> {
    const { movie_id, user_id, page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;
    
    // Build WHERE clause based on provided filters
    let whereClause = '';
    const queryParams: any[] = [];
    
    if (movie_id) {
      queryParams.push(movie_id);
      whereClause = `WHERE c.movie_id = $${queryParams.length}`;
    }
    
    if (user_id) {
      queryParams.push(user_id);
      whereClause = whereClause 
        ? `${whereClause} AND c.user_id = $${queryParams.length}`
        : `WHERE c.user_id = $${queryParams.length}`;
    }
    
    // Add limit and offset for pagination
    queryParams.push(limit, offset);
    
    // Query for data with user information
    const dataQuery = `
      SELECT c.*, u.name as user_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
    `;
    
    // Query for total count
    const countQuery = `
      SELECT COUNT(*) as count
      FROM comments c
      ${whereClause}
    `;
    
    const [comments, countResult] = await Promise.all([
      db.query<CommentWithUser>(dataQuery, queryParams),
      db.query<{ count: string }>(countQuery, queryParams.slice(0, -2)) // Remove limit and offset params
    ]);
    
    const total = Number(countResult[0]?.count || 0);
    const pages = Math.ceil(total / limit);
    
    return {
      comments,
      pagination: {
        total,
        page,
        limit,
        pages
      }
    };
  }

  /**
   * Get a comment by ID
   * @param commentId Comment ID
   * @returns Comment with user information
   */
  async getCommentById(commentId: number): Promise<CommentWithUser | null> {
    const result = await db.query<CommentWithUser>(
      `SELECT c.*, u.name as user_name
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [commentId]
    );
    
    return result[0] || null;
  }

  /**
   * Update a comment
   * @param commentId Comment ID
   * @param userId User ID (for authorization)
   * @param data Update data
   * @returns Updated comment
   */
  async updateComment(commentId: number, userId: number, data: UpdateCommentDto): Promise<Comment> {
    // Check if the comment exists and belongs to the user
    const comment = await this.getCommentById(commentId);
    
    if (!comment) {
      throw new NotFoundException('Comment');
    }
    
    if (comment.user_id !== userId) {
      throw new BadRequestException('You are not authorized to update this comment');
    }
    
    // Build update query
    const updates: string[] = [];
    const queryParams: any[] = [commentId];
    
    if (data.content !== undefined) {
      queryParams.push(data.content);
      updates.push(`content = $${queryParams.length}`);
    }
    
    if (data.rating !== undefined) {
      queryParams.push(data.rating);
      updates.push(`rating = $${queryParams.length}`);
    }
    
    // Add updated_at timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // Execute update
    const result = await db.query<Comment>(
      `UPDATE comments
       SET ${updates.join(', ')}
       WHERE id = $1
       RETURNING id, movie_id, user_id, content, rating, created_at, updated_at`,
      queryParams
    );
    
    return result[0];
  }

  /**
   * Delete a comment
   * @param commentId Comment ID
   * @param userId User ID (for authorization)
   * @returns True if deleted
   */
  async deleteComment(commentId: number, userId: number): Promise<boolean> {
    // Check if the comment exists and belongs to the user
    const comment = await this.getCommentById(commentId);
    
    if (!comment) {
      throw new NotFoundException('Comment');
    }
    
    if (comment.user_id !== userId) {
      throw new BadRequestException('You are not authorized to delete this comment');
    }
    
    const result = await db.query<{ id: number }>('DELETE FROM comments WHERE id = $1 RETURNING id', [commentId]);
    return result.length > 0;
  }
}

export default new CommentModel();
