/**
 * RBAC Dashboard Page
 * 
 * This page provides a comprehensive dashboard for managing roles, permissions,
 * and the permission cache.
 */

import React, { useState } from 'react';
import { PermissionGuard } from '../shared/components/auth/PermissionGuard';
import RolesAndPermissionsPage from './RolesAndPermissionsPage';
import PermissionCacheManager from './PermissionCacheManager';

// Tab options
type TabOption = 'roles' | 'cache';

const RBACDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabOption>('roles');
  
  return (
    <PermissionGuard
      resource="system"
      action="admin"
      fallback={
        <div className="p-8 max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Access Denied</h1>
          <p className="text-lg text-gray-700">
            You do not have permission to access the RBAC Dashboard.
            Please contact an administrator if you believe this is an error.
          </p>
        </div>
      }
    >
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">RBAC Dashboard</h1>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('roles')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'roles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Roles & Permissions
            </button>
            <button
              onClick={() => setActiveTab('cache')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cache'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Permission Cache
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'roles' && <RolesAndPermissionsPage />}
          {activeTab === 'cache' && <PermissionCacheManager />}
        </div>
      </div>
    </PermissionGuard>
  );
};

export default RBACDashboardPage;
