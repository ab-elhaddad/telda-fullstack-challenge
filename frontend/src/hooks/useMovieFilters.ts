import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { MovieQueryParams } from "@/types/movie";

/**
 * Custom hook to manage movie filters using URL search parameters
 * Provides methods to retrieve and update filters while keeping them in sync with the URL
 */
export function useMovieFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  /**
   * Extract all filter and pagination parameters from the URL
   */
  const filters = useMemo((): MovieQueryParams => {
    const params: MovieQueryParams = {};

    // Pagination
    const page = searchParams.get("page");
    if (page) params.page = parseInt(page);

    // Search and filters
    const search = searchParams.get("search");
    if (search) params.search = search;

    const genre = searchParams.get("genre");
    if (genre) params.genre = genre;

    const year = searchParams.get("year");
    if (year) params.year = parseInt(year);

    const yearFrom = searchParams.get("year_from");
    if (yearFrom) params.year_from = parseInt(yearFrom);

    const yearTo = searchParams.get("year_to");
    if (yearTo) params.year_to = parseInt(yearTo);

    // Rating filters
    const minRating = searchParams.get("min_rating");
    if (minRating) params.min_rating = parseFloat(minRating);

    const maxRating = searchParams.get("max_rating");
    if (maxRating) params.max_rating = parseFloat(maxRating);

    // Sorting
    const sortBy = searchParams.get("sort_by");
    if (sortBy) params.sort_by = sortBy;

    const order = searchParams.get("order") as "ASC" | "DESC" | null;
    if (order) params.order = order;

    return params;
  }, [searchParams]);

  /**
   * Update filters and reflect changes in URL
   * Preserves existing parameters that aren't being updated
   */
  const updateFilters = useCallback(
    (newFilters: MovieQueryParams) => {
      // Start with current URL parameters
      const updatedParams = new URLSearchParams(searchParams);

      // Handle pagination reset when filters change
      const isFilterChange = Object.keys(newFilters).reduce((acc, key) => {
        return (
          acc ||
          (key !== "page" &&
            newFilters[key as keyof MovieQueryParams] !==
              filters[key as keyof MovieQueryParams])
        );
      }, false);

      if (isFilterChange) {
        // Reset to page 1 when filters change
        console.log("reset pagination");
        updatedParams.set("page", "1");
      }

      // Update URL with new filter values
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          updatedParams.set(key, value.toString());
        } else {
          // Remove parameters with empty values
          updatedParams.delete(key);
        }
      });

      console.log(updatedParams.get("page"));
      setSearchParams(updatedParams, { replace: false });
    },
    [searchParams, setSearchParams]
  );

  const resetFilters = useCallback(() => {
    setSearchParams(
      new URLSearchParams({
        page: "1", // Keep page at 1
      })
    );
  }, [setSearchParams]);

  const paginationValues = useMemo(
    () => ({
      currentPage: filters.page || 1,
      pageSize: filters.limit || 10,
    }),
    [filters.page, filters.limit]
  );

  return {
    filters,
    updateFilters,
    resetFilters,
    ...paginationValues,
  };
}
