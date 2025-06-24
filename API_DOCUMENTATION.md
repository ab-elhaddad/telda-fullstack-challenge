# API Documentation

This document provides detailed information about the Movie Application's REST API endpoints, request/response formats, and authentication requirements.

## Table of Contents

- [Authentication](#authentication)
  - [Register](#register)
  - [Login](#login)
  - [Logout](#logout)
  - [Get Current User](#get-current-user)
  - [Update Profile](#update-profile)
  - [Change Password](#change-password)
- [Movies](#movies)
  - [Get Movies List](#get-movies-list)
  - [Get Movie Details](#get-movie-details)
  - [Create Movie](#create-movie)
  - [Update Movie](#update-movie)
  - [Delete Movie](#delete-movie)
- [Comments](#comments)
  - [Get Movie Comments](#get-movie-comments)
  - [Add Comment](#add-comment)
- [Watchlist](#watchlist)
  - [Get User Watchlist](#get-user-watchlist)
  - [Add to Watchlist](#add-to-watchlist)
  - [Remove from Watchlist](#remove-from-watchlist)
  - [Update Watchlist Status](#update-watchlist-status)
- [File Upload](#file-upload)
  - [Upload File](#upload-file)
- [Error Handling](#error-handling)
- [Response Format](#response-format)

## Base URL

All API endpoints are relative to the base URL:

```
http://localhost:5000/api
```

## Authentication

The API uses JWT authentication with refresh tokens stored in HTTP-only cookies.

### Register

Create a new user account.

- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Content Type**: `application/json`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123!",
  "username": "johndoe"
}
```

**Success Response** (200 OK):
```json
{
  "status": true,
  "message": "User registered successfully",
  "data": {
    "id": 123,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "username": "johndoe",
    "avatarUrl": null,
    "createdAt": "2023-07-20T12:00:00Z"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "status": false,
  "message": "Email already in use",
  "data": null
}
```

### Login

Authenticate a user and receive access tokens.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Content Type**: `application/json`

**Request Body**:
```json
{
  "login": "johndoe@example.com",
  "password": "securePassword123!"
}
```
Note: `login` field can be either email or username.

**Success Response** (200 OK):
```json
{
  "status": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 123,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "username": "johndoe",
      "avatarUrl": null
    }
  }
}
```
The response includes HttpOnly cookies for access and refresh tokens.

**Error Response** (401 Unauthorized):
```json
{
  "status": false,
  "message": "Invalid credentials",
  "data": null
}
```

### Logout

Invalidate the current session and clear tokens.

- **URL**: `/auth/logout`
- **Method**: `POST`
- **Auth Required**: Yes
- **Content Type**: `application/json`

**Success Response** (200 OK):
```json
{
  "status": true,
  "message": "Logged out successfully",
  "data": null
}
```

### Get Current User

Retrieve the authenticated user's profile information.

- **URL**: `/auth/me`
- **Method**: `GET`
- **Auth Required**: Yes

**Success Response** (200 OK):
```json
{
  "status": true,
  "message": "User profile retrieved",
  "data": {
    "id": 123,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "username": "johndoe",
    "avatarUrl": "https://example.com/avatars/johndoe.jpg",
    "createdAt": "2023-07-20T12:00:00Z"
  }
}
```

**Error Response** (401 Unauthorized):
```json
{
  "status": false,
  "message": "Not authenticated",
  "data": null
}
```

### Update Profile

Update the authenticated user's profile information.

- **URL**: `/auth/profile`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **Content Type**: `application/json`

**Request Body**:
```json
{
  "name": "John Smith",
  "avatarUrl": "https://example.com/avatars/johnsmith.jpg"
}
```

**Success Response** (200 OK):
```json
{
  "status": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 123,
    "name": "John Smith",
    "email": "john.doe@example.com",
    "username": "johndoe",
    "avatarUrl": "https://example.com/avatars/johnsmith.jpg",
    "createdAt": "2023-07-20T12:00:00Z",
    "updatedAt": "2023-07-25T15:30:00Z"
  }
}
```

### Change Password

Update the authenticated user's password.

- **URL**: `/auth/password`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **Content Type**: `application/json`

**Request Body**:
```json
{
  "oldPassword": "securePassword123!",
  "newPassword": "evenMoreSecure456!",
  "confirmPassword": "evenMoreSecure456!"
}
```

**Success Response** (200 OK):
```json
{
  "status": true,
  "message": "Password updated successfully",
  "data": {
    "success": true
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "status": false,
  "message": "Incorrect current password",
  "data": null
}
```

## Movies

Endpoints for managing movies.

### Get Movies List

Retrieve a paginated list of movies with filtering options.

- **URL**: `/movies`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `search`: Search term for title/director/genre
  - `year_from`: Minimum release year
  - `year_to`: Maximum release year
  - `rating_from`: Minimum rating (1-10)
  - `rating_to`: Maximum rating (1-10)
  - `genre`: Genre to filter by
  - `sort`: Field to sort by (title, year, rating, director)
  - `order`: Sort order (asc, desc)

**Success Response** (200 OK):
```json
{
  "status": true,
  "message": "Movies retrieved successfully",
  "data": {
    "movies": [
      {
        "id": 1,
        "title": "The Shawshank Redemption",
        "director": "Frank Darabont",
        "year": 1994,
        "rating": 9.3,
        "poster": "https://example.com/posters/shawshank.jpg",
        "genres": ["Drama"]
      }
      // More movies...
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "pages": 10
    }
  }
}
```

### Get Movie Details

Retrieve detailed information about a specific movie.

- **URL**: `/movies/:id`
- **Method**: `GET`
- **Auth Required**: No
- **URL Parameters**:
  - `id`: Movie ID

**Success Response** (200 OK):
```json
{
  "status": true,
  "message": "Movie details retrieved",
  "data": {
    "id": 1,
    "title": "The Shawshank Redemption",
    "director": "Frank Darabont",
    "year": 1994,
    "rating": 9.3,
    "poster": "https://example.com/posters/shawshank.jpg",
    "backdrop": "https://example.com/backdrops/shawshank.jpg",
    "genres": ["Drama"],
    "plot": "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    "duration": 142,
    "createdAt": "2023-07-20T12:00:00Z",
    "updatedAt": "2023-07-20T12:00:00Z"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "status": false,
  "message": "Movie not found",
  "data": null
}
```

### Create Movie

Create a new movie (admin only).

- **URL**: `/movies`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Content Type**: `application/json`

**Request Body**:
```json
{
  "title": "Inception",
  "director": "Christopher Nolan",
  "year": 2010,
  "rating": 8.8,
  "poster": "https://example.com/posters/inception.jpg",
  "backdrop": "https://example.com/backdrops/inception.jpg",
  "genres": ["Action", "Sci-Fi", "Thriller"],
  "plot": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
  "duration": 148
}
```

**Success Response** (201 Created):
```json
{
  "status": true,
  "message": "Movie created successfully",
  "data": {
    "id": 2,
    "title": "Inception",
    // Other movie details...
  }
}
```

**Error Response** (403 Forbidden):
```json
{
  "status": false,
  "message": "Admin access required",
  "data": null
}
```

### Update Movie

Update an existing movie (admin only).

- **URL**: `/movies/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin)
- **URL Parameters**:
  - `id`: Movie ID
- **Content Type**: `application/json`

**Request Body**:
```json
{
  "title": "Inception (2010)",
  "rating": 8.9
  // Other fields to update...
}
```

**Success Response** (200 OK):
```json
{
  "status": true,
  "message": "Movie updated successfully",
  "data": {
    "id": 2,
    "title": "Inception (2010)",
    "rating": 8.9
    // Other movie details...
  }
}
```

### Delete Movie

Delete a movie (admin only).

- **URL**: `/movies/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Admin)
- **URL Parameters**:
  - `id`: Movie ID

**Success Response** (200 OK):
```json
{
  "status": true,
  "message": "Movie deleted successfully",
  "data": null
}
```

## Comments

Endpoints for managing movie comments.

### Get Movie Comments

Retrieve comments for a specific movie.

- **URL**: `/movies/:movieId/comments`
- **Method**: `GET`
- **Auth Required**: No
- **URL Parameters**:
  - `movieId`: Movie ID
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)

**Success Response** (200 OK):
```json
{
  "status": true,
  "message": "Comments retrieved successfully",
  "data": {
    "comments": [
      {
        "id": 1,
        "content": "This movie was amazing!",
        "userId": 123,
        "username": "johndoe",
        "createdAt": "2023-07-22T14:30:00Z"
      }
      // More comments...
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

### Add Comment

Add a new comment to a movie.

- **URL**: `/movies/:movieId/comments`
- **Method**: `POST`
- **Auth Required**: Yes
- **URL Parameters**:
  - `movieId`: Movie ID
- **Content Type**: `application/json`

**Request Body**:
```json
{
  "content": "I loved the cinematography and the plot twists!"
}
```

**Success Response** (201 Created):
```json
{
  "status": true,
  "message": "Comment added successfully",
  "data": {
    "id": 2,
    "content": "I loved the cinematography and the plot twists!",
    "userId": 123,
    "username": "johndoe",
    "createdAt": "2023-07-25T16:45:00Z"
  }
}
```

## Watchlist

Endpoints for managing user watchlists.

### Get User Watchlist

Retrieve the authenticated user's watchlist.

- **URL**: `/watchlist`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `status`: Filter by status ('to_watch', 'watched')
  - `sort`: Field to sort by (added_date, title, rating)
  - `order`: Sort order (asc, desc)

**Success Response** (200 OK):
```json
{
  "status": true,
  "message": "Watchlist retrieved successfully",
  "data": {
    "items": [
      {
        "id": 1,
        "movieId": 1,
        "title": "The Shawshank Redemption",
        "poster": "https://example.com/posters/shawshank.jpg",
        "director": "Frank Darabont",
        "year": 1994,
        "rating": 9.3,
        "status": "to_watch",
        "addedAt": "2023-07-21T10:15:00Z"
      }
      // More watchlist items...
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 10,
      "pages": 2
    }
  }
}
```

### Add to Watchlist

Add a movie to the user's watchlist.

- **URL**: `/watchlist`
- **Method**: `POST`
- **Auth Required**: Yes
- **Content Type**: `application/json`

**Request Body**:
```json
{
  "movieId": 2,
  "status": "to_watch"
}
```

**Success Response** (201 Created):
```json
{
  "status": true,
  "message": "Movie added to watchlist",
  "data": {
    "id": 2,
    "movieId": 2,
    "title": "Inception",
    "status": "to_watch",
    "addedAt": "2023-07-25T16:50:00Z"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "status": false,
  "message": "Movie is already in your watchlist",
  "data": null
}
```

### Remove from Watchlist

Remove a movie from the user's watchlist.

- **URL**: `/watchlist/:movieId`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **URL Parameters**:
  - `movieId`: Movie ID

**Success Response** (200 OK):
```json
{
  "status": true,
  "message": "Movie removed from watchlist",
  "data": null
}
```

### Update Watchlist Status

Update the watch status of a movie in the user's watchlist.

- **URL**: `/watchlist/:movieId/status`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **URL Parameters**:
  - `movieId`: Movie ID
- **Content Type**: `application/json`

**Request Body**:
```json
{
  "status": "watched"
}
```

**Success Response** (200 OK):
```json
{
  "status": true,
  "message": "Watchlist status updated",
  "data": {
    "movieId": 2,
    "status": "watched",
    "updatedAt": "2023-07-26T09:20:00Z"
  }
}
```

## File Upload

Endpoint for uploading files like profile images.

### Upload File

Upload a file (typically an image).

- **URL**: `/upload`
- **Method**: `POST`
- **Auth Required**: Yes
- **Content Type**: `multipart/form-data`

**Request Body**:
- Form field: `file`
- File size limit: 5MB
- Supported formats: jpg, jpeg, png, gif

**Success Response** (200 OK):
```json
{
  "status": true,
  "message": "File uploaded successfully",
  "data": {
    "url": "https://example.com/uploads/user123/image.jpg",
    "filename": "image.jpg",
    "size": 1024000
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "status": false,
  "message": "File too large. Maximum size is 5MB",
  "data": null
}
```

## Error Handling

The API uses standard HTTP response codes to indicate success or failure:

- `200 OK`: The request was successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters or validation error
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Permission denied (e.g., non-admin trying to create a movie)
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Response Format

All API responses follow a standard format:

```json
{
  "status": boolean,
  "message": "Human-readable message",
  "data": object | array | null
}
```

- `status`: Boolean indicating success (`true`) or failure (`false`)
- `message`: Human-readable description of the result
- `data`: Response payload, which can be an object, array, or null

When handling responses on the frontend with tools like React Query, ensure you access the nested data appropriately:

```typescript
const { data: responseData } = useQuery(["resource"], fetchFunction);
const actualData = responseData?.data; // Access the nested data
```
