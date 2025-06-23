-- Create watchlists table
CREATE TABLE IF NOT EXISTS watchlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  movie_id INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('to_watch', 'watched')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Add foreign key constraints
  CONSTRAINT fk_watchlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_watchlist_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  
  -- Ensure unique combination of user_id and movie_id
  CONSTRAINT unique_user_movie UNIQUE(user_id, movie_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_watchlists_user ON watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_movie ON watchlists(movie_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_status ON watchlists(status);

-- Add comment to table
COMMENT ON TABLE watchlists IS 'Stores user movie watchlists with status';
