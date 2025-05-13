/**
 * User List Page
 * 
 * This page demonstrates the use of permission-based UI components.
 */

import React, { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { Link } from 'react-router-dom';
import { PermissionGuard, usePermission } from '../../../shared/components/auth/PermissionGuard';
import { FieldVisibility } from '../../../shared/components/auth/FieldVisibility';
import { getUsersWithRBAC } from 'wasp/client/operations';

const UserListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  
  // Check if user can create new users
  const canCreateUsers = usePermission('users', 'create');
  
  // Fetch users with RBAC
  const { data, isLoading, error } = useQuery(getUsersWithRBAC, {
    page,
    pageSize,
    search: search || undefined
  });
  
  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Users</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Users</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error.message}</p>
        </div>
      </div>
    );
  }
  
  const { users, pagination } = data;
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        
        {/* Create User Button - Only visible with 'users:create' permission */}
        <PermissionGuard
          resource="users"
          action="create"
          renderNothing={true}
        >
          <Link
            to="/users/new"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create User
          </Link>
        </PermissionGuard>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-l px-4 py-2 w-full"
          />
          <button
            onClick={() => setPage(1)} // Reset to first page on search
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-r"
          >
            Search
          </button>
        </div>
      </div>
      
      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Email</th>
              
              {/* Role Column - Only visible with 'users:manage' permission */}
              <FieldVisibility
                resource="users"
                field="role"
                requiredAction="manage"
                renderNothing={true}
              >
                <th className="py-2 px-4 border">Role</th>
              </FieldVisibility>
              
              {/* Organization Column - Only visible with 'organizations:read' permission */}
              <FieldVisibility
                resource="organizations"
                field="name"
                requiredAction="read"
                renderNothing={true}
              >
                <th className="py-2 px-4 border">Organization</th>
              </FieldVisibility>
              
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border">
                  {user.firstName} {user.lastName}
                </td>
                <td className="py-2 px-4 border">{user.email}</td>
                
                {/* Role Cell - Only visible with 'users:manage' permission */}
                <FieldVisibility
                  resource="users"
                  field="role"
                  requiredAction="manage"
                  renderNothing={true}
                >
                  <td className="py-2 px-4 border">
                    {user.role?.name || 'No Role'}
                  </td>
                </FieldVisibility>
                
                {/* Organization Cell - Only visible with 'organizations:read' permission */}
                <FieldVisibility
                  resource="organizations"
                  field="name"
                  requiredAction="read"
                  renderNothing={true}
                >
                  <td className="py-2 px-4 border">
                    {user.organization?.name || 'No Organization'}
                  </td>
                </FieldVisibility>
                
                <td className="py-2 px-4 border">
                  <div className="flex space-x-2">
                    {/* View Button - Always visible */}
                    <Link
                      to={`/users/${user.id}`}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      View
                    </Link>
                    
                    {/* Edit Button - Only visible with 'users:update' permission or for own profile */}
                    <PermissionGuard
                      resource="users"
                      action="update"
                      resourceOwnerId={user.id}
                      renderNothing={true}
                    >
                      <Link
                        to={`/users/${user.id}/edit`}
                        className="text-green-500 hover:text-green-700"
                      >
                        Edit
                      </Link>
                    </PermissionGuard>
                    
                    {/* Delete Button - Only visible with 'users:delete' permission */}
                    <PermissionGuard
                      resource="users"
                      action="delete"
                      renderNothing={true}
                    >
                      <button
                        onClick={() => {/* Delete logic */}}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </PermissionGuard>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div>
          Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, pagination.totalCount)} of {pagination.totalCount} users
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className={`px-3 py-1 rounded ${page === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Previous
          </button>
          <button
            onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
            disabled={page === pagination.totalPages}
            className={`px-3 py-1 rounded ${page === pagination.totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserListPage;
