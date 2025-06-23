import { useToggleWatchlistMutation, useUpdateWatchlistStatusMutation, useAddToWatchlistMutation, useRemoveFromWatchlistMutation } from '@/services/queries/watchlistQueries';

/**
 * Combined hook for watchlist mutations
 * Returns all watchlist-related mutations in a single object
 */
export const useWatchlistMutation = () => {
  const toggleMutation = useToggleWatchlistMutation();
  const updateStatusMutation = useUpdateWatchlistStatusMutation();
  const addMutation = useAddToWatchlistMutation();
  const removeMutation = useRemoveFromWatchlistMutation();
  
  return {
    toggleWatchlistMutation: toggleMutation,
    updateWatchlistStatusMutation: updateStatusMutation,
    addToWatchlistMutation: addMutation,
    removeFromWatchlistMutation: removeMutation
  };
};
