# Fullstack Movie Application

A complete fullstack application for browsing and managing movies.

## Project Structure

```
movie-application/
├── frontend/         # React TypeScript frontend
├── backend/          # Express Node.js backend
├── docker-compose.yml
├── package.json
├── README.md
└── .gitignore
```

## Technologies

### Frontend
- React
- TypeScript
- React Router
- CSS/SCSS
- Jest for testing

### Backend
- Node.js
- Express
- PostgreSQL (Neon Postgres)
- TypeScript
- JWT Authentication
- Direct SQL Queries (No ORM)
- Jest for testing

## Getting Started

### Prerequisites
- Node.js v16+ and npm/pnpm
- PostgreSQL database (or Neon Postgres account)
- Docker and Docker Compose (optional, for containerized setup)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd movie-application
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
# Backend environment setup
cp backend/.env.example backend/.env
# Frontend environment setup (if needed)
cp frontend/.env.example frontend/.env
```
Then edit the `.env` files with your configuration.

4. Initialize and seed the database (optional)
```bash
cd backend
pnpm run dev # This will create tables
# To add sample data, you can run:
pnpm run seed-movies # (Optional: Adds sample movie data)
cd ..
```

5. Start development servers
```bash
pnpm run dev
```

### Docker Setup

To run the entire application using Docker:

```bash
docker-compose up
```

## Available Scripts

- `pnpm run dev` - Run both frontend and backend in development mode
- `pnpm run build` - Build both frontend and backend
- `pnpm run start` - Start both frontend and backend in production mode
- `pnpm run test` - Run tests for both projects

## Main Features

### Authentication System
- Secure JWT-based authentication using access and refresh tokens
- Tokens stored exclusively in HttpOnly cookies for enhanced security
- Automatic token refreshing and token rotation
- Login via email or username
- User registration with unique validation
- Separate endpoints for profile management and password reset
- Profile updates for name and avatar URL
- Secure password reset with current password verification
- Password change with old password verification

### Movie Management
- Browse, search, and filter movies
- Comment on movies
- Personal watchlists

### File Upload
- API endpoint for uploading profile images
- Validation for image types and sizes
- Blueprint for cloud storage integration

## Project Documentation

For more detailed information, see the READMEs in each directory:
- [Backend README](./backend/README.md)

## Deployment

[Add deployment instructions here]

## License

[Add license information here]
