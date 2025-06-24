import { useState, useEffect } from "react";
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
import { Movie } from "@/types/movie";

export function MoviesPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch movies based on search query or popular movies
  const { data, isLoading, isError } = useQuery({
    queryKey: ["movies", debouncedQuery, page],
    queryFn: () =>
      debouncedQuery
        ? movieService.searchMovies(debouncedQuery, page)
        : movieService.getMovies(page),
  });

  const movies = data?.data.movies;
  const pagination = data?.data.pagination;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleNextPage = () => {
    if (pagination && page < pagination.pages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">
        {debouncedQuery
          ? `Search Results for "${debouncedQuery}"`
          : "Popular Movies"}
      </h1>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <input
            type="search"
            className="w-full md:w-96 p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="Search for movies..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

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
          {pagination && pagination.pages > 0 && (
            <div className="flex justify-center items-center mt-8 gap-4">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className={`px-4 py-2 rounded-md ${page === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-primary text-white hover:bg-primary/90"}`}
              >
                Previous
              </button>
              <span className="text-sm">
                Page {page} of {pagination.pages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={page >= pagination.pages}
                className={`px-4 py-2 rounded-md ${page >= pagination.pages ? "bg-gray-300 cursor-not-allowed" : "bg-primary text-white hover:bg-primary/90"}`}
              >
                Next
              </button>
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
