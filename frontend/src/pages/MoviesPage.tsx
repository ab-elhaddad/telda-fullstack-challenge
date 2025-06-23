import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Movie } from '@/types/movie.types';
import movieService from '@/services/movie.service';
import { Card, CardImage, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

export function MoviesPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

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
    queryKey: ['movies', debouncedQuery, page],
    queryFn: () => 
      debouncedQuery 
        ? movieService.searchMovies(debouncedQuery, page)
        : movieService.getPopularMovies(page)
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleNextPage = () => {
    if (data && page < data.totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  // Function to format release date
  const formatReleaseDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to render rating stars
  const renderRating = (rating: number) => {
    const maxStars = 5;
    const starPercentage = (rating / 10) * maxStars;
    const fullStars = Math.floor(starPercentage);
    const hasHalfStar = starPercentage - fullStars >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        
        {hasHalfStar && (
          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="half-star-gradient">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path fill="url(#half-star-gradient)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
        
        {[...Array(maxStars - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        
        <span className="ml-1 text-gray-500 text-sm">{rating.toFixed(1)}/10</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">
        {debouncedQuery ? `Search Results for "${debouncedQuery}"` : 'Popular Movies'}
      </h1>
      
      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">Failed to load movies. Please try again later.</span>
        </div>
      )}
      
      {/* Movies grid */}
      {data && data.movies && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.movies.map((movie: Movie) => (
              <Link to={`/movies/${movie.id}`} key={movie.id}>
                <Card className="h-full hover:shadow-md transition-shadow duration-200">
                  <CardImage 
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder-poster.jpg'} 
                    alt={movie.title}
                    aspectRatio="portrait"
                  />
                  <CardContent>
                    <CardTitle className="mb-2 line-clamp-1">{movie.title}</CardTitle>
                    <div className="mb-2 text-sm text-gray-500">
                      {movie.release_date ? formatReleaseDate(movie.release_date) : 'Release date unknown'}
                    </div>
                    {renderRating(movie.vote_average)}
                    <CardDescription className="mt-2 line-clamp-3">{movie.overview}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          {/* Pagination */}
          {data.totalPages > 0 && (
            <div className="flex justify-center items-center mt-8 gap-4">
              <button 
                onClick={handlePrevPage}
                disabled={page === 1}
                className={`px-4 py-2 rounded-md ${page === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90'}`}
              >
                Previous
              </button>
              <span className="text-sm">
                Page {page} of {data.totalPages}
              </span>
              <button 
                onClick={handleNextPage}
                disabled={page >= data.totalPages}
                className={`px-4 py-2 rounded-md ${page >= data.totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90'}`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
      
      {/* No results */}
      {data && data.movies && data.movies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No movies found. Try a different search.</p>
        </div>
      )}
    </div>
  );
}
