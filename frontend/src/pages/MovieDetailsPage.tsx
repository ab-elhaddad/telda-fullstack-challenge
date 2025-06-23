import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import movieService from '@/services/movie.service';
import { WatchStatus } from '@/types/movie.types';
import { useModal } from '@/components/ui/modal';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';

export function MovieDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const movieId = parseInt(id || '0', 10);
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<WatchStatus>(WatchStatus.PLAN_TO_WATCH);
  const { isAuthenticated } = useAuthStore();
  const { isOpen, openModal, closeModal } = useModal();
  const { showToast } = useToast();
  
  // Fetch movie details
  const { data: movie, isLoading, isError } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => movieService.getMovieById(movieId),
    enabled: movieId > 0
  });
  
  // Add to watchlist mutation
  const { mutate: addToWatchlist, isPending: isAddingToWatchlist } = useMutation({
    mutationFn: () => movieService.addToWatchlist(movieId, selectedStatus),
    onSuccess: () => {
      closeModal();
      showToast('Movie added to your watchlist!', 'success');
    },
    onError: (error) => {
      showToast(`Failed to add movie: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  });

  // Calculate runtime in hours and minutes
  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Format release date
  const formatReleaseDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value as WatchStatus);
  };

  const handleAddToWatchlist = () => {
    if (!isAuthenticated) {
      showToast('Please sign in to add movies to your watchlist', 'info');
      navigate('/login');
      return;
    }
    
    openModal();
  };

  const confirmAddToWatchlist = () => {
    addToWatchlist();
  };

  // Fallback if movie ID is invalid
  if (!movieId) {
    navigate('/movies');
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
          <p className="font-bold">Error</p>
          <p>Failed to load movie details. Please try again later.</p>
          <button 
            onClick={() => navigate('/movies')}
            className="mt-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container mx-auto py-10 px-4">
        <p className="text-center">Movie not found</p>
        <button 
          onClick={() => navigate('/movies')}
          className="mt-4 block mx-auto bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Back to Movies
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Backdrop Image */}
      <div 
        className="w-full h-96 bg-cover bg-center rounded-lg mb-8 relative"
        style={{ 
          backgroundImage: movie.backdrop_path 
            ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` 
            : 'none',
          backgroundColor: movie.backdrop_path ? 'transparent' : '#1f2937' 
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent rounded-lg"></div>
        
        {/* Back button */}
        <button
          onClick={() => navigate('/movies')}
          className="absolute top-4 left-4 flex items-center text-white bg-black/50 hover:bg-black/70 px-3 py-2 rounded-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Poster */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <img
            src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder-poster.jpg'}
            alt={movie.title}
            className="rounded-lg shadow-md w-full object-cover aspect-[2/3]"
          />
          
          {/* Add to Watchlist Button */}
          <button
            onClick={handleAddToWatchlist}
            className="w-full mt-6 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-md flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Add to Watchlist
          </button>
        </div>
        
        {/* Details */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
          
          {movie.tagline && (
            <p className="text-xl text-gray-500 italic mb-6">{movie.tagline}</p>
          )}
          
          {/* Meta details */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-sm">
            {movie.release_date && (
              <div>
                <span className="font-semibold">Release Date:</span> {formatReleaseDate(movie.release_date)}
              </div>
            )}
            
            {movie.runtime && (
              <div>
                <span className="font-semibold">Runtime:</span> {formatRuntime(movie.runtime)}
              </div>
            )}
            
            <div>
              <span className="font-semibold">Rating:</span> {movie.vote_average.toFixed(1)}/10 ({movie.vote_count} votes)
            </div>
          </div>
          
          {/* Genres */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Genres</h2>
            <div className="flex flex-wrap gap-2">
              {movie.genres.map(genre => (
                <span 
                  key={genre.id}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
          
          {/* Overview */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Overview</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{movie.overview}</p>
          </div>
        </div>
      </div>
      
      {/* Watchlist modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={closeModal}
        title="Add to Watchlist"
      >
        <div className="py-4">
          <label className="block mb-2 font-medium">Select status:</label>
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary mb-6"
          >
            <option value={WatchStatus.PLAN_TO_WATCH}>Plan to Watch</option>
            <option value={WatchStatus.WATCHING}>Currently Watching</option>
            <option value={WatchStatus.COMPLETED}>Completed</option>
            <option value={WatchStatus.ON_HOLD}>On Hold</option>
            <option value={WatchStatus.DROPPED}>Dropped</option>
          </select>
          
          <div className="flex justify-end gap-3">
            <button 
              onClick={closeModal}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={confirmAddToWatchlist}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center"
              disabled={isAddingToWatchlist}
            >
              {isAddingToWatchlist ? (
                <>
                  <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
                  Adding...
                </>
              ) : (
                'Add to Watchlist'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
