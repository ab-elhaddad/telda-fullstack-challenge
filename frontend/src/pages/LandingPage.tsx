import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useMovieSearch } from "@/services/queries/movieQueries";
import MovieGrid from "@/components/movies/MovieGrid";
import MovieSearch from "@/components/movies/MovieSearch";
import MovieFilter, { Genre } from "@/components/movies/MovieFilter";
import { Pagination } from "@/components/ui/pagination";
import { notificationService } from "@/services/notificationService";
import { Button } from "@/components/ui/button";
import debounce from "debounce";
import ErrorBoundary from "@/components/error/ErrorBoundary";

// Placeholder genres - should be fetched from backend
const PLACEHOLDER_GENRES: Genre[] = [
  { id: "1", name: "Action" },
  { id: "2", name: "Adventure" },
  { id: "3", name: "Animation" },
  { id: "4", name: "Comedy" },
  { id: "5", name: "Crime" },
  { id: "6", name: "Documentary" },
  { id: "7", name: "Drama" },
  { id: "8", name: "Fantasy" },
  { id: "9", name: "Horror" },
  { id: "10", name: "Mystery" },
  { id: "11", name: "Romance" },
  { id: "12", name: "Science Fiction" },
  { id: "13", name: "Thriller" },
];

/**
 * Landing page component that integrates search, filtering, and movie browsing
 */
export default function LandingPage() {
  // URL search params to preserve filters in URL
  const [searchParams, setSearchParams] = useSearchParams();

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    searchParams.getAll("genres") || []
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );

  // Debounce search query to avoid excessive API calls
  const debouncedQuery = debounce(() => searchQuery, 500);

  // Prepare query parameters
  const queryParams = {
    query: debouncedQuery,
    page: currentPage,
    limit: 9,
    genres: selectedGenres.length > 0 ? selectedGenres.join(",") : undefined,
  };

  // Fetch movies with React Query
  const { data, isLoading, isError, error } = useMovieSearch(queryParams);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle genre filter change
  const handleGenreChange = (genres: string[]) => {
    setSelectedGenres(genres);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (searchQuery) params.set("q", searchQuery);
    selectedGenres.forEach((genre) => params.append("genres", genre));
    if (currentPage > 1) params.set("page", currentPage.toString());

    setSearchParams(params);
  }, [searchQuery, selectedGenres, currentPage, setSearchParams]);

  // Show error notification if search fails
  useEffect(() => {
    if (isError && error) {
      notificationService.error("Failed to load movies. Please try again.");
    }
  }, [isError, error]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Hero section */}
      <section className="mb-12">
        <div className="mx-auto mb-6 max-w-2xl text-center">
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
            Discover your next favorite movie
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Search, browse, and keep track of movies you want to watch
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <MovieSearch
            initialQuery={searchQuery}
            onSearch={handleSearch}
            className="shadow-md"
            autoFocus
          />
        </div>
      </section>

      {/* Filters and movie grid */}
      <section>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">
            {searchQuery
              ? `Search results for "${searchQuery}"`
              : "Popular Movies"}
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            {/* Genre filter dropdown */}
            <MovieFilter
              genres={PLACEHOLDER_GENRES}
              selectedGenres={selectedGenres}
              onGenreChange={handleGenreChange}
            />
          </div>
        </div>

        {/* Movie grid with error boundary */}
        <ErrorBoundary
          fallback={
            <div className="my-8 text-center">
              <h3 className="mb-2 text-lg font-semibold">
                Something went wrong loading movies
              </h3>
              <p className="mb-4 text-gray-600">
                We're having trouble fetching these movies right now
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Try again
              </Button>
            </div>
          }
        >
          <MovieGrid
            movies={data?.movies || []}
            isLoading={isLoading}
            className="mb-8"
          />
        </ErrorBoundary>

        {/* Pagination */}
        {data?.pagination && data.pagination.total > 0 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(
                data.pagination.total / data.pagination.limit
              )}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </section>
    </div>
  );
}
