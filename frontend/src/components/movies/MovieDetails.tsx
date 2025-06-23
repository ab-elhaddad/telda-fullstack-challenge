import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import { Movie } from "@/types/movie";
import { useWatchlistMutation } from "@/hooks/useWatchlistMutation";
import { WatchlistItemStatus } from "@/types/watchlist";

interface MovieDetailsProps {
  movie: Movie;
  className?: string;
}

/**
 * MovieDetails component for displaying comprehensive movie information
 * Optimized with memo to prevent unnecessary re-renders
 */
const MovieDetails = memo(({ movie, className }: MovieDetailsProps) => {
  const { toggleWatchlistMutation, updateWatchlistStatusMutation } =
    useWatchlistMutation();

  // Format movie details
  const releaseYear = movie.release_year || "N/A";
  const genres = movie.genre ? movie.genre.split(",").map((g) => g.trim()) : [];

  // Handle watchlist operations
  const handleToggleWatchlist = () => {
    if (movie?.id) {
      toggleWatchlistMutation.mutate(movie.id);
    }
  };

  const handleWatchlistStatusChange = (status: WatchlistItemStatus) => {
    if (movie?.id) {
      updateWatchlistStatusMutation.mutate({
        movieId: movie.id,
        status: status,
      });
    }
  };

  return (
    <div className={cn("grid gap-6 md:grid-cols-[350px_1fr]", className)}>
      {/* Movie poster */}
      <div className="relative">
        <img
          src={movie.poster || "/placeholder-movie.png"}
          alt={`${movie.title} poster`}
          className="h-auto w-full rounded-lg object-cover shadow-md"
          loading="eager"
        />

        {/* Watchlist actions on mobile - visible on small screens */}
        <div className="mt-4 flex flex-col gap-2 md:hidden">
          {renderWatchlistButtons()}
        </div>
      </div>

      {/* Movie information */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            {movie.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            {releaseYear && <span>{releaseYear}</span>}

            {/* Rating with star icon */}
            {movie.rating && (
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="mr-1 text-yellow-500"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>{movie.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Watchlist buttons on desktop - hidden on small screens */}
        <div className="hidden md:flex md:gap-2">
          {renderWatchlistButtons()}
        </div>

        {/* Overview */}
        {movie.overview && (
          <div>
            <h2 className="mb-2 text-xl font-semibold">Overview</h2>
            <p className="text-gray-700 dark:text-gray-300">{movie.overview}</p>
          </div>
        )}

        {/* Additional details */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Genres */}
          {genres.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-2 text-sm font-semibold uppercase text-gray-500">
                  Genres
                </h3>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm dark:bg-gray-700"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Director & Cast - if available */}
          {(movie.director || movie.cast) && (
            <Card>
              <CardContent className="p-4">
                {movie.director && (
                  <div className="mb-4">
                    <h3 className="mb-2 text-sm font-semibold uppercase text-gray-500">
                      Director
                    </h3>
                    <p>{movie.director}</p>
                  </div>
                )}

                {movie.cast && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase text-gray-500">
                      Cast
                    </h3>
                    <p>{movie.cast}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

  // Helper function to render watchlist buttons
  function renderWatchlistButtons() {
    if (!movie.in_watchlist) {
      return (
        <Button
          onClick={handleToggleWatchlist}
          className="flex items-center gap-2"
          disabled={toggleWatchlistMutation.isPending}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          Add to Watchlist
        </Button>
      );
    }

    return (
      <>
        <Button
          variant="outline"
          onClick={handleToggleWatchlist}
          className="flex items-center gap-2"
          disabled={toggleWatchlistMutation.isPending}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          Remove from Watchlist
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant={movie.status === "TO_WATCH" ? "primary" : "outline"}
            size="sm"
            onClick={() => handleWatchlistStatusChange("to_watch")}
            disabled={updateWatchlistStatusMutation.isPending}
          >
            To Watch
          </Button>
          <Button
            variant={movie.status === "WATCHING" ? "primary" : "outline"}
            size="sm"
            onClick={() => handleWatchlistStatusChange("watched")}
            disabled={updateWatchlistStatusMutation.isPending}
          >
            Watching
          </Button>
          <Button
            variant={movie.status === "WATCHED" ? "primary" : "outline"}
            size="sm"
            onClick={() => handleWatchlistStatusChange("watched")}
            disabled={updateWatchlistStatusMutation.isPending}
          >
            Watched
          </Button>
        </div>
      </>
    );
  }
});

MovieDetails.displayName = "MovieDetails";

export default MovieDetails;
