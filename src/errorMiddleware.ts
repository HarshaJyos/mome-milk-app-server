// src/errorMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

// Custom error classes
class HttpError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends HttpError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

class NotFoundError extends HttpError {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

class ConflictError extends HttpError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

class InternalServerError extends HttpError {
  constructor(message = 'Internal Server Error') {
    super(message, 500);
  }
}

// Logger setup
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
});

// Error handler middleware
const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Something went wrong';
  const requestId = req.get('request-id') || 'unknown';

  // Log error
  logger.error({
    requestId,
    method: req.method,
    url: req.url,
    statusCode,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  });

  // Format response
  res.status(statusCode).json({
    status: 'error',
    message,
    requestId,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  });
};

export {
  errorHandler,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  InternalServerError,
};