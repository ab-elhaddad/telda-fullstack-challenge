import Joi from 'joi';
import { AddToWatchlistDto, WatchlistQueryParams, UpdateWatchlistDto } from '../types/watchlist';

export const addToWatchlistSchema = Joi.object<AddToWatchlistDto>({
  movie_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Movie ID must be a number',
      'number.integer': 'Movie ID must be an integer',
      'number.positive': 'Movie ID must be a positive number',
      'any.required': 'Movie ID is required'
    })
});

/**
 * Schema for updating watchlist item status
 */
export const updateWatchlistSchema = Joi.object<UpdateWatchlistDto>({
  status: Joi.string().valid('to_watch', 'watched').required()
    .messages({
      'string.base': 'Status must be a string',
      'any.only': "Status must be either 'to_watch' or 'watched'",
      'any.required': 'Status is required'
    })
});

/**
 * Schema for validating watchlist query parameters
 */
export const watchlistQueryParamsSchema = Joi.object<WatchlistQueryParams>({
  page: Joi.number().integer().positive().default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.positive': 'Page must be a positive number'
    }),
  limit: Joi.number().integer().positive().max(100).default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.positive': 'Limit must be a positive number',
      'number.max': 'Limit must be at most {#limit}'
    }),
  
  status: Joi.string().valid('to_watch', 'watched', 'all').default('all')
    .messages({
      'string.base': 'Status must be a string',
      'any.only': "Status filter must be 'to_watch', 'watched', or 'all'"
    }),
  
  sort_by: Joi.string().valid('added_at', 'title', 'rating').default('added_at')
    .messages({
      'string.base': 'Sort field must be a string',
      'any.only': "Sort can only be by 'added_at', 'title', or 'rating'"
    }),
  
  order: Joi.string().valid('ASC', 'DESC').default('DESC')
    .messages({
      'string.base': 'Order must be a string',
      'any.only': "Order must be either 'ASC' or 'DESC'"
    })
});
