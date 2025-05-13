/**
 * Permission Guard Component
 * 
 * This component conditionally renders its children based on user permissions.
 * It's used to show or hide UI elements based on the user's role and permissions.
 */

import React from 'react';
import { useAuth } from 'wasp/client/auth';
import { canAccessResource, type Resource, type ResourceAction } from '../../utils/permissionUtils';

interface PermissionGuardProps {
  /** The resource being accessed */
  resource: Resource;
  /** The action being performed */
  action: ResourceAction;
  /** Optional resource owner ID */
  resourceOwnerId?: string;
  /** Optional organization ID */
  organizationId?: string;
  /** Content to show when user has permission */
  children: React.ReactNode;
  /** Optional content to show when user doesn't have permission */
  fallback?: React.ReactNode;
  /** Whether to render nothing (instead of fallback) when permission is denied */
  renderNothing?: boolean;
}

/**
 * Component that conditionally renders content based on user permissions
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  resource,
  action,
  resourceOwnerId,
  organizationId,
  children,
  fallback = null,
  renderNothing = false
}) => {
  // Get current user from auth context
  const { data: user, isLoading } = useAuth();
  
  // While loading, render nothing or fallback
  if (isLoading) {
    return renderNothing ? null : (
      <div className="text-gray-400">Loading permissions...</div>
    );
  }
  
  // Check if user has permission
  const hasPermission = canAccessResource(user, resource, action, {
    resourceUserId: resourceOwnerId,
    organizationId
  });
  
  // Render based on permission
  if (hasPermission) {
    return <>{children}</>;
  }
  
  // Render fallback or nothing
  return renderNothing ? null : <>{fallback}</>;
};

/**
 * Higher-order component that wraps a component with permission check
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  resource: Resource,
  action: ResourceAction,
  options?: {
    fallback?: React.ComponentType<P>;
    renderNothing?: boolean;
  }
) {
  const WithPermissionComponent = (props: P) => {
    return (
      <PermissionGuard
        resource={resource}
        action={action}
        fallback={options?.fallback ? <options.fallback {...props} /> : null}
        renderNothing={options?.renderNothing}
      >
        <Component {...props} />
      </PermissionGuard>
    );
  };
  
  // Set display name for debugging
  const displayName = Component.displayName || Component.name || 'Component';
  WithPermissionComponent.displayName = `withPermission(${displayName})`;
  
  return WithPermissionComponent;
}

/**
 * Hook for checking permissions in functional components
 */
export function usePermission(
  resource: Resource,
  action: ResourceAction,
  options?: {
    resourceOwnerId?: string;
    organizationId?: string;
  }
): boolean {
  const { data: user, isLoading } = useAuth();
  
  if (isLoading || !user) {
    return false;
  }
  
  return canAccessResource(user, resource, action, {
    resourceUserId: options?.resourceOwnerId,
    organizationId: options?.organizationId
  });
}
