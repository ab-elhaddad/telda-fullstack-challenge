/**
 * Movie related type definitions
 */

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number;
  tagline: string;
  status: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface WatchlistItem {
  id: number;
  user_id: number;
  movie_id: number;
  status: WatchStatus;
  added_at: string;
  movie?: Movie;
}

export enum WatchStatus {
  WATCHING = 'watching',
  PLAN_TO_WATCH = 'plan_to_watch',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  DROPPED = 'dropped'
}
