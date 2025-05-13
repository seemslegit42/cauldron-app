import React from 'react';
import { ThreatWorkflowTester } from '../components/ThreatWorkflowTester';
import { PageLayout } from '@src/shared/components/layout/PageLayout';

export function LangGraphTestPage() {
  return (
    <PageLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">LangGraph Test</h1>
          <p className="text-muted-foreground mt-2">
            Test the LangGraph implementation for threat research and drafting
          </p>
        </div>
        
        <div className="bg-card rounded-lg border p-6">
          <ThreatWorkflowTester />
        </div>
      </div>
    </PageLayout>
  );
}
