import { useState, memo } from "react";
import { Link } from "react-router-dom";
import { Movie } from "@/types/movie";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/utils/cn";
import { useWatchlistMutation } from "@/hooks/useWatchlistMutation";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/components/ui/toast";

interface MovieCardProps {
  movie: Movie;
  className?: string;
  showWatchlistButton?: boolean;
}

/**
 * MovieCard component for displaying movie information in a grid or list
 * Optimized with memo to prevent unnecessary re-renders
 * Uses lazy loading for images to improve performance
 */
const MovieCard = memo(
  ({ movie, className, showWatchlistButton = true }: MovieCardProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const { isAuthenticated } = useAuthStore();
    const { showToast } = useToast();
    
    // Get watchlist mutation hooks
    const { toggleWatchlistMutation } = useWatchlistMutation();

    // Handle image loading
    const handleImageLoad = () => {
      setImageLoaded(true);
    };

    // Handle watchlist toggle
    const handleWatchlistToggle = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!movie?.id) return;
      
      // Check authentication before toggling watchlist
      if (!isAuthenticated) {
        showToast("Please log in to add movies to your watchlist", "warning");
        return;
      }

      // Optimistically update UI
      const originalInWatchlist = movie.in_watchlist;
      const optimisticMovie = {
        ...movie,
        in_watchlist: !originalInWatchlist
      };
      
      // Call the mutation with optimistic updates
      toggleWatchlistMutation.mutate(movie.id, {
        // Success handler
        onSuccess: () => {
          showToast(
            optimisticMovie.in_watchlist 
              ? "Added to your watchlist" 
              : "Removed from your watchlist", 
            "success"
          );
        },
        // Error handler
        onError: (error: unknown) => {
          showToast(
            `Failed to update watchlist: ${error instanceof Error ? error.message : 'Unknown error'}`, 
            "error"
          );
        }
      });
    };

    // Format release year
    const releaseYear = movie.release_year ? movie.release_year : "N/A";

    // Format genre list for display
    const genres = movie.genre
      ? movie.genre.split(",").map((g) => g.trim())
      : [];
    const displayGenres = genres.length > 0 ? genres.join(", ") : "No genres";

    return (
      <Link
        to={`/movies/${movie.id}`}
        className={cn(
          "block transition-transform duration-200 hover:scale-[1.02]",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card className="h-full overflow-hidden">
          <div className="relative">
            {/* Skeleton loader for image */}
            <div
              className={cn(
                "absolute inset-0 bg-gray-200 dark:bg-gray-700",
                imageLoaded ? "opacity-0" : "opacity-100"
              )}
            />

            <img
              src={movie.poster || "/placeholder-movie.png"}
              alt={`${movie.title} poster`}
              className="h-[300px] w-full object-cover transition-opacity duration-300"
              onLoad={handleImageLoad}
              loading="lazy"
            />

            {/* Watchlist button */}
            {showWatchlistButton && (
              <button
                onClick={handleWatchlistToggle}
                className={cn(
                  "absolute right-2 top-2 rounded-full bg-black bg-opacity-50 p-2 text-white transition-opacity",
                  isHovered ? "opacity-100" : "opacity-0"
                )}
                aria-label={
                  movie.in_watchlist
                    ? "Remove from watchlist"
                    : "Add to watchlist"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={movie.in_watchlist ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>
            )}
          </div>

          <CardContent className="p-4">
            <CardTitle as="h3" className="line-clamp-1 text-lg font-semibold">
              {movie.title}
            </CardTitle>

            <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>{releaseYear}</span>
              {movie.rating && (
                <>
                  <span className="mx-2">•</span>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="mr-1 text-yellow-400"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span>{movie.rating.toFixed(1)}</span>
                  </div>
                </>
              )}
            </div>

            <CardDescription className="mt-2 line-clamp-2 text-sm">
              {displayGenres}
            </CardDescription>
          </CardContent>
        </Card>
      </Link>
    );
  }
);

MovieCard.displayName = "MovieCard";

export default MovieCard;
