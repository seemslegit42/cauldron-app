/**
 * Email validation utility
 */

/**
 * Validates an email address
 * 
 * @param email The email address to validate
 * @returns Whether the email is valid
 * 
 * @example
 * ```
 * validateEmail('user@example.com') // true
 * validateEmail('invalid-email') // false
 * ```
 */
export function validateEmail(email: string): boolean {
  // RFC 5322 compliant email regex
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
}

/**
 * Gets a validation error message for an email address
 * 
 * @param email The email address to validate
 * @returns An error message if the email is invalid, or null if it's valid
 * 
 * @example
 * ```
 * getEmailValidationError('user@example.com') // null
 * getEmailValidationError('invalid-email') // 'Please enter a valid email address'
 * ```
 */
export function getEmailValidationError(email: string): string | null {
  if (!email) {
    return 'Email is required';
  }
  
  if (!validateEmail(email)) {
    return 'Please enter a valid email address';
  }
  
  return null;
}
