export interface Comment {
  id: number;
  movie_id: number;
  user_id: number;
  content: string;
  rating: number;
  created_at: Date;
  updated_at: Date | null;
}

export interface CommentWithUser extends Comment {
  user_name: string;
}

export interface CreateCommentDto {
  content: string;
  rating: number;
}

export interface UpdateCommentDto {
  content?: string;
  rating?: number;
}

export interface CommentQueryParams {
  movie_id?: number;
  user_id?: number;
  page?: number;
  limit?: number;
}

export interface CommentsPaginated {
  comments: CommentWithUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
