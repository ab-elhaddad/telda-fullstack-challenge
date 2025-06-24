import { useState, useEffect, memo } from "react";
import { MovieQueryParams } from "@/types/movie";
import debounce from "debounce";
import { genres, sortOptions, years } from "./data";

interface MovieFilterBarProps {
  onFilterChange: (filters: MovieQueryParams) => void;
  resetFilters: () => void;
  initialFilters: MovieQueryParams;
  className?: string;
}

// Use React.memo to prevent unnecessary re-renders
export const MovieFilterBar = memo(function MovieFilterBar({
  onFilterChange,
  resetFilters,
  initialFilters,
  className = "",
}: MovieFilterBarProps) {
  const [filters, setFilters] = useState<MovieQueryParams>(initialFilters);
  console.log({ filters });

  // Track rating range separately for the UI display
  const [minRating, setMinRating] = useState<number>(
    initialFilters.min_rating || 0
  );
  const [maxRating, setMaxRating] = useState<number>(
    initialFilters.max_rating || 10
  );

  // Debounce filter changes to avoid too many API calls
  useEffect(() => {
    const debouncedFilter = debounce(() => {
      delete filters.page;
      onFilterChange(filters);
    }, 500);

    debouncedFilter();

    return () => debouncedFilter.clear();
  }, [filters, onFilterChange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters({ ...filters, genre: value === "all" ? undefined : value });
  };

  const handleSingleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "all") {
      const newFilters = { ...filters };
      delete newFilters.year;
      setFilters(newFilters);
    } else {
      setFilters({ ...filters, year: parseInt(value) });
    }
  };

  const handleMinRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setMinRating(value);
    setFilters({ ...filters, min_rating: value });
  };

  const handleMaxRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setMaxRating(value);
    setFilters({ ...filters, max_rating: value });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const [sort_by, order] = value.split(":");
    setFilters({ ...filters, sort_by, order: order as "ASC" | "DESC" });
  };

  return (
    <div
      className={`bg-gray-900/50 border border-gray-800 rounded-md p-4 mb-6 ${className}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
        {/* Search Input */}
        <div>
          <label htmlFor="search" className="block mb-2 text-sm">
            Search Movies
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
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
              id="search"
              placeholder="Title, director, actors..."
              className="w-full pl-10 py-2 px-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-primary focus:outline-none"
              value={filters.search || ""}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Genre Filter */}
        <div>
          <label htmlFor="genre" className="block mb-2 text-sm">
            Genre
          </label>
          <select
            id="genre"
            value={filters.genre || "all"}
            onChange={handleGenreChange}
            className="w-full py-2 px-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="all">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div>
          <label htmlFor="year" className="block mb-2 text-sm">
            Release Year
          </label>
          <select
            id="year"
            value={(filters.year || "all").toString()}
            onChange={handleSingleYearChange}
            className="w-full py-2 px-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="all">Any Year</option>
            {years.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label htmlFor="sort" className="block mb-2 text-sm">
            Sort By
          </label>
          <select
            id="sort"
            value={`${filters.sort_by || "created_at"}:${filters.order || "DESC"}`}
            onChange={handleSortChange}
            className="w-full py-2 px-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-primary focus:outline-none"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="mt-6">

        <div className="mb-2 text-sm flex justify-between">
          <label htmlFor="min-rating">Min Rating: {minRating}</label>
          <label htmlFor="max-rating">Max Rating: {maxRating}</label>
        </div>
        <div className="flex gap-4 items-center">
          <input
            id="min-rating"
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={minRating}
            onChange={handleMinRatingChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer focus:ring-0 border-none"
          />
          <input
            id="max-rating"
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={maxRating}
            onChange={handleMaxRatingChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>10</span>
        </div>
        
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={resetFilters}
            className="bg-red-600 hover:bg-red-700 text-white py-1 px-4 rounded text-sm transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
});
