import Joi from 'joi';

/**
 * Schema for validating user registration
 */
export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least {#limit} characters',
      'string.max': 'Name cannot exceed {#limit} characters',
      'any.required': 'Name is required',
    }),
  
  email: Joi.string().email().required().lowercase().trim()
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required',
    }),
  
  password: Joi.string().min(8).max(100).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/)
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least {#limit} characters',
      'string.max': 'Password cannot exceed {#limit} characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required',
    }),

  confirm_password: Joi.string().required().valid(Joi.ref('password'))
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required',
    }),
});

/**
 * Schema for validating login credentials
 */
export const loginSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim()
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required',
    }),
  
  password: Joi.string().required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required',
    }),
});

/**
 * Schema for validating refresh token
 */
export const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string().required()
    .messages({
      'string.empty': 'Refresh token is required',
      'any.required': 'Refresh token is required',
    }),
});

/**
 * Schema for validating password reset request
 */
export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim()
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required',
    }),
});

/**
 * Schema for validating profile updates
 */
export const updateProfileSchema = Joi.object({
  username: Joi.string().min(3).max(20).alphanum()
    .messages({
      'string.min': 'Username must be at least {#limit} characters',
      'string.max': 'Username cannot exceed {#limit} characters',
      'string.alphanum': 'Username must only contain alphanumeric characters',
    }),

  email: Joi.string().email().lowercase().trim()
    .messages({
      'string.email': 'Please enter a valid email address',
    }),

  name: Joi.string().trim().min(2).max(100)
    .messages({
      'string.min': 'Name must be at least {#limit} characters',
      'string.max': 'Name cannot exceed {#limit} characters',
    }),

  bio: Joi.string().max(500).allow('', null)
    .messages({
      'string.max': 'Bio cannot exceed {#limit} characters',
    }),

  profile_picture_url: Joi.string().uri().allow('', null)
    .messages({
      'string.uri': 'Profile picture URL must be a valid URL',
    }),

  old_password: Joi.string().when('password', {
    is: Joi.exist(),
    then: Joi.string().required().messages({
      'any.required': 'Old password is required when updating password',
      'string.empty': 'Old password is required when updating password',
    }),
    otherwise: Joi.string().allow('', null),
  }),

  password: Joi.string().min(8).max(100)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/)
    .messages({
      'string.min': 'Password must be at least {#limit} characters',
      'string.max': 'Password cannot exceed {#limit} characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    }),

  confirm_password: Joi.string().valid(Joi.ref('password'))
    .when('password', {
      is: Joi.exist().not(null, ''),
      then: Joi.required().messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Password confirmation is required when updating password',
      }),
      otherwise: Joi.allow(null, ''),
    }),
}).min(1).messages({
  'object.min': 'At least one field is required for updating profile',
});
