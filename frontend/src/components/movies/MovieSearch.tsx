import { useState, useRef, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import debounce from "debounce";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

interface MovieSearchProps {
  initialQuery?: string;
  onSearch?: (query: string) => void;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * MovieSearch component that provides debounced search functionality
 * Includes keyboard navigation for accessibility
 */
export default function MovieSearch({
  initialQuery = "",
  onSearch,
  className,
  placeholder = "Search for movies...",
  autoFocus = false,
}: MovieSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Set up debounced search function
  useEffect(() => {
    const handleDebouncedSearch = debounce((searchQuery: string) => {
      if (searchQuery && onSearch) {
        onSearch(searchQuery);
      }
    }, 500);
    
    // Execute debounced search when query changes
    if (query !== undefined) {
      handleDebouncedSearch(query);
    }
    
    // Cleanup
    return () => {
      handleDebouncedSearch.clear();
    };
  }, [query, onSearch]);

  // Handle input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        // Default behavior: navigate to search page if onSearch not provided
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  // Clear search input
  const handleClearInput = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative flex w-full items-center rounded-lg border bg-background transition-all", 
        isFocused && "ring-2 ring-primary ring-offset-2",
        className
      )}
    >
      {/* Search icon */}
      <div className="pointer-events-none absolute left-3 flex h-full items-center text-gray-400">
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
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>

      {/* Input field */}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="flex-1 bg-transparent px-10 py-2.5 text-sm outline-none placeholder:text-gray-500"
        autoFocus={autoFocus}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-label="Search for movies"
      />

      {/* Clear button - only show when there's text */}
      {query && (
        <Button
          type="button"
          onClick={handleClearInput}
          variant="ghost"
          size="icon"
          className="absolute right-10 text-gray-400 hover:text-gray-700"
          aria-label="Clear search"
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
            <line x1="18" x2="6" y1="6" y2="18" />
            <line x1="6" x2="18" y1="6" y2="18" />
          </svg>
        </Button>
      )}

      {/* Search button */}
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="mr-1"
        aria-label="Search"
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
      </Button>
    </form>
  );
}
