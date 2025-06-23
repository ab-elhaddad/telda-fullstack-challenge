-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
  id SERIAL PRIMARY KEY,
  tmdb_id INTEGER UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  overview TEXT,
  poster_path VARCHAR(255),
  release_date DATE,
  genres JSONB,
  rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title);
CREATE INDEX IF NOT EXISTS idx_movies_release_date ON movies(release_date);

-- Add full-text search index for better search performance
CREATE INDEX IF NOT EXISTS idx_movies_fulltext ON movies USING GIN (to_tsvector('english', title || ' ' || COALESCE(overview, '')));

-- Add comment to table
COMMENT ON TABLE movies IS 'Stores movie information from TMDB API';
