# Global Types

This directory contains TypeScript type definitions that are used across the application.

## Directory Structure

- `/api`: API-related types (requests, responses, etc.)
- `/auth`: Authentication-related types
- `/entities`: Entity types (models)
- `/ui`: UI-related types
- `/utils`: Utility types

## Type Guidelines

### Type Structure

Each type file should follow this structure:

1. Import any dependencies
2. Define interfaces, types, and enums
3. Export all types

### Type Implementation

Types should:

- Be clearly named and documented
- Use TypeScript features like generics, unions, and intersections when appropriate
- Be as specific as possible to provide good type safety
- Include JSDoc comments for complex types

### Example Type File

```typescript
/**
 * User-related types
 */

// User roles
export enum UserRole {
  USER = 'USER',
  AGENT = 'AGENT',
  OPERATOR = 'OPERATOR',
  ADMIN = 'ADMIN',
}

// User profile
export interface UserProfile {
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
}

// User settings
export interface UserSettings {
  /** User's preferred theme */
  theme: 'light' | 'dark' | 'system';
  /** User's preferred language */
  language: string;
  /** User's notification preferences */
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

// Combined user data
export interface User extends UserProfile {
  /** User's settings */
  settings?: UserSettings;
}
```
