/**
 * Roles and Permissions Management Page
 * 
 * This page allows administrators to manage roles and permissions.
 */

import React, { useState } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { PermissionGuard } from '../shared/components/auth/PermissionGuard';

// Mock operations - replace with actual operations
const getRoles = () => ({ data: [] });
const getPermissions = () => ({ data: [] });
const createRole = () => {};
const updateRole = () => {};
const deleteRole = () => {};
const assignPermissionToRole = () => {};
const removePermissionFromRole = () => {};

const RolesAndPermissionsPage: React.FC = () => {
  // State for role form
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    isDefault: false
  });
  
  // State for selected role
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  
  // Fetch roles and permissions
  const { data: roles, isLoading: rolesLoading, error: rolesError } = useQuery(getRoles);
  const { data: permissions, isLoading: permissionsLoading, error: permissionsError } = useQuery(getPermissions);
  
  // Actions
  const createRoleAction = useAction(createRole);
  const updateRoleAction = useAction(updateRole);
  const deleteRoleAction = useAction(deleteRole);
  const assignPermissionAction = useAction(assignPermissionToRole);
  const removePermissionAction = useAction(removePermissionFromRole);
  
  // Handle role form submission
  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedRoleId) {
      // Update existing role
      await updateRoleAction({
        id: selectedRoleId,
        ...roleForm
      });
    } else {
      // Create new role
      await createRoleAction(roleForm);
    }
    
    // Reset form
    setRoleForm({
      name: '',
      description: '',
      isDefault: false
    });
    setSelectedRoleId(null);
  };
  
  // Handle role selection for editing
  const handleEditRole = (role: any) => {
    setSelectedRoleId(role.id);
    setRoleForm({
      name: role.name,
      description: role.description || '',
      isDefault: role.isDefault
    });
  };
  
  // Handle role deletion
  const handleDeleteRole = async (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      await deleteRoleAction({ id: roleId });
      
      if (selectedRoleId === roleId) {
        setSelectedRoleId(null);
        setRoleForm({
          name: '',
          description: '',
          isDefault: false
        });
      }
    }
  };
  
  // Handle permission assignment
  const handleAssignPermission = async (roleId: string, permissionId: string) => {
    await assignPermissionAction({
      roleId,
      permissionId
    });
  };
  
  // Handle permission removal
  const handleRemovePermission = async (roleId: string, permissionId: string) => {
    await removePermissionAction({
      roleId,
      permissionId
    });
  };
  
  // Check if permission is assigned to role
  const isPermissionAssigned = (role: any, permissionId: string) => {
    return role.permissions.some((p: any) => p.permissionId === permissionId);
  };
  
  if (rolesLoading || permissionsLoading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Roles & Permissions</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }
  
  if (rolesError || permissionsError) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Roles & Permissions</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {rolesError?.message || permissionsError?.message}</p>
        </div>
      </div>
    );
  }
  
  return (
    <PermissionGuard
      resource="system"
      action="admin"
      fallback={
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You do not have permission to manage roles and permissions.</p>
        </div>
      }
    >
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Roles & Permissions Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Role Management Section */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">
              {selectedRoleId ? 'Edit Role' : 'Create New Role'}
            </h2>
            
            <form onSubmit={handleRoleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role Name
                </label>
                <input
                  type="text"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={roleForm.isDefault}
                  onChange={(e) => setRoleForm({ ...roleForm, isDefault: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                  Default role for new users
                </label>
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  {selectedRoleId ? 'Update Role' : 'Create Role'}
                </button>
                
                {selectedRoleId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRoleId(null);
                      setRoleForm({
                        name: '',
                        description: '',
                        isDefault: false
                      });
                    }}
                    className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
            
            <h3 className="text-lg font-medium mt-8 mb-2">Existing Roles</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Default
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roles.map((role: any) => (
                    <tr key={role.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{role.name}</td>
                      <td className="px-6 py-4">{role.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {role.isDefault ? 'Yes' : 'No'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditRole(role)}
                            className="text-blue-500 hover:text-blue-700"
                            disabled={role.isSystem}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role.id)}
                            className="text-red-500 hover:text-red-700"
                            disabled={role.isSystem}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Permission Assignment Section */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Assign Permissions to Roles</h2>
            
            {selectedRoleId ? (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-medium">
                    Permissions for: {roles.find((r: any) => r.id === selectedRoleId)?.name}
                  </h3>
                </div>
                
                <div className="overflow-y-auto max-h-96">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Permission
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Resource
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assigned
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {permissions.map((permission: any) => {
                        const role = roles.find((r: any) => r.id === selectedRoleId);
                        const assigned = isPermissionAssigned(role, permission.id);
                        
                        return (
                          <tr key={permission.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{permission.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{permission.resource}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{permission.action}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={assigned}
                                onChange={() => {
                                  if (assigned) {
                                    handleRemovePermission(selectedRoleId, permission.id);
                                  } else {
                                    handleAssignPermission(selectedRoleId, permission.id);
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                disabled={role.isSystem}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-gray-500">
                Select a role to manage its permissions
              </div>
            )}
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
};

export default RolesAndPermissionsPage;
