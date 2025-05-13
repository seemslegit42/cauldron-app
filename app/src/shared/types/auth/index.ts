/**
 * Authentication-related types
 */

// User roles
export enum UserRole {
  USER = 'USER',
  AGENT = 'AGENT',
  OPERATOR = 'OPERATOR',
  ADMIN = 'ADMIN',
}

// Authentication methods
export enum AuthMethod {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  GITHUB = 'GITHUB',
  DISCORD = 'DISCORD',
}

// Authentication state
export interface AuthState {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** The current user */
  user: AuthUser | null;
  /** Whether the authentication state is loading */
  isLoading: boolean;
  /** Error message if authentication failed */
  error: string | null;
}

// Authenticated user
export interface AuthUser {
  /** Unique identifier for the user */
  id: string;
  /** User's email address */
  email: string;
  /** User's display name */
  username?: string;
  /** User's role */
  role: UserRole;
  /** Whether the user is an admin */
  isAdmin: boolean;
  /** When the user was created */
  createdAt: Date;
  /** Authentication method used */
  authMethod: AuthMethod;
  /** Whether the user's email is verified */
  isEmailVerified: boolean;
}

// Login credentials
export interface LoginCredentials {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
  /** Whether to remember the user */
  rememberMe?: boolean;
}

// Registration data
export interface RegistrationData {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
  /** User's display name */
  username?: string;
  /** Whether the user agrees to the terms of service */
  agreeToTerms: boolean;
}

// Password reset request
export interface PasswordResetRequest {
  /** User's email address */
  email: string;
}

// Password reset data
export interface PasswordResetData {
  /** Password reset token */
  token: string;
  /** New password */
  password: string;
  /** Confirm new password */
  confirmPassword: string;
}
