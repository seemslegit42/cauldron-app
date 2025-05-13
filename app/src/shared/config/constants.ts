/**
 * Application Constants
 * 
 * This file contains application-wide constants.
 */

// Application information
export const APP_NAME = 'Cauldron';
export const APP_DESCRIPTION = 'A modular, AI-native, sentient enterprise OS';
export const APP_AUTHOR = 'BitBrew';

// Feature flags
export const FEATURES = {
  ENABLE_ANALYTICS: true,
  ENABLE_SENTIENT_LOOP: true,
  ENABLE_DARK_MODE: true,
  ENABLE_COOKIE_CONSENT: true,
};

// Default pagination settings
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// Date formats
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

// File upload limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
