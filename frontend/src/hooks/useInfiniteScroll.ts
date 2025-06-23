import { useEffect, useRef, useState, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  initialPage?: number;
}

/**
 * Custom hook for implementing infinite scrolling functionality
 * Optimized to prevent unnecessary re-renders and API calls
 * 
 * @param loadMore Function to call when more items need to be loaded
 * @param hasMore Boolean indicating if there are more items to load
 * @param isLoading Boolean indicating if data is currently being loaded
 * @param options Configuration options
 * @returns Object containing a reference to attach to the sentinel element and the current page
 */
export function useInfiniteScroll(
  loadMore: () => void,
  hasMore: boolean,
  isLoading: boolean,
  options: UseInfiniteScrollOptions = {}
) {
  // Default options
  const {
    threshold = 0.1,
    rootMargin = '20px',
    initialPage = 1
  } = options;
  
  // Track current page for pagination
  const [page, setPage] = useState<number>(initialPage);
  
  // Sentinel element ref that will be observed for intersection
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  
  // Use a ref to track loading state to prevent race conditions
  const loadingRef = useRef(isLoading);
  
  // Update the loading ref when isLoading changes
  useEffect(() => {
    loadingRef.current = isLoading;
  }, [isLoading]);

  // Increment page and trigger loadMore when sentinel becomes visible
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      
      // Only load more if:
      // 1. The sentinel element is intersecting the viewport
      // 2. There are more items to load
      // 3. We're not already loading items
      if (entry?.isIntersecting && hasMore && !loadingRef.current) {
        setPage(prevPage => prevPage + 1);
        loadMore();
      }
    },
    [loadMore, hasMore]
  );

  // Set up the intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null, // viewport is the root
      rootMargin,
      threshold,
    });

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    // Clean up observer on unmount
    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
      observer.disconnect();
    };
  }, [handleObserver, rootMargin, threshold]);

  return { sentinelRef, page };
}
