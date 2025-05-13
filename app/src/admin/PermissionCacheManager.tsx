/**
 * Permission Cache Manager Component
 * 
 * This component allows administrators to view and manage the permission cache.
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { PermissionGuard } from '../shared/components/auth/PermissionGuard';

// Mock operations - replace with actual operations
const getPermissionCacheStats = () => ({ data: { size: 0, hits: 0, misses: 0, hitRatePercentage: 0 } });
const clearPermissionCache = () => {};

const PermissionCacheManager: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  
  // Fetch cache statistics
  const { 
    data: stats, 
    isLoading, 
    error, 
    refetch 
  } = useQuery(getPermissionCacheStats);
  
  // Action to clear cache
  const clearCacheAction = useAction(clearPermissionCache);
  
  // Set up auto-refresh
  useEffect(() => {
    if (refreshInterval) {
      const intervalId = setInterval(() => {
        refetch();
      }, refreshInterval * 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, refetch]);
  
  // Handle clear cache for specific user
  const handleClearUserCache = async () => {
    if (!userId) {
      alert('Please enter a user ID');
      return;
    }
    
    await clearCacheAction({ userId });
    refetch();
  };
  
  // Handle clear all cache
  const handleClearAllCache = async () => {
    if (window.confirm('Are you sure you want to clear the entire permission cache?')) {
      await clearCacheAction({});
      refetch();
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Permission Cache</h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Permission Cache</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error.message}</p>
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
          <h2 className="text-xl font-semibold mb-4">Permission Cache</h2>
          <p>You do not have permission to manage the permission cache.</p>
        </div>
      }
    >
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Permission Cache Management</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cache Statistics */}
          <div>
            <h3 className="text-lg font-medium mb-2">Cache Statistics</h3>
            <div className="bg-gray-50 p-4 rounded">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Cache Size</p>
                  <p className="text-2xl font-semibold">{stats.size}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hit Rate</p>
                  <p className="text-2xl font-semibold">{stats.hitRatePercentage}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cache Hits</p>
                  <p className="text-2xl font-semibold">{stats.hits}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cache Misses</p>
                  <p className="text-2xl font-semibold">{stats.misses}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auto-refresh (seconds)
              </label>
              <div className="flex items-center space-x-2">
                <select
                  value={refreshInterval || ''}
                  onChange={(e) => setRefreshInterval(e.target.value ? Number(e.target.value) : null)}
                  className="border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">Disabled</option>
                  <option value="5">5 seconds</option>
                  <option value="10">10 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="60">1 minute</option>
                </select>
                <button
                  onClick={() => refetch()}
                  className="bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200"
                >
                  Refresh Now
                </button>
              </div>
            </div>
          </div>
          
          {/* Cache Management */}
          <div>
            <h3 className="text-lg font-medium mb-2">Cache Management</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clear Cache for User
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="User ID"
                    className="border border-gray-300 rounded-md shadow-sm p-2 flex-1"
                  />
                  <button
                    onClick={handleClearUserCache}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                  >
                    Clear
                  </button>
                </div>
              </div>
              
              <div>
                <button
                  onClick={handleClearAllCache}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full"
                >
                  Clear All Permission Cache
                </button>
                <p className="text-sm text-gray-500 mt-1">
                  This will clear the permission cache for all users.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
};

export default PermissionCacheManager;
