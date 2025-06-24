export interface BaseMovie {
  title: string;
  release_year?: number;
  genre?: string;
  poster?: string;
  rating?: number;
  total_views: number;
}

export interface Movie extends BaseMovie {
  id: string;
  created_at: Date;
  updated_at?: Date;
}

export interface MovieQueryParams {
  search?: string;
  title?: string;
  genre?: string;
  year?: number;
  year_from?: number;
  year_to?: number;
  min_rating?: number;
  max_rating?: number;
  page?: number;
  limit?: number;
  sort_by?: string;
  order?: 'ASC' | 'DESC';
}
