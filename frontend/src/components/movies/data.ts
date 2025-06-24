// Generate a list of years from 1950 to current year + 5
const currentYear = new Date().getFullYear();
export const years = Array.from(
  { length: currentYear - 1950 + 5 + 1 },
  (_, i) => currentYear + 5 - i
);

// Sort options based on backend support
export const sortOptions = [
  { label: "Newest", value: "created_at:DESC" },
  { label: "Oldest", value: "created_at:ASC" },
  { label: "Title (A-Z)", value: "title:ASC" },
  { label: "Title (Z-A)", value: "title:DESC" },
  { label: "Rating (High-Low)", value: "rating:DESC" },
  { label: "Rating (Low-High)", value: "rating:ASC" },
  { label: "Year (New-Old)", value: "release_year:DESC" },
  { label: "Year (Old-New)", value: "release_year:ASC" },
];

// Common genres in movies
export const genres = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
];
