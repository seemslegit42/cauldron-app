/**
 * Password validation utility
 */

/**
 * Password validation options
 */
export interface PasswordValidationOptions {
  /** Minimum password length */
  minLength?: number;
  /** Whether to require at least one uppercase letter */
  requireUppercase?: boolean;
  /** Whether to require at least one lowercase letter */
  requireLowercase?: boolean;
  /** Whether to require at least one number */
  requireNumber?: boolean;
  /** Whether to require at least one special character */
  requireSpecial?: boolean;
}

/**
 * Default password validation options
 */
const defaultOptions: PasswordValidationOptions = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: false,
};

/**
 * Validates a password
 * 
 * @param password The password to validate
 * @param options Validation options
 * @returns Whether the password is valid
 * 
 * @example
 * ```
 * validatePassword('Password123') // true
 * validatePassword('weak') // false
 * ```
 */
export function validatePassword(
  password: string,
  options: PasswordValidationOptions = defaultOptions
): boolean {
  const { 
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecial = false,
  } = options;
  
  // Check length
  if (password.length < minLength) {
    return false;
  }
  
  // Check for uppercase letters
  if (requireUppercase && !/[A-Z]/.test(password)) {
    return false;
  }
  
  // Check for lowercase letters
  if (requireLowercase && !/[a-z]/.test(password)) {
    return false;
  }
  
  // Check for numbers
  if (requireNumber && !/[0-9]/.test(password)) {
    return false;
  }
  
  // Check for special characters
  if (requireSpecial && !/[^A-Za-z0-9]/.test(password)) {
    return false;
  }
  
  return true;
}

/**
 * Gets a validation error message for a password
 * 
 * @param password The password to validate
 * @param options Validation options
 * @returns An error message if the password is invalid, or null if it's valid
 * 
 * @example
 * ```
 * getPasswordValidationError('Password123') // null
 * getPasswordValidationError('weak') // 'Password must be at least 8 characters long'
 * ```
 */
export function getPasswordValidationError(
  password: string,
  options: PasswordValidationOptions = defaultOptions
): string | null {
  const { 
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecial = false,
  } = options;
  
  if (!password) {
    return 'Password is required';
  }
  
  // Check length
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long`;
  }
  
  // Check for uppercase letters
  if (requireUppercase && !/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  
  // Check for lowercase letters
  if (requireLowercase && !/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  
  // Check for numbers
  if (requireNumber && !/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  
  // Check for special characters
  if (requireSpecial && !/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  
  return null;
}
