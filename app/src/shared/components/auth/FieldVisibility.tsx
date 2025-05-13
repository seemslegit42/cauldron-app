/**
 * Field Visibility Component
 * 
 * This component handles field-level visibility in the UI based on user permissions.
 * It can be used to show or hide specific fields in forms, tables, or detail views.
 */

import React from 'react';
import { useAuth } from 'wasp/client/auth';
import { hasPermission, type Resource, type ResourceAction } from '../../utils/permissionUtils';

interface FieldVisibilityProps {
  /** The resource being accessed */
  resource: Resource;
  /** The field name */
  field: string;
  /** The minimum permission level required to see this field */
  requiredAction: ResourceAction;
  /** Content to show when user has permission */
  children: React.ReactNode;
  /** Optional content to show when user doesn't have permission */
  fallback?: React.ReactNode;
  /** Whether to render nothing (instead of fallback) when permission is denied */
  renderNothing?: boolean;
}

/**
 * Component that conditionally renders a field based on user permissions
 */
export const FieldVisibility: React.FC<FieldVisibilityProps> = ({
  resource,
  field,
  requiredAction,
  children,
  fallback = null,
  renderNothing = false
}) => {
  // Get current user from auth context
  const { data: user, isLoading } = useAuth();
  
  // While loading, render nothing or fallback
  if (isLoading) {
    return renderNothing ? null : (
      <div className="text-gray-400">Loading...</div>
    );
  }
  
  // Check if user has permission
  const canViewField = hasPermission(user, resource, requiredAction);
  
  // Render based on permission
  if (canViewField) {
    return <>{children}</>;
  }
  
  // Render fallback or nothing
  return renderNothing ? null : <>{fallback}</>;
};

/**
 * Hook for checking field visibility in functional components
 */
export function useFieldVisibility(
  resource: Resource,
  fields: string[],
  requiredAction: ResourceAction = 'read'
): Record<string, boolean> {
  const { data: user, isLoading } = useAuth();
  
  if (isLoading || !user) {
    return fields.reduce((acc, field) => {
      acc[field] = false;
      return acc;
    }, {} as Record<string, boolean>);
  }
  
  const canViewResource = hasPermission(user, resource, requiredAction);
  
  return fields.reduce((acc, field) => {
    acc[field] = canViewResource;
    return acc;
  }, {} as Record<string, boolean>);
}

/**
 * Component for rendering a form field with permission check
 */
export const PermissionField: React.FC<{
  resource: Resource;
  field: string;
  requiredAction?: ResourceAction;
  label: string;
  children: React.ReactNode;
}> = ({ resource, field, requiredAction = 'update', label, children }) => {
  return (
    <FieldVisibility
      resource={resource}
      field={field}
      requiredAction={requiredAction}
      renderNothing={true}
    >
      <div className="form-field">
        <label htmlFor={field} className="form-label">
          {label}
        </label>
        <div className="form-input">
          {children}
        </div>
      </div>
    </FieldVisibility>
  );
};

/**
 * Component for rendering a table column with permission check
 */
export const PermissionColumn: React.FC<{
  resource: Resource;
  field: string;
  requiredAction?: ResourceAction;
  header: React.ReactNode;
  children: React.ReactNode;
}> = ({ resource, field, requiredAction = 'read', header, children }) => {
  const { data: user } = useAuth();
  const canViewField = hasPermission(user, resource, requiredAction);
  
  if (!canViewField) {
    return null;
  }
  
  return (
    <>
      <th>{header}</th>
      <td>{children}</td>
    </>
  );
};
