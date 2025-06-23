-- Seed data for development environment

-- Create admin user (password: Admin123!)
INSERT INTO users (name, email, password, role) 
VALUES (
  'Admin User', 
  'admin@example.com', 
  '$2a$10$GdYhW3MN0aJBF/sP0kQS/OmQxLf71ceVddy7MkD5.nzQ2XrWyBhW2',
  'admin'
) 
ON CONFLICT (email) DO NOTHING;

-- Create regular user (password: User123!)
INSERT INTO users (name, email, password) 
VALUES (
  'Regular User', 
  'user@example.com', 
  '$2a$10$m.rTCnUhr1QsYNnR2jvkFekSQH9en09zSPmtWYBrqp5v/rjNPgs1i'
) 
ON CONFLICT (email) DO NOTHING;

-- Create sample movies
INSERT INTO movies (title, director, release_year, genre, poster, rating) 
VALUES 
(
  'The Shawshank Redemption',
  'Frank Darabont',
  1994,
  'Drama',
  'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg',
  9.3
),
(
  'The Godfather',
  'Francis Ford Coppola',
  1972,
  'Crime, Drama',
  'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg',
  9.2
),
(
  'The Dark Knight',
  'Christopher Nolan',
  2008,
  'Action, Crime, Drama',
  'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg',
  9.0
),
(
  'Pulp Fiction',
  'Quentin Tarantino',
  1994,
  'Crime, Drama',
  'https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg',
  8.9
),
(
  'Forrest Gump',
  'Robert Zemeckis',
  1994,
  'Drama, Romance',
  'https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg',
  8.8
),
(
  'The Matrix',
  'Lana Wachowski, Lilly Wachowski',
  1999,
  'Action, Sci-Fi',
  'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg',
  8.7
),
(
  'Inception',
  'Christopher Nolan',
  2010,
  'Action, Adventure, Sci-Fi',
  'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg',
  8.8
),
(
  'Parasite',
  'Bong Joon Ho',
  2019,
  'Drama, Thriller',
  'https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_.jpg',
  8.5
),
(
  'Interstellar',
  'Christopher Nolan',
  2014,
  'Adventure, Drama, Sci-Fi',
  'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
  8.6
),
(
  'The Prestige',
  'Christopher Nolan',
  2006,
  'Drama, Mystery, Sci-Fi',
  'https://m.media-amazon.com/images/M/MV5BMjA4NDI0MTIxNF5BMl5BanBnXkFtZTYwNTM0MzY2._V1_.jpg',
  8.5
)
ON CONFLICT DO NOTHING;

-- Add some comments
INSERT INTO comments (movie_id, user_id, content, rating)
SELECT 
  m.id, 
  u.id, 
  'This is one of the best movies I have ever seen!', 
  10
FROM movies m, users u
WHERE m.title = 'The Shawshank Redemption' AND u.email = 'user@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO comments (movie_id, user_id, content, rating)
SELECT 
  m.id, 
  u.id, 
  'A masterpiece of storytelling and cinematography.', 
  9
FROM movies m, users u
WHERE m.title = 'The Godfather' AND u.email = 'admin@example.com'
ON CONFLICT DO NOTHING;

-- Add items to watchlist
INSERT INTO watchlist (user_id, movie_id)
SELECT 
  u.id, 
  m.id
FROM users u, movies m
WHERE u.email = 'user@example.com' AND m.title = 'Inception'
ON CONFLICT DO NOTHING;

INSERT INTO watchlist (user_id, movie_id)
SELECT 
  u.id, 
  m.id
FROM users u, movies m
WHERE u.email = 'user@example.com' AND m.title = 'The Matrix'
ON CONFLICT DO NOTHING;
