import { AppError } from '../utils/AppError.js';

export const notFound = (_req, _res, next) => {
  next(new AppError(404, 'Route not found'));
};
