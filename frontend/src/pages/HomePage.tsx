import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieService } from "@/services/movie.service";
import { Card, CardImage, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function HomePage() {
  const {
    data: moviesResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["popularMovies"],
    queryFn: () => movieService.getMovies(1, 5),
  });

  const popularMovies = moviesResponse?.data?.movies || [];

  return (
    <div className="container mx-auto px-4 py-8 space-y-16">
      {/* Hero section with gradient background */}
      <section className="relative overflow-hidden rounded-2xl hero-gradient py-20 px-6 text-white">
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Discover & Track Your Favorite Movies
          </h1>
          <p className="text-xl mb-10 opacity-90">
            Find new films, build your watchlist, and keep track of everything
            you want to watch in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/movies">
              <Button size="lg">Browse Movies</Button>
            </Link>
            <Link to="/register">
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20"
              >
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-white/10"></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5"></div>
      </section>

      {/* Popular movies section */}
      <section className="py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Popular Movies</h2>
          <Link to="/movies">
            <Button
              variant="ghost"
              rightIcon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              }
            >
              View all
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : isError ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
            <p className="font-bold">Error</p>
            <p>Failed to load popular movies. Please try again later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {popularMovies.map((movie) => (
              <Link
                to={`/movies/${movie.id}`}
                key={movie.id}
                className="block h-full"
              >
                <Card className="h-full transition-all hover:shadow-md hover:translate-y-[-4px]">
                  <CardImage
                    src={
                      movie.poster ? movie.poster : "/placeholder-poster.jpg"
                    }
                    alt={movie.title}
                    aspectRatio="portrait"
                    className="transition-transform hover:scale-105"
                  />
                  <CardContent>
                    <CardTitle className="line-clamp-1">
                      {movie.title}
                    </CardTitle>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-gray-500">
                        {movie.release_year}
                      </p>
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 text-yellow-400 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-medium">
                          {movie.rating || "N/A"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Features section */}
      <section className="py-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">
          Everything You Need For Your Movie Journey
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center p-6">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Discover Movies</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Browse a vast collection of movies from various genres and time
              periods.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Your Watchlist</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage your personal watchlist to keep track of movies
              you want to see.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Account</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Keep your movie preferences safe with our secure authentication
              system.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
