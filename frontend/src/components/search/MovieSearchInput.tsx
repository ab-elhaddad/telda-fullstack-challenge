import { useState, useEffect, useCallback } from 'react';
import debounce from 'debounce';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface MovieSearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
  delay?: number;
}

function MovieSearchInput({
  onSearch,
  placeholder = 'Search movies...',
  className = '',
  initialValue = '',
  delay = 500
}: MovieSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  
  // Create debounced search handler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      onSearch(query);
    }, delay),
    [delay, onSearch]
  );
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };
  
  // Clean up debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.clear();
    };
  }, [debouncedSearch]);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleChange}
        className="pl-9"
      />
    </div>
  );
}

export default MovieSearchInput;
