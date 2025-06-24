import { useState, memo } from "react";
import { Link } from "react-router-dom";
import { Movie } from "@/types/movie";
import {
  Card,
  CardContent,
  CardTitle,
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
      
      // Call the mutation with optimistic updates - convert string ID to number
      toggleWatchlistMutation.mutate(parseInt(movie.id), {
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

    return (
      <Link
        to={`/movies/${movie.id}`}
        className={cn(
          "block movie-card transition-all duration-300",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card className="h-full overflow-hidden border-0 bg-transparent shadow-none dark:bg-transparent">
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
              className="h-[350px] w-full object-cover transition-opacity duration-300 rounded-md"
              onLoad={handleImageLoad}
              loading="lazy"
              style={{
                boxShadow: isHovered ? "0 10px 25px -5px rgba(0, 0, 0, 0.8)" : "0 4px 12px -4px rgba(0, 0, 0, 0.6)"
              }}
            />
            
            {/* Overlay on hover */}
            <div 
              className={cn(
                "absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 transition-opacity duration-300 rounded-md",
                isHovered ? "opacity-100" : "opacity-0"
              )}
            />

            {/* Watchlist button */}
            {showWatchlistButton && (
              <button
                onClick={handleWatchlistToggle}
                className={cn(
                  "absolute right-3 top-3 rounded-full bg-black bg-opacity-60 p-2 text-white transition-all duration-300 transform",
                  isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
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

          <CardContent className={cn(
            "p-3 transform transition-all duration-300", 
            isHovered ? "translate-y-0" : "translate-y-0"
          )}>
            <CardTitle as="h3" className="line-clamp-1 text-base font-bold text-white">
              {movie.title}
            </CardTitle>

            <div className="mt-1 flex items-center text-xs text-gray-300">
              <span>{releaseYear}</span>
              {movie.rating && (
                <>
                  <span className="mx-2">•</span>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="mr-1 text-red-600"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span>{movie.rating ? parseFloat(movie.rating).toFixed(1) : 'N/A'}</span>
                  </div>
                </>
              )}
            </div>

            <div className={cn(
              "absolute inset-x-0 bottom-0 p-3 pb-4 transform transition-all duration-300", 
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              <div className="flex flex-wrap gap-1 mb-2">
                {genres.slice(0, 3).map((genre, index) => (
                  <span 
                    key={index} 
                    className="text-[10px] px-1.5 py-0.5 bg-gray-800/70 text-gray-300 rounded">
                    {genre}
                  </span>
                ))}
                {genres.length > 3 && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-800/70 text-gray-300 rounded">+{genres.length - 3}</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  className="rounded-full bg-white p-1.5 text-black hover:bg-opacity-90 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </button>
                
                {movie.in_watchlist ? (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleWatchlistToggle(e);
                    }}
                    className="rounded-full border border-gray-400 p-1.5 text-white hover:border-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </button>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }
);

MovieCard.displayName = "MovieCard";

export default MovieCard;
