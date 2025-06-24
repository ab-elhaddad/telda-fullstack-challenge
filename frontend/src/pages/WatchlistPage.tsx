import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Movie } from "@/types/movie";
import { Card, CardContent, CardImage, CardTitle } from "@/components/ui/card";
import { Modal, useModal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { WatchlistItemStatus } from "@/types/watchlist";
import watchlistService from "@/services/watchlist.service";

// Map our WatchStatus to WatchlistItemStatus for API calls
const mapWatchStatus = (status: WatchlistItemStatus): WatchlistItemStatus => {
  switch (status) {
    case WatchlistItemStatus.TO_WATCH:
      return WatchlistItemStatus.TO_WATCH;
    case WatchlistItemStatus.WATCHED:
      return WatchlistItemStatus.WATCHED;
    default:
      return WatchlistItemStatus.TO_WATCH; // Default case
  }
};

// Our local WatchlistItem type for use in the component
interface WatchlistItem {
  id: number;
  movie_id: number;
  user_id: number;
  status: WatchlistItemStatus;
  added_at: string;
  updated_at: string;
  movie?: Movie;
}

export function WatchlistPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<WatchlistItemStatus | "all">("all");
  const [selectedItem, setSelectedItem] = useState<WatchlistItem | null>(null);
  const [newStatus, setNewStatus] = useState<WatchlistItemStatus>(
    WatchlistItemStatus.TO_WATCH
  );

  // Modal states
  const {
    isOpen: isEditOpen,
    openModal: openEditModal,
    closeModal: closeEditModal,
  } = useModal();
  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  // Fetch watchlist with proper typing
  const {
    data: watchlistResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["watchlist"],
    queryFn: async () => {
      // Use the standardized API response pattern as described in the project's pattern
      const response = await watchlistService.getWatchlist();
      return response.data;
    },
  });

  // Extract data from the API response using the standardized structure
  const watchlist = watchlistResponse?.data || [];

  // Update watchlist item status mutation
  const { mutate: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: ({
      itemId,
      status,
    }: {
      itemId: number;
      status: WatchlistItemStatus;
    }) =>
      watchlistService.updateWatchlistStatus(itemId, mapWatchStatus(status)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      showToast("Watchlist status updated", "success");
      closeEditModal();
    },
    onError: () => {
      showToast("Failed to update status", "error");
    },
  });

  // Remove from watchlist mutation
  const { mutate: removeFromWatchlist, isPending: isRemoving } = useMutation({
    mutationFn: (itemId: number) =>
      watchlistService.removeFromWatchlist(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      showToast("Movie removed from watchlist", "success");
      closeDeleteModal();
    },
    onError: () => {
      showToast("Failed to remove movie from watchlist", "error");
    },
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
  const filteredWatchlist = watchlist.filter(
    (item: WatchlistItem) => filter === "all" || item.status === filter
  );

  // Get status badge color - Netflix style
  const getStatusBadgeClass = (status: WatchlistItemStatus) => {
    switch (status) {
      case WatchlistItemStatus.WATCHED:
        return "bg-blue-900/70 text-blue-200 border border-blue-800";
      case WatchlistItemStatus.TO_WATCH:
        return "bg-purple-900/70 text-purple-200 border border-purple-800";
    }
  };

  // Format status label
  const formatStatus = (status: WatchlistItemStatus) => {
    switch (status) {
      case WatchlistItemStatus.TO_WATCH:
        return "Plan to Watch";
      case WatchlistItemStatus.WATCHED:
        return "Watched";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">My Watchlist</h1>

      {/* Filter Controls - Netflix Style */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-primary text-white"
              : "bg-gray-800/60 text-gray-300 hover:bg-gray-800 hover:text-white"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter(WatchlistItemStatus.WATCHED)}
          className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
            filter === WatchlistItemStatus.WATCHED
              ? "bg-primary text-white"
              : "bg-gray-800/60 text-gray-300 hover:bg-gray-800 hover:text-white"
          }`}
        >
          Watched
        </button>
        <button
          onClick={() => setFilter(WatchlistItemStatus.TO_WATCH)}
          className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
            filter === WatchlistItemStatus.TO_WATCH
              ? "bg-primary text-white"
              : "bg-gray-800/60 text-gray-300 hover:bg-gray-800 hover:text-white"
          }`}
        >
          Plan to Watch
        </button>
      </div>

      {/* Loading state - Netflix Style */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center my-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-400 font-medium">Loading your watchlist...</p>
        </div>
      )}

      {/* Error state - Netflix Style */}
      {isError && (
        <div
          className="bg-black/40 border border-gray-800 text-white px-6 py-8 rounded-lg shadow-lg my-8"
          role="alert"
        >
          <p className="font-bold text-xl mb-2 text-primary">Unable to Load</p>
          <p className="text-gray-300 mb-6">
            Failed to load your watchlist. Please try again later.
          </p>
          <button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["watchlist"] })
            }
            className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary hover:brightness-110 transition-all shadow-md hover:shadow-glow"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state - Netflix Style */}
      {!isLoading && !isError && filteredWatchlist.length === 0 && (
        <div className="text-center py-16 max-w-lg mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-20 w-20 mx-auto text-gray-500 mb-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h2 className="text-2xl font-bold text-white mb-3">
            Your watchlist is empty
          </h2>
          <p className="text-gray-300 mb-8">
            {filter === "all"
              ? "You haven't added any movies to your watchlist yet."
              : `You don't have any ${formatStatus(filter as WatchlistItemStatus).toLowerCase()} movies.`}
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary hover:brightness-110 transition-all shadow-md hover:shadow-glow"
          >
            Browse Movies
          </Link>
        </div>
      )}

      {/* Watchlist grid with Netflix styling */}
      {filteredWatchlist.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredWatchlist.map((item: WatchlistItem) => (
            <Card
              key={item.id}
              className="h-full bg-gray-900/50 border border-gray-800/50 overflow-hidden hover:scale-[1.03] transition-all duration-300 hover:shadow-xl rounded-md"
            >
              <div className="relative group">
                <CardImage
                  src={item.movie?.poster || "/placeholder-poster.jpg"}
                  alt={item.movie?.title || "Movie poster"}
                  className="aspect-[2/3] object-cover w-full transition-all duration-300 group-hover:brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <div className="flex gap-2 mb-2">
                    <Link
                      to={`/movie/${item.movie_id}`}
                      className="flex-1 px-3 py-2 text-sm bg-primary text-white rounded-sm hover:brightness-110 transition-all text-center"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleEditClick(item)}
                      className="flex-1 px-3 py-2 text-sm bg-gray-700 text-gray-100 hover:bg-gray-600 transition-colors rounded-sm"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-sm ${getStatusBadgeClass(item.status)}`}
                  >
                    {formatStatus(item.status)}
                  </span>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className="text-gray-400 hover:text-primary transition-colors"
                    title="Remove from watchlist"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>

                <CardTitle className="mb-2 line-clamp-1 text-white">
                  {item.movie?.title || "Unknown Title"}
                </CardTitle>

                <span className="text-xs text-gray-500 block mt-1">
                  Added {new Date(item.added_at).toLocaleDateString()}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Status Modal - Netflix Style */}
      <Modal
        isOpen={isEditOpen}
        onClose={closeEditModal}
        title="Update Watch Status"
      >
        <div className="py-4">
          <label className="block mb-2 font-medium text-gray-200">Movie:</label>
          <p className="mb-4 text-white text-lg font-medium">
            {selectedItem?.movie?.title}
          </p>

          <label className="block mb-2 font-medium text-gray-200">
            Status:
          </label>
          <select
            value={newStatus}
            onChange={(e) =>
              setNewStatus(e.target.value as WatchlistItemStatus)
            }
            className="w-full p-3 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary mb-6"
          >
            <option value={WatchlistItemStatus.TO_WATCH}>Plan to Watch</option>
            <option value={WatchlistItemStatus.WATCHED}>Watched</option>
          </select>

          <div className="flex justify-end gap-3">
            <button
              onClick={closeEditModal}
              className="px-5 py-2.5 border border-gray-700 bg-transparent text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmUpdateStatus}
              className="px-5 py-2.5 bg-primary text-white rounded-md hover:bg-primary hover:brightness-110 transition-all flex items-center shadow-md hover:shadow-glow"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal - Netflix Style */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        title="Remove from Watchlist"
      >
        <div className="py-4">
          <p className="mb-6 text-gray-300">
            Are you sure you want to remove{" "}
            <strong className="text-white">{selectedItem?.movie?.title}</strong>{" "}
            from your watchlist?
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={closeDeleteModal}
              className="px-5 py-2.5 border border-gray-700 bg-transparent text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmRemove}
              className="px-5 py-2.5 bg-red-700 text-white rounded-md hover:bg-red-600 hover:brightness-110 transition-all flex items-center shadow-md"
              disabled={isRemoving}
            >
              {isRemoving ? (
                <>
                  <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
