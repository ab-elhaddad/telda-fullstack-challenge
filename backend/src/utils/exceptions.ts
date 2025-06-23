/**
 * Custom HTTP Exception class for standardized error handling
 */
export class HttpException extends Error {
  status: number;
  message: string;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found Exception (404)
 */
export class NotFoundException extends HttpException {
  constructor(resource = 'Resource') {
    super(404, `${resource} not found`);
  }
}

/**
 * Unauthorized Exception (401)
 */
export class UnauthorizedException extends HttpException {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

/**
 * Forbidden Exception (403)
 */
export class ForbiddenException extends HttpException {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}

/**
 * Bad Request Exception (400)
 */
export class BadRequestException extends HttpException {
  constructor(message = 'Bad Request') {
    super(400, message);
  }
}

/**
 * Conflict Exception (409) - for duplicate resources
 */
export class ConflictException extends HttpException {
  constructor(resource = 'Resource') {
    super(409, `${resource} already exists`);
  }
}
