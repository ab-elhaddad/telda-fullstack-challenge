export interface Watchlist {
  id: number;
  user_id: number;
  movie_id: number;
  added_at: Date;
  status: 'to_watch' | 'watched';
}

export interface WatchlistWithMovie extends Watchlist {
  title: string;
  director: string;
  release_year: number;
  genre: string;
  poster: string | null;
  rating: number | null;
}

export interface AddToWatchlistDto {
  movie_id: number;
  status?: 'to_watch' | 'watched';
}

export interface UpdateWatchlistDto {
  status: 'to_watch' | 'watched';
}

export interface WatchlistQueryParams {
  page?: number;
  limit?: number;
  status?: 'to_watch' | 'watched' | 'all';
  sort_by?: string;
  order?: 'ASC' | 'DESC';
}

export interface WatchlistPaginated {
  watchlist: WatchlistWithMovie[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
