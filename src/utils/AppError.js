export class AppError extends Error {
  constructor(statusCode = 500, message = 'Internal server error', errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
  }
}
