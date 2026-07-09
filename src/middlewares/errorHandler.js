import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { ApiResponse } from '../utils/ApiResponse.js'; // Ensure this is imported!

export const errorHandler = (err, _req, res, _next) => {
  // 1. Custom App Errors
  if (err instanceof AppError) {
    logger.error(err.message, err.errors);
    return res.status(err.statusCode).json(ApiResponse.fail(err.message, err.errors));
  }

  // 2. Mongoose/MongoDB Validation Errors
  if (err.name === 'ValidationError') {
    logger.error('Validation error', err.errors);
    return res.status(400).json(ApiResponse.fail('Validation failed', err.errors));
  }

  // 3. Mongoose Invalid ID (Cast Error)
  if (err.name === 'CastError') {
    logger.error('Mongo cast error', err.message);
    return res.status(400).json(ApiResponse.fail('Invalid resource identifier', err.message));
  }

  // 4. MongoDB Duplicate Key Error (e.g., Email already registered)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    logger.error('Duplicate key error', err.message);
    return res.status(409).json(ApiResponse.fail(message));
  }

  // 5. JWT Invalid Token Error
  if (err.name === 'JsonWebTokenError') {
    logger.error('Invalid JWT token', err.message);
    return res.status(401).json(ApiResponse.fail('Invalid token. Please log in again.'));
  }

  // 6. JWT Expired Token Error (Triggers frontend interceptor refresh)
  if (err.name === 'TokenExpiredError') {
    logger.error('Expired JWT token', err.message);
    return res.status(401).json(ApiResponse.fail('Access token expired'));
  }

  // 7. Express JSON Parsing Syntax Error (Broken JSON payload)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.error('JSON parsing syntax error', err.message);
    return res.status(400).json(ApiResponse.fail('Invalid JSON format payload'));
  }

  // 8. Fallback Unhandled Server Error
  logger.error('Unhandled error', err.stack || err.message);
  return res.status(500).json(ApiResponse.fail('Internal server error'));
};
