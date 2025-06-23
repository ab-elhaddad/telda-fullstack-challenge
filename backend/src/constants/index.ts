/**
 * Application constants
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER: 500,
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

export const LIMITS = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  MIN_PASSWORD_LENGTH: 8,
};

export const SORT_ORDERS = {
  ASC: 'ASC',
  DESC: 'DESC',
};

export const SORT_FIELDS = {
  MOVIES: {
    ID: 'id',
    TITLE: 'title',
    DIRECTOR: 'director',
    RELEASE_YEAR: 'release_year',
    RATING: 'rating',
    CREATED_AT: 'created_at',
  },
};

export const API_PREFIX = '/api';
