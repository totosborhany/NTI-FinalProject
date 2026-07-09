export class ApiResponse {

  static success(message = 'Operation successful', data = null) {
    return {
      success: true,
      message,
      data,
    };
  }
  /**
   * Generates a failed response object.
   * @param {string} message - A clear message describing what went wrong.
   * @param {any} errors - Validation errors, system details, or specific issue descriptions.
   */

  static fail(message = 'Operation failed', errors = null) {
    return {
      success: false,
      message,
      errors,
    };
  }
}
