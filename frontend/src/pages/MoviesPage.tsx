import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import movieService from "@/services/movie.service";
import {
  Card,
  CardImage,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Movie } from "@/types/movie";
import { MovieFilterBar } from "@/components/movies/MovieFilterBar";
import { useMovieFilters } from "@/hooks/useMovieFilters";

export function MoviesPage() {
  const { filters, updateFilters, resetFilters, currentPage } =
    useMovieFilters();

  const effectiveFilters = useMemo(
    () => ({
      ...filters,
      limit: filters.limit || 12,
    }),
    [filters]
  );

  const {
    data: responseData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["movies", effectiveFilters],
    queryFn: () => movieService.getMovies(effectiveFilters),
  });

  const movies = responseData?.data?.movies;
  const pagination = responseData?.data?.pagination;

  const handleFilterChange = useCallback(
    (newFilters: typeof filters) => {
      console.log("filter changes");
      updateFilters(newFilters);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [updateFilters]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      console.log("page change", newPage);
      updateFilters({ ...filters, page: newPage });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [updateFilters]
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">
        {filters.search ? `Search Results for "${filters.search}"` : "Movies"}
      </h1>

      {/* Advanced Filter Bar */}
      <MovieFilterBar
        initialFilters={filters}
        onFilterChange={handleFilterChange}
        resetFilters={resetFilters}
        className="mb-8"
      />

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4"
          role="alert"
        >
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">
            Failed to load movies. Please try again later.
          </span>
        </div>
      )}

      {/* Movies grid */}
      {movies && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie: Movie) => (
              <Link to={`/movies/${movie.id}`} key={movie.id}>
                <Card className="h-full hover:shadow-md transition-shadow duration-200">
                  <CardImage
                    src={movie.poster || "/placeholder-poster.jpg"}
                    alt={movie.title}
                    aspectRatio="portrait"
                  />
                  <CardContent>
                    <CardTitle className="mb-2 line-clamp-1">
                      {movie.title}
                    </CardTitle>
                    <div className="mb-2 text-sm text-gray-500">
                      {movie.release_year || "Release date unknown"}
                    </div>
                    {movie.rating}
                    <CardDescription className="mt-2 line-clamp-3">
                      {movie.overview}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {!isLoading && !isError && movies && pagination && (
            <div className="mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                showPageNumbers={true}
                siblingCount={1}
                className="my-8"
              />
              <div className="text-center text-sm text-gray-400 mt-2">
                Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} movies
              </div>
            </div>
          )}
        </>
      )}

      {/* No results */}
      {movies && movies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">
            No movies found. Try a different search.
          </p>
        </div>
      )}
    </div>
  );
}
