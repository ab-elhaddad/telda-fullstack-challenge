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

export class NotFoundException extends HttpException {
  constructor(resource = 'Resource') {
    super(404, `${resource} not found`);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}

export class BadRequestException extends HttpException {
  constructor(message = 'Bad Request') {
    super(400, message);
  }
}

export class ConflictException extends HttpException {
  constructor(resource = 'Resource') {
    super(409, `${resource} already exists`);
  }
}
