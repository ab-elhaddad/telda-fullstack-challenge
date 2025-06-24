# Movie Application Frontend

The React frontend for the Movie Application built with TypeScript and Vite. This modern single-page application provides a responsive user interface for browsing movies, managing watchlists, and updating user profiles.

## Features

### User Authentication

- Secure login/register forms with field validation
- JWT authentication with token refresh
- Protected routes for authenticated users
- Profile management with personal information updates
- Password change functionality with validation

### Movie Experience

- Browse movies with sorting, filtering, and pagination
- Search movies by title, director, and genre
- Detailed movie information pages
- Add/read comments on movies
- Add movies to personal watchlists
- Track movie watch status ('to_watch' or 'watched')

### User Interface

- Responsive design for all screen sizes
- Toast notifications for user feedback
- Loading states and skeleton loaders
- Modal dialogs for forms and confirmations
- Form validation with error messages

## Tech Stack

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **API Communication**: React Query
- **Form Management**: React Hook Form with Zod validation
- **Styling**: CSS/SCSS modules
- **Testing**: Jest with React Testing Library

## Project Structure

```
src/
├── assets/           # Static assets (images, fonts, etc.)
├── components/       # Reusable UI components
├── hooks/            # Custom React hooks
├── layouts/          # Page layout components
├── pages/            # Route components
│   ├── profile/      # Profile page components
│   │   ├── components/  # Profile-specific components
├── services/         # API service functions
├── store/            # Zustand store definitions
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── App.tsx           # Main application component
└── main.tsx         # Entry point
```

## Getting Started

### Prerequisites

- Node.js v16+ and npm/pnpm
- Backend server running (see backend README)

### Installation

1. Install dependencies:

   ```bash
   cd frontend
   pnpm install
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Then edit the `.env.local` file with your configuration, especially the `VITE_API_URL`.

3. Start the development server:
   ```bash
   pnpm dev
   ```
   This will start the development server at `http://localhost:5173`

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build locally
- `pnpm test` - Run tests
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier

## API Integration

The frontend follows a standard pattern for API communication with React Query:

```typescript
// Example API request pattern
const { data: responseData, isLoading } = useQuery(["profile"], () =>
  authService.getProfile()
);

// Access data following the standard API response structure
const userData = responseData?.data;
```

All API responses follow a standard structure:

```typescript
{
  status: boolean,
  message: string,
  data: T // The actual data
}
```

## Testing

Tests are written using Jest and React Testing Library. To run tests:

```bash
pnpm test
```

Test files are stored alongside the components they test with a `.test.tsx` extension.
