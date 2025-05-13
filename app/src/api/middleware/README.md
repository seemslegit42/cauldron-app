# Role-Based Access Control (RBAC) Middleware

This directory contains middleware for implementing Role-Based Access Control (RBAC) in the Cauldron application.

## Overview

The RBAC middleware provides:

- **Dynamic permission checking** based on user roles and permissions
- **Resource-level access control** for different types of resources
- **Action-level permissions** for operations like create, read, update, delete
- **Field-level visibility control** to restrict access to sensitive fields
- **Organization/multi-tenancy aware permissions** to enforce data isolation
- **Admin overrides** for system administrators
- **Audit logging** for permission checks and rejections

## Files

- `rbac.ts` - Core RBAC middleware and permission checking utilities
- `rbacUtils.ts` - Helper functions for common RBAC patterns
- `fieldAccess.ts` - Field-level access control utilities

## Usage

### Basic Permission Check

```typescript
import { requirePermission } from '../../middleware/rbac';

export const getUsers = async (args, context) => {
  // Apply RBAC middleware - require 'users:read' permission
  const user = await requirePermission({
    resource: 'users',
    action: 'read',
    adminOverride: true,
    auditRejection: true
  })(context);
  
  // Route handler logic...
};
```

### Organization-Specific Permission Check

```typescript
import { requirePermission } from '../../middleware/rbac';

export const getOrganization = async (args, context) => {
  // Apply RBAC middleware - require 'organizations:read' permission
  // and check if user belongs to this organization
  const user = await requirePermission({
    resource: 'organizations',
    action: 'read',
    organizationId: args.organizationId,
    adminOverride: true,
    auditRejection: true
  })(context);
  
  // Route handler logic...
};
```

### Resource Owner Permission Check

```typescript
import { requirePermission } from '../../middleware/rbac';

export const updateUserProfile = async (args, context) => {
  // Apply RBAC middleware - require 'users:update' permission
  // and check if user is the owner of the resource
  const user = await requirePermission({
    resource: 'users',
    action: 'update',
    resourceOwnerId: args.userId,
    adminOverride: true,
    auditRejection: true
  })(context);
  
  // Route handler logic...
};
```

### Field-Level Access Control

```typescript
import { applyFieldAccess } from '../../middleware/fieldAccess';

export const getUserProfile = async (args, context) => {
  // Get user data
  const userData = await prisma.user.findUnique({
    where: { id: args.userId }
  });
  
  // Apply field-level access control
  const filteredData = await applyFieldAccess(userData, context.user, 'users', 'read');
  
  return filteredData;
};
```

## Permission Naming Convention

Permissions follow the format: `resource:action`

Examples:
- `users:read` - Permission to read user data
- `organizations:manage` - Permission to manage organizations (implies all actions)
- `agents:execute` - Permission to execute agents
- `modules:use` - Permission to use modules

## Admin Override

By default, users with the `isAdmin` flag set to `true` bypass permission checks when `adminOverride` is enabled in the middleware options.

## Audit Logging

When `auditRejection` is enabled, the middleware logs permission rejections to the system log, including:
- User ID
- Resource and action
- Request path
- Timestamp

## Client-Side Permission Utilities

The `permissionUtils.ts` file in `src/shared/utils` provides client-side utilities for checking permissions to conditionally render UI elements based on user permissions.

```typescript
import { hasPermission } from '../../shared/utils/permissionUtils';

// In a React component
if (hasPermission(user, 'users', 'create')) {
  // Render create user button
}
```
