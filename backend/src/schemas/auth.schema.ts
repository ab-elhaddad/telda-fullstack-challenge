import Joi from 'joi';

/**
 * Schema for validating user registration
 */
export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least {#limit} characters',
    'string.max': 'Name cannot exceed {#limit} characters',
    'any.required': 'Name is required',
  }),

  email: Joi.string().email().required().lowercase().trim().messages({
    'string.email': 'Please enter a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  }),

  username: Joi.string().trim().alphanum().min(3).max(30).required().messages({
    'string.empty': 'Username is required',
    'string.alphanum': 'Username must only contain alphanumeric characters',
    'string.min': 'Username must be at least {#limit} characters',
    'string.max': 'Username cannot exceed {#limit} characters',
    'any.required': 'Username is required',
  }),

  password: Joi.string()
    .min(8)
    .max(100)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+\-=[\]{}|\\:;"'<>,.?/~]{8,}$/)
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least {#limit} characters',
      'string.max': 'Password cannot exceed {#limit} characters',
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required',
    }),

  confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Password confirmation is required',
  }),
});

/**
 * Schema for validating login credentials
 */
export const loginSchema = Joi.object({
  // Define email as optional initially
  email: Joi.string().email().lowercase().trim().messages({
    'string.email': 'Please enter a valid email address',
  }),

  // Define username as optional initially
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .trim() // Example username validation
    .messages({
      'string.alphanum': 'Username must only contain alphanumeric characters',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters',
    }),

  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
})
  .xor('email', 'username') // requires either email *or* username, but not both.
  .messages({
    'object.xor': 'Please provide either an email or a username, but not both.',
    'object.missing': 'Please provide either an email or a username.', // Fallback if neither is provided
  });

/**
 * Schema for validating refresh token
 */
export const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string().required().messages({
    'string.empty': 'Refresh token is required',
    'any.required': 'Refresh token is required',
  }),
});

/**
 * Schema for validating password reset request
 */
export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim().messages({
    'string.email': 'Please enter a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  }),
});

/**
 * Schema for validating profile updates
 */
export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).messages({
    'string.min': 'Name must be at least {#limit} characters',
    'string.max': 'Name cannot exceed {#limit} characters',
  }),

  avatarUrl: Joi.string().uri().allow('', null).messages({
    'string.uri': 'Avatar URL must be a valid URL',
  }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field is required for updating profile',
  });

/**
 * Schema for password reset
 */
export const resetPasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
    'string.empty': 'Current password is required',
  }),

  newPassword: Joi.string()
    .min(8)
    .max(100)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+\-=[\]{}|\\:;"'<>,.?/~]{8,}$/)
    .required()
    .messages({
      'string.min': 'New password must be at least {#limit} characters',
      'string.max': 'New password cannot exceed {#limit} characters',
      'string.pattern.base':
        'New password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'New password is required',
    }),

  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Password confirmation is required',
  }),
});
