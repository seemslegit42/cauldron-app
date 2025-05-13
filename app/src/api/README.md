# API Structure

This directory contains the API routes and middleware for the Cauldron application.

## Directory Structure

- `/middleware`: Contains middleware functions for authentication, error handling, etc.
- `/routes`: Contains API route handlers organized by domain
- `/validators`: Contains validation schemas for API requests
- `/utils`: Contains utility functions specific to API operations

## Usage Guidelines

### Creating a New API Route

1. Create a new file in the appropriate domain directory under `/routes`
2. Import necessary middleware from `/middleware`
3. Define your route handler function
4. Export the route handler

Example:

```typescript
// /api/routes/users/getUserProfile.ts
import { prisma } from 'wasp/server';
import { HttpError } from 'wasp/server';
import { authenticate } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { userProfileSchema } from '../../validators/userSchemas';

export const getUserProfile = async (args, context) => {
  // Apply middleware
  authenticate(context);
  validateRequest(args, userProfileSchema);
  
  // Route handler logic
  const { userId } = args;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      // Add other fields as needed
    }
  });
  
  if (!user) {
    throw new HttpError(404, 'User not found');
  }
  
  return user;
};
```

### Using Middleware

Middleware functions are designed to be composable. You can apply multiple middleware functions to a single route handler.

### Error Handling

All API routes should use the standard error handling pattern:

1. Use try/catch blocks for async operations
2. Throw HttpError with appropriate status codes
3. Let the error middleware handle the response
