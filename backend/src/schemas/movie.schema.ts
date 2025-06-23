import Joi from 'joi';
const currentYear = new Date().getFullYear();

/**
 * Schema for validating creation of new movies
 */
export const createMovieSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).required()
    .messages({
      'string.empty': 'Movie title is required',
      'string.min': 'Movie title must be at least {#limit} characters',
      'string.max': 'Movie title cannot exceed {#limit} characters',
      'any.required': 'Movie title is required',
    }),
  
  director: Joi.string().trim().max(255).allow('', null),
  
  release_year: Joi.number().integer().min(1888).max(new Date().getFullYear() + 5)
    .messages({
      'number.min': 'Release year must be after 1888 (first known motion picture)',
      'number.max': 'Release year cannot be more than 5 years in the future',
    }),
  
  genre: Joi.string().trim().max(100).allow('', null),
  
  poster: Joi.string().uri().max(500).allow('', null)
    .messages({
      'string.uri': 'Poster must be a valid URL',
    }),
  
  rating: Joi.number().min(0).max(10).precision(1).allow(null)
    .messages({
      'number.min': 'Rating must be between 0 and 10',
      'number.max': 'Rating must be between 0 and 10',
    }),
});

/**
 * Schema for validating movie updates
 */
export const updateMovieSchema = createMovieSchema.fork(
  ['title', 'director', 'release_year', 'genre', 'poster', 'rating'],
  schema => schema.optional()
).min(1).messages({ 'object.min': 'At least one field must be provided for update' });

/**
 * Schema for validating movie query parameters with advanced search and filtering
 */
export const movieQuerySchema = Joi.object({
  search: Joi.string().trim().max(255)
    .description('Search term for movie titles, directors, or genres')
    .messages({
      'string.max': 'Search term cannot exceed {#limit} characters'
    }),
    
  title: Joi.string().trim().max(255)
    .description('Filter by exact or partial movie title')
    .messages({
      'string.max': 'Title filter cannot exceed {#limit} characters'
    }),
    
  director: Joi.string().trim().max(255)
    .description('Filter by exact or partial director name')
    .messages({
      'string.max': 'Director filter cannot exceed {#limit} characters'
    }),
  genre: Joi.string().trim().max(100)
    .description('Filter by genre')
    .messages({
      'string.max': 'Genre filter cannot exceed {#limit} characters'
    }),
    
  year: Joi.number().integer().min(1888).max(currentYear + 5)
    .description('Filter by movie release year')
    .messages({
      'number.base': 'Year must be a number',
      'number.integer': 'Year must be an integer',
      'number.min': 'Year must be after 1888 (first known motion picture)',
      'number.max': `Year cannot be more than 5 years in the future (max: ${currentYear + 5})`
    }),
    
  year_from: Joi.number().integer().min(1888).max(currentYear + 5)
    .description('Filter movies released from this year onward')
    .messages({
      'number.base': 'Starting year must be a number',
      'number.integer': 'Starting year must be an integer',
      'number.min': 'Starting year must be after 1888 (first known motion picture)',
      'number.max': `Starting year cannot be more than 5 years in the future (max: ${currentYear + 5})`
    }),
    
  year_to: Joi.number().integer().min(1888).max(currentYear + 5)
    .description('Filter movies released up to this year')
    .messages({
      'number.base': 'Ending year must be a number',
      'number.integer': 'Ending year must be an integer',
      'number.min': 'Ending year must be after 1888 (first known motion picture)',
      'number.max': `Ending year cannot be more than 5 years in the future (max: ${currentYear + 5})`
    }),
    
  min_rating: Joi.number().min(0).max(10)
    .description('Filter movies with rating greater than or equal to this value')
    .messages({
      'number.base': 'Minimum rating must be a number',
      'number.min': 'Minimum rating must be at least 0',
      'number.max': 'Minimum rating cannot exceed 10'
    }),
    
  max_rating: Joi.number().min(0).max(10)
    .description('Filter movies with rating less than or equal to this value')
    .messages({
      'number.base': 'Maximum rating must be a number',
      'number.min': 'Maximum rating must be at least 0',
      'number.max': 'Maximum rating cannot exceed 10'
    }),
    
  page: Joi.number().integer().min(1).default(1)
    .description('Page number for pagination')
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
    
  limit: Joi.number().integer().min(1).max(100).default(10)
    .description('Number of results per page')
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
    
  sort_by: Joi.string()
    .valid('title', 'director', 'release_year', 'rating', 'created_at')
    .default('created_at')
    .description('Field to sort results by')
    .messages({
      'any.only': 'Sort can only be by title, director, release_year, rating, or created_at'
    }),
    
  order: Joi.string()
    .valid('ASC', 'DESC')
    .default('DESC')
    .description('Sort order (ascending or descending)')
    .messages({
      'any.only': 'Order can only be ASC or DESC'
    }),
});

/**
 * Schema specifically for movie search with simplified parameters
 */
export const searchMoviesSchema = Joi.object({
  search: Joi.string().trim().max(255)
    .description('Search term for movie titles, directors, or genres'),
    
  genre: Joi.string().trim().max(100)
    .description('Filter by genre'),
    
  page: Joi.number().integer().min(1).default(1)
    .description('Page number for pagination'),
    
  limit: Joi.number().integer().min(1).max(100).default(10)
    .description('Number of results per page'),
});
