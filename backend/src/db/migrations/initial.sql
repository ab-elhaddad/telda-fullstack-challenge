-- Initial database schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  avatar_url VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Movies table
CREATE TABLE IF NOT EXISTS movies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  overview TEXT,
  release_year INTEGER,
  genre VARCHAR(100),
  poster VARCHAR(500),
  rating DECIMAL(3,1),
  total_views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create indexes for common search fields
CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title);
CREATE INDEX IF NOT EXISTS idx_movies_release_year ON movies(release_year);
CREATE INDEX IF NOT EXISTS idx_movies_genre ON movies(genre);
CREATE INDEX IF NOT EXISTS idx_movies_rating ON movies(rating);


-- Watchlist (optional - for user saved movies)
CREATE TABLE IF NOT EXISTS watchlist (
  id SERIAL PRIMARY KEY,
  status VARCHAR(20) NOT NULL DEFAULT 'to_watch',
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_movie_watchlist UNIQUE(user_id, movie_id)
);

-- Create indexes for watchlist
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_movie_id ON watchlist(movie_id);
