# Fullstack Movie Application

A complete fullstack application for browsing and managing movies.

## Usage Snippets
![image](https://github.com/user-attachments/assets/d754edbc-cfd6-4307-b098-1eeb7e05ccb9)
![image](https://github.com/user-attachments/assets/85542035-a231-4aed-a94c-ef978fa18aa3)
![image](https://github.com/user-attachments/assets/309250e5-a003-4857-bb8e-3e79015c9afc)
![image](https://github.com/user-attachments/assets/c74342ed-711d-4a0e-af72-02b610705e41)
![image](https://github.com/user-attachments/assets/1eb6981d-3706-4643-9b36-9e216ae34af8)
![image](https://github.com/user-attachments/assets/9a29c557-5852-4d64-9cd4-c05b2e06f780)
![image](https://github.com/user-attachments/assets/32998694-bfed-42fd-85af-e978972cc558)

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

- Node.js v16+ and pnpm
- PostgreSQL database (or Neon Postgres account)
- TMDB API key (optional, for adding sample movie data)
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
pnpm run seed-movies # (Optional: Adds sample movie data [Make sure to provide TMDB_API_KEY in the .env file])
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
- Cookies available to all API paths, not just auth routes
- Automatic token refreshing and token rotation
- Login via email or username
- User registration with unique validation
- Separate endpoints for profile management and password reset
- Profile updates for name and avatar URL using PATCH
- Secure password reset with current password verification
- Force re-login after password change for enhanced security

### Movie Management

- Browse, search, and filter movies with advanced filtering
- Movie management (create, update, delete) restricted to admin users
- Personal watchlists with tracking status ('to_watch' or 'watched')

## Project Documentation

For more detailed information, see the READMEs in each directory:

- [Backend README](./backend/README.md)
