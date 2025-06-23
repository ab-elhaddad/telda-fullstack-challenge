import { useState, useEffect, useRef, memo } from 'react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';

export interface Genre {
  id: string | number;
  name: string;
}

interface MovieFilterProps {
  genres: Genre[];
  selectedGenres: string[];
  onGenreChange: (genres: string[]) => void;
  className?: string;
}

/**
 * MovieFilter component for filtering movies by genre
 * Includes multi-select functionality and mobile-friendly design
 */
const MovieFilter = memo(({ 
  genres, 
  selectedGenres, 
  onGenreChange, 
  className 
}: MovieFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle genre selection
  const toggleGenre = (genreId: string) => {
    const isSelected = selectedGenres.includes(genreId);
    
    if (isSelected) {
      onGenreChange(selectedGenres.filter(id => id !== genreId));
    } else {
      onGenreChange([...selectedGenres, genreId]);
    }
  };

  // Clear all selected genres
  const clearFilters = () => {
    onGenreChange([]);
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Filter button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
        aria-expanded={isOpen}
        aria-controls="genre-filter-dropdown"
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
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        <span>
          Filter
          {selectedGenres.length > 0 && ` (${selectedGenres.length})`}
        </span>
      </Button>

      {/* Filter dropdown */}
      {isOpen && (
        <div
          id="genre-filter-dropdown"
          className="absolute z-10 mt-2 min-w-[200px] max-w-[280px] rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium">Filter by Genre</h3>
            {selectedGenres.length > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="flex max-h-[240px] flex-col gap-2 overflow-y-auto">
            {genres.length === 0 ? (
              <p className="text-xs text-gray-500">No genres available</p>
            ) : (
              genres.map((genre) => (
                <div key={genre.id} className="flex items-center">
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={selectedGenres.includes(String(genre.id))}
                      onChange={() => toggleGenre(String(genre.id))}
                    />
                    {genre.name}
                  </label>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Selected genres chips (visible on larger screens) */}
      <div className="mt-2 hidden flex-wrap gap-2 sm:flex">
        {selectedGenres.length > 0 &&
          genres
            .filter(genre => selectedGenres.includes(String(genre.id)))
            .map(genre => (
              <div 
                key={genre.id} 
                className="flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs dark:bg-gray-700"
              >
                <span>{genre.name}</span>
                <button
                  onClick={() => toggleGenre(String(genre.id))}
                  className="ml-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  aria-label={`Remove ${genre.name} filter`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))
        }
      </div>
    </div>
  );
});

MovieFilter.displayName = "MovieFilter";

export default MovieFilter;
