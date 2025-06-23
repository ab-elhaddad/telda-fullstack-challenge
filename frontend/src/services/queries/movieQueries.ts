import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import movieService from "@/services/api/movieService";
import {
  MovieQueryParams,
  CreateMovieData,
  UpdateMovieData,
} from "@/types/movie";

// Query keys
export const movieKeys = {
  all: ["movies"] as const,
  lists: () => [...movieKeys.all, "list"] as const,
  list: (params: MovieQueryParams) => [...movieKeys.lists(), params] as const,
  details: () => [...movieKeys.all, "detail"] as const,
  detail: (id: number) => [...movieKeys.details(), id] as const,
  genres: ["movieGenres"] as const,
};

/**
 * Hook for fetching movies with optional filtering and pagination
 */
export const useMoviesQuery = (params: MovieQueryParams = {}) => {
  return useQuery({
    queryKey: movieKeys.list(params),
    queryFn: () => movieService.getMovies(params),
  });
};

/**
 * Hook for searching movies
 */
export const useMovieSearch = (query: MovieQueryParams) => {
  return useQuery({
    queryKey: [...movieKeys.lists(), "search", query],
    queryFn: () => movieService.searchMovies(query),
    // Only run query if search has at least 2 characters
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Hook for fetching a single movie by ID
 */
export const useMovieQuery = (id: number) => {
  return useQuery({
    queryKey: movieKeys.detail(id),
    queryFn: () => movieService.getMovieById(id),
  });
};

/**
 * Hook for fetching movie genres
 */
export const useMovieGenresQuery = () => {
  return useQuery({
    queryKey: movieKeys.genres,
    queryFn: () => movieService.getGenres(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - genres don't change often
  });
};

/**
 * Hook for creating a movie
 */
export const useCreateMovieMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMovieData) => movieService.createMovie(data),
    onSuccess: () => {
      // Invalidate and refetch movies list
      queryClient.invalidateQueries({ queryKey: movieKeys.lists() });
    },
  });
};

/**
 * Hook for updating a movie
 */
export const useUpdateMovieMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMovieData }) =>
      movieService.updateMovie(id, data),
    onSuccess: (updatedMovie) => {
      // Update the movie in the cache
      queryClient.invalidateQueries({
        queryKey: movieKeys.detail(updatedMovie.id),
      });
      // Invalidate lists that might include this movie
      queryClient.invalidateQueries({
        queryKey: movieKeys.lists(),
      });
    },
  });
};

/**
 * Hook for deleting a movie
 */
export const useDeleteMovieMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => movieService.deleteMovie(id),
    onSuccess: (_, deletedId) => {
      // Remove the movie from the cache
      queryClient.removeQueries({
        queryKey: movieKeys.detail(deletedId),
      });
      // Invalidate lists that might include this movie
      queryClient.invalidateQueries({
        queryKey: movieKeys.lists(),
      });
    },
  });
};
