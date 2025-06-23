import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import movieService from '@/services/movie.service';
import { WatchStatus, WatchlistItem } from '@/types/movie.types';
import { Card, CardContent, CardImage, CardTitle } from '@/components/ui/card';
import { Modal, useModal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';

export function WatchlistPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<WatchStatus | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<WatchlistItem | null>(null);
  const [newStatus, setNewStatus] = useState<WatchStatus>(WatchStatus.PLAN_TO_WATCH);
  
  // Modal states
  const { isOpen: isEditOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();

  // Fetch watchlist
  const { data: watchlist = [], isLoading, isError } = useQuery({
    queryKey: ['watchlist'],
    queryFn: movieService.getWatchlist
  });
  
  // Update watchlist item status mutation
  const { mutate: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: ({ itemId, status }: { itemId: number, status: WatchStatus }) => 
      movieService.updateWatchlistStatus(itemId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      showToast('Watchlist status updated', 'success');
      closeEditModal();
    },
    onError: () => {
      showToast('Failed to update status', 'error');
    }
  });
  
  // Remove from watchlist mutation
  const { mutate: removeFromWatchlist, isPending: isRemoving } = useMutation({
    mutationFn: (itemId: number) => movieService.removeFromWatchlist(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      showToast('Movie removed from watchlist', 'success');
      closeDeleteModal();
    },
    onError: () => {
      showToast('Failed to remove movie from watchlist', 'error');
    }
  });
  
  // Handle status change
  const handleEditClick = (item: WatchlistItem) => {
    setSelectedItem(item);
    setNewStatus(item.status);
    openEditModal();
  };
  
  // Handle delete click
  const handleDeleteClick = (item: WatchlistItem) => {
    setSelectedItem(item);
    openDeleteModal();
  };
  
  // Confirm update status
  const confirmUpdateStatus = () => {
    if (selectedItem && newStatus) {
      updateStatus({ itemId: selectedItem.id, status: newStatus });
    }
  };
  
  // Confirm remove from watchlist
  const confirmRemove = () => {
    if (selectedItem) {
      removeFromWatchlist(selectedItem.id);
    }
  };

  // Filter watchlist items
  const filteredWatchlist = watchlist.filter(item => 
    filter === 'all' || item.status === filter
  );
  
  // Get status badge color
  const getStatusBadgeClass = (status: WatchStatus) => {
    switch (status) {
      case WatchStatus.WATCHING:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case WatchStatus.COMPLETED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case WatchStatus.PLAN_TO_WATCH:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case WatchStatus.ON_HOLD:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case WatchStatus.DROPPED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  // Format status label
  const formatStatus = (status: WatchStatus) => {
    switch (status) {
      case WatchStatus.PLAN_TO_WATCH:
        return 'Plan to Watch';
      case WatchStatus.WATCHING:
        return 'Watching';
      case WatchStatus.COMPLETED:
        return 'Completed';
      case WatchStatus.ON_HOLD:
        return 'On Hold';
      case WatchStatus.DROPPED:
        return 'Dropped';
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">My Watchlist</h1>
      
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm ${
            filter === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter(WatchStatus.WATCHING)}
          className={`px-4 py-2 rounded-full text-sm ${
            filter === WatchStatus.WATCHING
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Watching
        </button>
        <button
          onClick={() => setFilter(WatchStatus.PLAN_TO_WATCH)}
          className={`px-4 py-2 rounded-full text-sm ${
            filter === WatchStatus.PLAN_TO_WATCH
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Plan to Watch
        </button>
        <button
          onClick={() => setFilter(WatchStatus.COMPLETED)}
          className={`px-4 py-2 rounded-full text-sm ${
            filter === WatchStatus.COMPLETED
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setFilter(WatchStatus.ON_HOLD)}
          className={`px-4 py-2 rounded-full text-sm ${
            filter === WatchStatus.ON_HOLD
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          On Hold
        </button>
        <button
          onClick={() => setFilter(WatchStatus.DROPPED)}
          className={`px-4 py-2 rounded-full text-sm ${
            filter === WatchStatus.DROPPED
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Dropped
        </button>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      
      {/* Error state */}
      {isError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">Failed to load your watchlist. Please try again later.</span>
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && !isError && filteredWatchlist.length === 0 && (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h2 className="mt-4 text-xl font-semibold">Your watchlist is empty</h2>
          <p className="mt-2 text-gray-600">{filter === 'all' ? "You haven't added any movies to your watchlist yet." : `You don't have any ${formatStatus(filter as WatchStatus).toLowerCase()} movies.`}</p>
          <Link
            to="/movies"
            className="mt-4 inline-block px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Browse Movies
          </Link>
        </div>
      )}
      
      {/* Watchlist grid */}
      {filteredWatchlist.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredWatchlist.map(item => (
            <Card key={item.id} className="h-full">
              <CardImage 
                src={item.movie?.poster_path ? `https://image.tmdb.org/t/p/w500${item.movie.poster_path}` : '/placeholder-poster.jpg'} 
                alt={item.movie?.title || 'Movie poster'}
                aspectRatio="portrait"
              />
              <CardContent>
                <CardTitle className="mb-2 line-clamp-1">
                  {item.movie?.title || 'Unknown Title'}
                </CardTitle>
                
                {/* Status badge */}
                <div className="flex justify-between items-center mb-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(item.status)}`}>
                    {formatStatus(item.status)}
                  </span>
                  <span className="text-xs text-gray-500">
                    Added {new Date(item.added_at).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Action buttons */}
                <div className="flex gap-2 mt-4">
                  <Link
                    to={`/movies/${item.movie_id}`}
                    className="flex-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-center"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleEditClick(item)}
                    className="flex-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className="px-3 py-1.5 text-sm bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 rounded"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Edit Status Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={closeEditModal}
        title="Update Watch Status"
      >
        <div className="py-4">
          <label className="block mb-2 font-medium">Movie:</label>
          <p className="mb-4">{selectedItem?.movie?.title}</p>
          
          <label className="block mb-2 font-medium">Status:</label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as WatchStatus)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary mb-6"
          >
            <option value={WatchStatus.PLAN_TO_WATCH}>Plan to Watch</option>
            <option value={WatchStatus.WATCHING}>Currently Watching</option>
            <option value={WatchStatus.COMPLETED}>Completed</option>
            <option value={WatchStatus.ON_HOLD}>On Hold</option>
            <option value={WatchStatus.DROPPED}>Dropped</option>
          </select>
          
          <div className="flex justify-end gap-3">
            <button 
              onClick={closeEditModal}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={confirmUpdateStatus}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        title="Remove from Watchlist"
      >
        <div className="py-4">
          <p className="mb-6">
            Are you sure you want to remove <strong>{selectedItem?.movie?.title}</strong> from your watchlist?
          </p>
          
          <div className="flex justify-end gap-3">
            <button 
              onClick={closeDeleteModal}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={confirmRemove}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              disabled={isRemoving}
            >
              {isRemoving ? (
                <>
                  <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
                  Removing...
                </>
              ) : (
                'Remove'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
