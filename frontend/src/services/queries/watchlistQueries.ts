import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import watchlistService from "@/services/api/watchlistService";
import { WatchlistQueryParams, WatchlistItemStatus } from "@/types/watchlist";

// Query keys
export const watchlistKeys = {
  all: ["watchlist"] as const,
  lists: () => [...watchlistKeys.all, "list"] as const,
  list: (params: WatchlistQueryParams) =>
    [...watchlistKeys.lists(), params] as const,
  status: (movieId: number) =>
    [...watchlistKeys.all, "status", movieId] as const,
};

/**
 * Hook for fetching user's watchlist with optional filtering and pagination
 */
export const useWatchlistQuery = (params: WatchlistQueryParams = {}) => {
  return useQuery({
    queryKey: watchlistKeys.list(params),
    queryFn: () => watchlistService.getUserWatchlist(params),
  });
};

/**
 * Hook for checking if a movie is in watchlist
 */
export const useIsInWatchlistQuery = (movieId: number) => {
  return useQuery({
    queryKey: watchlistKeys.status(movieId),
    queryFn: () => watchlistService.checkMovieInWatchlist(movieId),
    // Keep last result while refetching
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Hook for adding a movie to watchlist
 */
export const useAddToWatchlistMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (movieId: number) => watchlistService.addToWatchlist(movieId),
    onSuccess: (_, movieId) => {
      // Update the movie's watchlist status
      queryClient.setQueryData(watchlistKeys.status(movieId), {
        in_watchlist: true,
        status: "to_watch",
      });

      // Invalidate the watchlist queries
      queryClient.invalidateQueries({ queryKey: watchlistKeys.lists() });
    },
  });
};

/**
 * Hook for removing a movie from watchlist
 */
export const useRemoveFromWatchlistMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (movieId: number) =>
      watchlistService.removeFromWatchlist(movieId),
    onSuccess: (_, movieId) => {
      // Update the movie's watchlist status
      queryClient.setQueryData(watchlistKeys.status(movieId), {
        in_watchlist: false,
        status: null,
      });

      // Invalidate the watchlist queries
      queryClient.invalidateQueries({ queryKey: watchlistKeys.lists() });
    },
  });
};

/**
 * Hook for updating a movie's watchlist status
 */
export const useUpdateWatchlistStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      movieId,
      status,
    }: {
      movieId: number;
      status: WatchlistItemStatus;
    }) => watchlistService.updateWatchlistStatus(movieId, status),
    onSuccess: (_, { movieId, status }) => {
      // Update the movie's watchlist status
      queryClient.setQueryData(watchlistKeys.status(movieId), {
        in_watchlist: true,
        status,
      });

      // Invalidate the watchlist queries
      queryClient.invalidateQueries({ queryKey: watchlistKeys.lists() });
    },
  });
};

/**
 * Hook for toggling a movie in watchlist (add if not present, remove if present)
 */
export const useToggleWatchlistMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (movieId: number) => watchlistService.toggleWatchlist(movieId),
    onSuccess: (result, movieId) => {
      // Update the movie's watchlist status based on the result
      queryClient.setQueryData(watchlistKeys.status(movieId), {
        in_watchlist: result.inWatchlist,
        status: result.inWatchlist
          ? ("to_watch" as WatchlistItemStatus)
          : undefined,
      });

      // Invalidate the watchlist queries
      queryClient.invalidateQueries({ queryKey: watchlistKeys.lists() });
    },
  });
};
