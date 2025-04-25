export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this);
  }
}

//Not found error
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, true);
  }
}

//Internal server error
export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error") {
    super(message, 500, true);
  }
}

//Bad request error
export class BadRequestError extends AppError {
  constructor(message: string = "Bad request") {
    super(message, 400, true);
  }
}

//Unauthorized error
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, true);
  }
}

//Forbidden error
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403, true);
  }
}

//Validation error like (use of zod/react-hook-form)
export class ValidationError extends AppError {
  constructor(message: string = "Validation error", details?: any) {
    super(message, 400, true, details);
  }
}

// Databse error
export class DatabaseError extends AppError {
  constructor(message: string = "Database error", details?: any) {
    super(message, 500, true, details);
  }
}

//Rate limit error
export class RateLimitError extends AppError {
  constructor(
    message: string = "Too many requests , please try again after 15 minutes",
    details?: any
  ) {
    super(message, 429, true, details);
  }
}
