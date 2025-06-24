import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import movieService from "@/services/movie.service";
import { useModal } from "@/components/ui/modal";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import watchlistService from "@/services/watchlist.service";
import { WatchlistItemStatus } from "@/types/watchlist";

export function MovieDetailsPage() {
  const { id: movieId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<WatchlistItemStatus>();
  const { isAuthenticated } = useAuthStore();
  const { isOpen, openModal, closeModal } = useModal();
  const { showToast } = useToast();

  // Fetch movie details
  const {
    data: movieResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["movie", movieId],
    queryFn: () => movieService.getMovieById(movieId as string),
    enabled: movieId !== undefined,
  });
  console.log({ movieResponse, isError });
  // Safely access movie data from the API response structure
  const movie = movieResponse?.data.movie;
  console.log({ movie });

  // Add to watchlist mutation
  const { mutate: addToWatchlist, isPending: isAddingToWatchlist } =
    useMutation({
      mutationFn: () =>
        watchlistService.addToWatchlist(Number(movieId), selectedStatus),
      onSuccess: () => {
        closeModal();
        showToast("Movie added to your watchlist!", "success");
      },
      onError: (error) => {
        showToast(
          `Failed to add movie: ${error instanceof Error ? error.message : "Unknown error"}`,
          "error"
        );
      },
    });

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value as WatchlistItemStatus);
  };

  const handleAddToWatchlist = () => {
    if (!isAuthenticated) {
      showToast("Please sign in to add movies to your watchlist", "info");
      navigate("/login");
      return;
    }

    openModal();
  };

  const confirmAddToWatchlist = () => {
    addToWatchlist();
  };

  // Fallback if movie ID is invalid
  if (!movieId) {
    navigate("/movies");
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-400 font-medium">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="bg-black/40 border border-gray-800 text-white px-6 py-8 rounded-lg shadow-lg">
          <p className="font-bold text-xl mb-2 text-primary">Unable to Load</p>
          <p className="text-gray-300 mb-6">Failed to load movie details. Please try again later.</p>
          <button
            onClick={() => navigate("/")} 
            className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary hover:brightness-110 transition-all shadow-md hover:shadow-glow"
          >
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-center text-xl text-gray-300 mb-6">Movie not found</p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary hover:brightness-110 transition-all shadow-md hover:shadow-glow"
          >
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 pb-16">
      {/* Backdrop Image with Netflix-style fullwidth look */}
      <div
        className="w-full h-[50vh] md:h-[60vh] bg-cover bg-center mb-8 relative -mx-4 -mt-8"
        style={{
          backgroundImage: movie?.poster ? `url(${movie.poster})` : "none",
          backgroundColor: movie?.poster ? "transparent" : "#0f0f0f",
        }}
      >
        {/* Netflix-style gradient overlay with stronger fade to black */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/20"></div>

        {/* Back button with Netflix styling */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-8 left-8 flex items-center text-white bg-black/30 hover:bg-black/50 px-4 py-2 rounded-md transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Movies
        </button>
        
        {/* Netflix style title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-8 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">{movie?.title}</h1>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-10 px-4">
        {/* Poster with Netflix-style appearance */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <img
            src={movie?.poster ? movie.poster : "/placeholder-poster.jpg"}
            alt={movie?.title || "Movie poster"}
            className="rounded-md shadow-lg w-full object-cover aspect-[2/3] hover:shadow-xl transition-shadow duration-300 border border-gray-800/30"
          />

          {/* Add to Watchlist Button with Netflix styling */}
          <button
            onClick={handleAddToWatchlist}
            className="w-full mt-6 bg-primary hover:bg-primary hover:brightness-110 text-white font-semibold py-3 px-4 rounded-md flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-glow"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Add to Watchlist
          </button>
        </div>

        {/* Details with Netflix styling */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          <div className="flex items-center gap-3 mb-6">
            <div className="px-2 py-1 bg-primary/80 text-white text-xs font-medium rounded">
              {movie.rating ? Number(movie.rating).toFixed(1) : "N/A"}
            </div>
            {movie?.release_year && (
              <span className="text-gray-400 font-medium">{movie.release_year}</span>
            )}
          </div>
          
          {/* Genres - Netflix style badges */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {movie?.genre?.split(", ").map((genre) => (
                <span
                  key={genre}
                  className="bg-gray-800/70 text-gray-300 px-3 py-1 rounded-sm text-sm border border-gray-700/50"
                >
                  {genre}
                </span>
              )) || <span className="text-gray-500">No genres available</span>}
            </div>
          </div>
          
          {/* Meta details */}
          <div className="mb-8">
            <h2 className="text-2xl font-medium mb-3 text-white">About this movie</h2>
            <div className="text-gray-300 space-y-2">
              <p>A {movie?.genre?.split(", ")[0]} film released in {movie?.release_year}.</p>
              <p>Rated {movie.rating ? Number(movie.rating).toFixed(1) : "N/A"} by {movie.total_views} viewers.</p>
            </div>
          </div>

          {/* Overview */}
          {/* <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Overview</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {movie.data.}
            </p>
          </div> */}
        </div>
      </div>

      {/* Watchlist modal with Netflix styling */}
      <Modal isOpen={isOpen} onClose={closeModal} title="Add to Watchlist">
        <div className="py-4">
          <label className="block mb-2 font-medium text-gray-200">Select status:</label>
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="w-full p-3 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary mb-6"
          >
            <option value={WatchlistItemStatus.TO_WATCH}>Plan to Watch</option>
            <option value={WatchlistItemStatus.WATCHED}>Watched</option>
          </select>

          <div className="flex justify-end gap-3">
            <button
              onClick={closeModal}
              className="px-5 py-2.5 border border-gray-700 bg-transparent text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmAddToWatchlist}
              className="px-5 py-2.5 bg-primary text-white rounded-md hover:bg-primary hover:brightness-110 transition-all flex items-center shadow-md hover:shadow-glow"
              disabled={isAddingToWatchlist}
            >
              {isAddingToWatchlist ? (
                <>
                  <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
                  Adding...
                </>
              ) : (
                "Add to Watchlist"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
