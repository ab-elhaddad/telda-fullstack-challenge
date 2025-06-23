import { useState } from "react";
import { useMovieSearch } from "@/services/queries/movieQueries";
import MovieSearchInput from "@/components/search/MovieSearchInput";
import Spinner from "@/components/ui/spinner";

function MovieSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, isError, error } = useMovieSearch(searchQuery);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Search Movies</h1>

      <div className="mb-8 max-w-xl">
        <MovieSearchInput
          onSearch={handleSearch}
          placeholder="Search for movies..."
          delay={500} // 500ms debounce delay
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Search is performed after you stop typing for at least 500ms
        </p>
      </div>

      {/* Loading state */}
      {isLoading && searchQuery.length >= 2 && (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <p>Error: {(error as Error)?.message || "Failed to search movies"}</p>
        </div>
      )}

      {/* Empty state */}
      {data?.movies?.length === 0 && searchQuery.length >= 2 && !isLoading && (
        <div className="rounded-md bg-muted p-8 text-center">
          <h3 className="text-xl font-medium">No results found</h3>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search terms or browse all movies instead
          </p>
        </div>
      )}

      {/* Results */}
      {data && data?.movies?.length > 0 && data.pagination && (
        <div>
          <h2 className="mb-4 text-xl font-semibold">
            Found {data.pagination.total}{" "}
            {data.pagination.total === 1 ? "movie" : "movies"}
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data?.movies.map((movie) => (
              <div
                key={movie.id}
                className="overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md"
              >
                {movie.poster ? (
                  <img
                    src={movie.poster}
                    alt={`${movie.title} poster`}
                    className="aspect-[2/3] w-full object-cover"
                  />
                ) : (
                  <div className="aspect-[2/3] w-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No poster</span>
                  </div>
                )}

                <div className="p-4">
                  <h3 className="font-semibold line-clamp-1">{movie.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {movie.release_year || "Unknown year"}
                  </p>
                  {movie.genre && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {movie.genre
                        .split(",")
                        .slice(0, 3)
                        .map((genre: string) => (
                          <span
                            key={genre}
                            className="inline-flex rounded-full bg-primary/10 px-2 py-1 text-xs text-primary-foreground"
                          >
                            {genre.trim()}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination controls would go here */}
        </div>
      )}
    </div>
  );
}

export default MovieSearchPage;
