import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const validate = catchAsync(async (_req, _res, next) => {
  next(new AppError(501, 'Validation middleware scaffold is ready. Implement it next.'));
});
