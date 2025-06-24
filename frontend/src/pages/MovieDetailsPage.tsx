import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import movieService from "@/services/movie.service";
import { useToast } from "@/components/ui/toast";
import watchlistService from "@/services/watchlist.service";
import { Button } from "@/components/ui/button";

function parseGenres(genres: string) {
  // Handle genres in format like "{"Family","Comedy","Animation","Science Fiction"}"
  if (genres) {
    return genres
      .replace(/[{}]/g, "") // Remove curly braces
      .split(",") // Split by comma
      .map((genre) => genre.replace(/"/g, "").trim()); // Remove quotes and trim whitespace
  }
  return [];
}

export function MovieDetailsPage() {
  const { id: movieId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const { isAuthenticated } = useAuthStore();
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

  // Safely access movie data from the API response structure
  const movie = movieResponse?.data?.movie;

  // Check if movie is in watchlist when component loads
  useEffect(() => {
    // Only check if user is authenticated and movie data is loaded
    if (isAuthenticated && movie?.id) {
      // If movie has in_watchlist property set from API
      if (movie.in_watchlist !== undefined) {
        setIsInWatchlist(movie.in_watchlist);
      }
    }
  }, [isAuthenticated, movie]);

  // Add to watchlist mutation
  const { mutate: addToWatchlist, isPending: isAddingToWatchlist } =
    useMutation({
      mutationFn: () => watchlistService.addToWatchlist(Number(movieId)),
      onSuccess: () => {
        setIsInWatchlist(true);
        showToast("Movie added to your watchlist!", "success");
      },
      onError: (error) => {
        showToast(
          `Failed to add movie: ${error instanceof Error ? error.message : "Unknown error"}`,
          "error"
        );
      },
    });

  const handleAddToWatchlist = () => {
    if (!isAuthenticated) {
      showToast("Please sign in to add movies to your watchlist", "info");
      navigate("/login");
      return;
    }

    // Don't add again if already in watchlist
    if (isInWatchlist) {
      showToast("This movie is already in your watchlist", "info");
      return;
    }

    // Directly add to watchlist without modal
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
          <p className="text-gray-300 mb-6">
            Failed to load movie details. Please try again later.
          </p>
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
          <p className="text-center text-xl text-gray-300 mb-6">
            Movie not found
          </p>
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
        <Button
          onClick={() => navigate("/")}
          variant="outline"
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
        </Button>

        {/* Netflix style title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-8 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
            {movie?.title}
          </h1>
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
          <Button
            variant={isInWatchlist ? "secondary" : "outline"}
            onClick={handleAddToWatchlist}
            className={`w-full mt-6 ${isInWatchlist ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary hover:brightness-110"} text-white font-semibold py-3 px-4 rounded-md flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-glow`}
            disabled={isAddingToWatchlist}
          >
            {isAddingToWatchlist ? (
              <>
                <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
                Adding...
              </>
            ) : isInWatchlist ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Added to Watchlist
              </>
            ) : (
              <>
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
              </>
            )}
          </Button>
        </div>

        {/* Details with Netflix styling */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          <div className="flex items-center gap-3 mb-6">
            <div className="px-2 py-1 bg-primary/80 text-white text-xs font-medium rounded">
              {movie.rating ? Number(movie.rating).toFixed(1) : "N/A"}
            </div>
            {movie?.release_year && (
              <span className="text-gray-400 font-medium">
                {movie.release_year}
              </span>
            )}
          </div>

          {/* Genres - Netflix style badges */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {parseGenres(movie?.genre!).map((genre: string) => (
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
            <h2 className="text-2xl font-medium mb-3 text-white">
              About this movie
            </h2>
            <div className="text-gray-300 space-y-2">
              <p>
                A {parseGenres(movie?.genre!).join(", ")[0]} film released in{" "}
                {movie?.release_year}.
              </p>
              <p>
                Rated {movie.rating ? Number(movie.rating).toFixed(1) : "N/A"}{" "}
                by {movie.total_views} viewers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* No modal needed anymore */}
    </div>
  );
}
