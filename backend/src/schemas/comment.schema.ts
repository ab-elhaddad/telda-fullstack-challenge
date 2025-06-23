import Joi from 'joi';
import { CreateCommentDto, UpdateCommentDto } from '../types/comment';
import { CommentQueryParams } from '../types/comment';

export const createCommentSchema = Joi.object<CreateCommentDto>({
  content: Joi.string().required().min(3).max(2000)
    .messages({
      'string.base': 'Content must be a string',
      'string.empty': 'Content is required',
      'string.min': 'Content must be at least {#limit} characters',
      'string.max': 'Content must be less than {#limit} characters',
      'any.required': 'Content is required'
    }),
  rating: Joi.number().required().integer().min(1).max(10)
    .messages({
      'number.base': 'Rating must be a number',
      'number.integer': 'Rating must be an integer',
      'number.min': 'Rating must be at least {#limit}',
      'number.max': 'Rating must be at most {#limit}',
      'any.required': 'Rating is required'
    })
});

export const updateCommentSchema = Joi.object<UpdateCommentDto>({
  content: Joi.string().min(3).max(2000)
    .messages({
      'string.base': 'Content must be a string',
      'string.min': 'Content must be at least {#limit} characters',
      'string.max': 'Content must be less than {#limit} characters'
    }),
  rating: Joi.number().integer().min(1).max(10)
    .messages({
      'number.base': 'Rating must be a number',
      'number.integer': 'Rating must be an integer',
      'number.min': 'Rating must be at least {#limit}',
      'number.max': 'Rating must be at most {#limit}'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

export const commentQueryParamsSchema = Joi.object<CommentQueryParams>({
  movie_id: Joi.number().integer().positive()
    .messages({
      'number.base': 'Movie ID must be a number',
      'number.integer': 'Movie ID must be an integer',
      'number.positive': 'Movie ID must be a positive number'
    }),
  user_id: Joi.number().integer().positive()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number'
    }),
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
    })
});
