/**
 * API error handling utility
 */

/**
 * API error response
 */
export interface ApiErrorResponse {
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
  /** Error details */
  errors?: Array<{
    /** Field that caused the error */
    field?: string;
    /** Error message for the field */
    message: string;
    /** Error code for the field */
    code?: string;
  }>;
}

/**
 * Formatted API error
 */
export interface FormattedApiError {
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
  /** Field errors */
  fieldErrors?: Record<string, string>;
  /** Original error */
  originalError?: unknown;
  /** HTTP status code */
  status?: number;
}

/**
 * Handles an API error and returns a formatted error object
 * 
 * @param error The error to handle
 * @returns A formatted error object
 * 
 * @example
 * ```
 * try {
 *   const response = await fetch('/api/users');
 *   if (!response.ok) {
 *     throw response;
 *   }
 *   const data = await response.json();
 *   return data;
 * } catch (error) {
 *   const formattedError = handleApiError(error);
 *   console.error(formattedError.message);
 *   return null;
 * }
 * ```
 */
export function handleApiError(error: unknown): FormattedApiError {
  // Default error message
  let message = 'An unexpected error occurred';
  let code: string | undefined;
  let fieldErrors: Record<string, string> | undefined;
  let status: number | undefined;
  
  // Handle different error types
  if (error instanceof Response) {
    // Handle Response object
    status = error.status;
    
    // Try to parse the response body
    try {
      return error.json().then((data: ApiErrorResponse) => {
        message = data.message || getDefaultMessageForStatus(status);
        code = data.code;
        
        // Parse field errors
        if (data.errors && data.errors.length > 0) {
          fieldErrors = {};
          for (const err of data.errors) {
            if (err.field) {
              fieldErrors[err.field] = err.message;
            }
          }
        }
        
        return {
          message,
          code,
          fieldErrors,
          originalError: error,
          status,
        };
      });
    } catch {
      // If we can't parse the response body, use the status text
      message = error.statusText || getDefaultMessageForStatus(status);
    }
  } else if (error instanceof Error) {
    // Handle Error object
    message = error.message;
  } else if (typeof error === 'string') {
    // Handle string error
    message = error;
  } else if (typeof error === 'object' && error !== null) {
    // Handle object error
    const errorObj = error as Record<string, unknown>;
    
    if (typeof errorObj.message === 'string') {
      message = errorObj.message;
    }
    
    if (typeof errorObj.code === 'string') {
      code = errorObj.code;
    }
    
    if (typeof errorObj.status === 'number') {
      status = errorObj.status;
    }
  }
  
  return {
    message,
    code,
    fieldErrors,
    originalError: error,
    status,
  };
}

/**
 * Gets a default error message for an HTTP status code
 * 
 * @param status The HTTP status code
 * @returns A default error message
 */
function getDefaultMessageForStatus(status?: number): string {
  if (!status) {
    return 'An unexpected error occurred';
  }
  
  switch (status) {
    case 400:
      return 'Bad request';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden';
    case 404:
      return 'Not found';
    case 409:
      return 'Conflict';
    case 422:
      return 'Validation error';
    case 429:
      return 'Too many requests';
    case 500:
      return 'Internal server error';
    case 502:
      return 'Bad gateway';
    case 503:
      return 'Service unavailable';
    case 504:
      return 'Gateway timeout';
    default:
      return `Error ${status}`;
  }
}
