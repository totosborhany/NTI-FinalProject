import { AppError } from '../utils/AppError.js';

export  const authorizedTo = (...roles)=>{
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'You are not authorized to perform this action'));
    }
    next();
  };
};