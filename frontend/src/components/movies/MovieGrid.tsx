import { memo, useMemo } from "react";
import MovieCard from "./MovieCard";
import { Movie } from "@/types/movie";
import { cn } from "@/utils/cn";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface MovieGridProps {
  movies: Movie[];
  className?: string;
  isLoading?: boolean;
  showWatchlistButton?: boolean;
}

/**
 * MovieGrid component for displaying movies in a responsive grid layout
 * Optimized with memo to prevent unnecessary re-renders
 * Responsive grid that adjusts to different screen sizes
 */
const MovieGrid = memo(
  ({
    movies,
    className,
    isLoading = false,
    showWatchlistButton = true,
  }: MovieGridProps) => {
    // Media queries for responsive layouts
    const isMobile = useMediaQuery("(max-width: 640px)");
    const isTablet = useMediaQuery(
      "(min-width: 641px) and (max-width: 1024px)"
    );

    // Calculate grid columns based on screen size
    const gridColumns = useMemo(() => {
      if (isMobile) return 1;
      if (isTablet) return 2;
      return 3; // Desktop default
    }, [isMobile, isTablet]);

    // Loading skeleton
    if (isLoading) {
      return (
        <div
          className={cn(
            "grid gap-6",
            {
              "grid-cols-1": gridColumns === 1,
              "grid-cols-2": gridColumns === 2,
              "grid-cols-3": gridColumns === 3,
            },
            className
          )}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
              style={{ height: "400px" }}
            />
          ))}
        </div>
      );
    }

    // No movies available
    if (!movies || movies.length === 0) {
      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-gray-500 dark:text-gray-400"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-medium">No movies found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Try changing your search or filters to find what you're looking for.
          </p>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "grid gap-6",
          {
            "grid-cols-1": gridColumns === 1,
            "grid-cols-2": gridColumns === 2,
            "grid-cols-3": gridColumns === 3,
          },
          className
        )}
      >
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            showWatchlistButton={showWatchlistButton}
          />
        ))}
      </div>
    );
  }
);

MovieGrid.displayName = "MovieGrid";

export default MovieGrid;
