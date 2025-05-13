import React from 'react';
import { Link } from 'react-router-dom';
import { useExecutiveAdvisor } from '../agentHooks';
import { ExecutiveAdvisorPanel } from '../components';
import { PageLayout } from '@src/shared/components/layout';
import { PermissionGuard } from '@src/shared/components/auth/PermissionGuard';
import { ExecutiveAdvisorTone } from '../types';
import { EXECUTIVE_ADVISOR_RESOURCE, READ_ACTION, useCanViewExecutiveAdvisor } from '../utils/permissionUtils';

export function ExecutiveAdvisorPage() {
  // Check if user has permission to view the Executive Advisor
  const canViewExecutiveAdvisor = useCanViewExecutiveAdvisor();
  
  const {
    executiveAdvice,
    communicationStyle,
    setCommunicationStyle,
    isLoading,
    error,
    refetchExecutiveAdvice
  } = useExecutiveAdvisor();

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Executive Advisor</h1>
            <p className="text-gray-400 mt-2">
              Get strategic business advice tailored to your communication style and business goals.
            </p>
          </div>
          <div>
            <Link
              to="/athena"
              className="rounded-md bg-gray-700 px-4 py-2 font-medium text-white hover:bg-gray-600"
            >
              Return to Athena Dashboard
            </Link>
          </div>
        </div>

        {/* If user doesn't have permission, show a message */}
        {!canViewExecutiveAdvisor ? (
          <div className="rounded-lg bg-gray-800 p-6 shadow-md">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">Access Restricted</h2>
            <p className="text-gray-300 mb-6">
              You don't have permission to access the Executive Advisor.
              Please contact your administrator to request access.
            </p>
            <Link
              to="/athena"
              className="rounded-md bg-gray-700 px-4 py-2 font-medium text-white hover:bg-gray-600"
            >
              Return to Athena Dashboard
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-900/50 rounded-lg">
                <p className="text-red-300">Error: {error.message || 'An error occurred'}</p>
              </div>
            )}

            <ExecutiveAdvisorPanel
              executiveAdvice={executiveAdvice}
              isLoading={isLoading}
              communicationStyle={communicationStyle}
              onCommunicationStyleChange={(style: ExecutiveAdvisorTone) => {
                setCommunicationStyle(style);
                refetchExecutiveAdvice();
              }}
              onRefresh={refetchExecutiveAdvice}
            />
          </>
        )}
      </div>
    </PageLayout>
  );
}