/**
 * Export all role-related API routes
 */

export { getRoles, getRole, createRole, updateRole, deleteRole } from './roleManagement';
export { assignPermissionToRole, removePermissionFromRole } from './rolePermissions';
