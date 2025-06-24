-- Seed data for development environment

-- Create admin user (password: Admin123!)
INSERT INTO users (name, email, username, password, role) 
VALUES (
  'Admin User', 
  'admin@example.com', 
  'admin',
  '$2a$10$GdYhW3MN0aJBF/sP0kQS/OmQxLf71ceVddy7MkD5.nzQ2XrWyBhW2',
  'admin'
) 
ON CONFLICT (email) DO NOTHING;

-- Create regular user (password: User123!)
INSERT INTO users (name, email, username, password) 
VALUES (
  'Regular User', 
  'user@example.com', 
  'user',
  '$2a$10$m.rTCnUhr1QsYNnR2jvkFekSQH9en09zSPmtWYBrqp5v/rjNPgs1i'
) 
ON CONFLICT (email) DO NOTHING;

-- Create sample movies
INSERT INTO movies (id, title, overview, release_year, genre, poster, rating, total_views) 
VALUES 
(
  1,
  'The Shawshank Redemption',
  'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
  1994,
  'Drama',
  'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg',
  9.3,
  2500000
),
(
  2,
  'The Godfather',
  'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
  1972,
  'Crime, Drama',
  'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg',
  9.2,
  2000000
),
(
  3,
  'The Dark Knight',
  'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
  2008,
  'Action, Crime, Drama',
  'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg',
  9.0,
  2300000
),
(
  4,
  'Pulp Fiction',
  'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
  1994,
  'Crime, Drama',
  'https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg',
  8.9,
  1800000
),
(
  5,
  'Forrest Gump',
  'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.',
  1994,
  'Drama, Romance',
  'https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg',
  8.8,
  1750000
),
(
  6,
  'The Matrix',
  'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
  1999,
  'Action, Sci-Fi',
  'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg',
  8.7,
  1900000
),
(
  7,
  'Inception',
  'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
  2010,
  'Action, Adventure, Sci-Fi',
  'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg',
  8.8,
  1850000
),
(
  8,
  'Parasite',
  'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
  2019,
  'Drama, Thriller',
  'https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_.jpg',
  8.5,
  1500000
),
(
  9,
  'Interstellar',
  'A team of explorers travel through a wormhole in space in an attempt to ensure humanity''s survival.',
  2014,
  'Adventure, Drama, Sci-Fi',
  'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
  8.6,
  1700000
),
(   
  10,
  'The Prestige',
  'After a tragic accident, two stage magicians engage in a battle to create the ultimate illusion while sacrificing everything they have to outwit each other.',
  2006,
  'Drama, Mystery, Sci-Fi',
  'https://m.media-amazon.com/images/M/MV5BMjA4NDI0MTIxNF5BMl5BanBnXkFtZTYwNTM0MzY2._V1_.jpg',
  8.5,
  1400000
)
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
