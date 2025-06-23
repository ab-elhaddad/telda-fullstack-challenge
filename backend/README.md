# Movie App Backend

Node.js Express backend API for the Movie Application with PostgreSQL database.

## Features

- **Movies**: Browse, search, and filter movies
  - Advanced search across multiple fields (title, director, genre)
  - Filter by year ranges, rating ranges, and genres
  - Sorting by various fields (title, director, release year, rating)
  - Pagination with customizable limit and offset
- **Authentication**: Secure JWT-based authentication system
  - Stateless access tokens and refresh tokens
  - HttpOnly cookies for secure token storage
  - Login via email or username
  - Profile management with bio and profile picture
- **Comments**: Add and view comments on movies
- **Watchlists**: Create and manage personal movie watchlists
  - Track watch status ('to_watch' or 'watched')
  - Filter watchlist by status
  - Sort watchlist by various fields (added date, movie title, rating)
  - Pagination with full metadata
- **File Uploads**: API endpoint for uploading profile images

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon Postgres)
- **Authentication**: JWT with refresh tokens in HttpOnly cookies
- **Validation**: Joi
- **Testing**: Jest with Supertest
- **File Uploads**: Multer (with cloud storage blueprint)
- **Logging**: Winston

## Getting Started

### Prerequisites

- Node.js v16+ and npm/pnpm
- PostgreSQL database (or Neon Postgres account)
- Git

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file with your configuration.

3. Initialize and seed the database:
   ```bash
   # Start the server to create database tables
   pnpm run dev
   
   # In another terminal, you can seed sample movie data (optional)
   pnpm run seed-movies
   ```

4. For subsequent runs, just start the development server:
   ```bash
   pnpm run dev
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port to run the server on | `5000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | Secret for signing JWT tokens | - |
| `JWT_EXPIRES_IN` | Access token expiry | `1d` |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | - |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `BCRYPT_SALT_ROUNDS` | Rounds for password hashing | `10` |
| `CORS_ORIGIN` | Allowed origins for CORS | `http://localhost:3000` |
| `CLOUD_STORAGE_PROVIDER` | Cloud provider for file uploads | - |

## API Endpoints

### Authentication

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Login user | Public |
| `POST` | `/api/auth/refresh` | Refresh access token | Cookie Required |
| `POST` | `/api/auth/logout` | Logout user | Auth Required |
| `GET` | `/api/auth/profile` | Get user profile | Auth Required |
| `PUT` | `/api/auth/profile` | Update user profile | Auth Required |

### Movies

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|---------------|
| `GET` | `/api/movies` | List all movies | Public |
| `GET` | `/api/movies/:id` | Get movie details | Public |
| `POST` | `/api/movies` | Create a movie | Admin Required |
| `PUT` | `/api/movies/:id` | Update a movie | Admin Required |
| `DELETE` | `/api/movies/:id` | Delete a movie | Admin Required |

### Comments

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|---------------|
| `GET` | `/api/movies/:movieId/comments` | Get comments for a movie | Public |
| `POST` | `/api/movies/:movieId/comments` | Add a comment | Auth Required |

### Watchlist

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|---------------|
| `GET` | `/api/watchlist` | Get user's watchlist | Auth Required |
| `POST` | `/api/watchlist` | Add movie to watchlist | Auth Required |
| `DELETE` | `/api/watchlist/:movieId` | Remove from watchlist | Auth Required |

### File Upload

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|---------------|
| `POST` | `/api/upload` | Upload a file | Auth Required |

## Database Seeding

The project includes a script to seed your database with movie data from The Movie Database (TMDB) API.

To seed your database with sample movies:

```bash
pnpm run seed-movies
```

This script:
1. Uses the `seed-movies.ts` script in the `src/scripts` directory
2. Requires a `TMDB_API_KEY` environment variable to be set in your `.env` file
3. Imports movies from The Movie Database (TMDB) API into your local database

For users to run this successfully, you'll need to:

1. Create a TMDB account (if you don't have one) at [themoviedb.org](https://www.themoviedb.org)
2. Get an API key from https://www.themoviedb.org/settings/api
3. Add the API key to your `.env` file as `TMDB_API_KEY=your_api_key_here`

## Testing

```bash
# Run all tests
pnpm test

# Run a specific test file
pnpm test -- auth.test.ts
pnpm test -- movie.test.ts
pnpm test -- watchlist.test.ts
```

### Test Coverage

The test suite provides comprehensive coverage of key API functionality:

- **Authentication**: Registration, login, token refresh, and user validation
- **Movies**: CRUD operations, advanced search, filtering, sorting, and pagination
- **Watchlist**: Adding/removing movies, status management, filtering by status, sorting, and pagination

## Database Structure

The application uses PostgreSQL with direct queries (no ORM). Main tables:

- `users` - User accounts and profiles
- `movies` - Movie details
- `comments` - User comments on movies
- `watchlist` - User's movie watchlists

## Future Enhancements

- **Cloud Storage Integration**: Implement actual cloud storage (AWS S3, Cloudinary, etc.) for file uploads
- **Email Verification**: Add email verification for user registration
- **Password Reset**: Implement password reset functionality
- **Advanced Search**: Implement full-text search for movies
- **Rate Limiting**: Add rate limiting for API endpoints
- **Blacklist for JWT**: Implement token blacklisting for enhanced security
