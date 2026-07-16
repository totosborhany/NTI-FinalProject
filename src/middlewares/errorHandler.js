import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const errorHandler = (err, _req, res, _next) => {
  // 1. Custom App Errors
  if (err instanceof AppError) {
    logger.error(err.message, err.errors);
    return res.status(err.statusCode).json(
      ApiResponse.fail(err.message, {
        name: err.name,
        errors: err.errors,
        stack: err.stack,
      })
    );
  }

  // 2. Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    logger.error('Validation error', err.errors);
    return res.status(400).json(
      ApiResponse.fail('Validation failed', {
        message: err.message,
        errors: err.errors,
        stack: err.stack,
      })
    );
  }

  // 3. Invalid Mongo ObjectId
  if (err.name === 'CastError') {
    logger.error('Mongo cast error', err.message);
    return res.status(400).json(
      ApiResponse.fail('Invalid resource identifier', {
        message: err.message,
        path: err.path,
        value: err.value,
        stack: err.stack,
      })
    );
  }

  // 4. Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];

    logger.error('Duplicate key error', err.message);

    return res.status(409).json(
      ApiResponse.fail(`${field} already exists`, {
        message: err.message,
        keyValue: err.keyValue,
        stack: err.stack,
      })
    );
  }

  // 5. Invalid JWT
  if (err.name === 'JsonWebTokenError') {
    logger.error('Invalid JWT token', err.message);

    return res.status(401).json(
      ApiResponse.fail('Invalid token', {
        message: err.message,
        stack: err.stack,
      })
    );
  }

  // 6. Expired JWT
  if (err.name === 'TokenExpiredError') {
    logger.error('Expired JWT token', err.message);

    return res.status(401).json(
      ApiResponse.fail('Access token expired', {
        message: err.message,
        expiredAt: err.expiredAt,
        stack: err.stack,
      })
    );
  }

  // 7. Invalid JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.error('JSON parsing syntax error', err.message);

    return res.status(400).json(
      ApiResponse.fail('Invalid JSON payload', {
        message: err.message,
        stack: err.stack,
      })
    );
  }

  // 8. Unhandled Error
  logger.error('Unhandled error', err.stack || err.message);

  return res.status(500).json(
    ApiResponse.fail('Internal server error', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
      errors: err.errors,
      keyValue: err.keyValue,
      cause: err.cause,
    })
  );
};