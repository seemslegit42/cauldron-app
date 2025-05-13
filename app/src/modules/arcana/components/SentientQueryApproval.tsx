/**
 * Sentient Query Approval Component
 * 
 * This component provides a UI for approving, rejecting, or modifying agent-generated
 * queries through the Sentient Loop™ system.
 */

import React, { useState, useEffect } from 'react';
import { useSentientQueryApproval, QueryRequestWithDetails } from '../hooks/useSentientQueryApproval';
import { CodeBlock } from '@src/client/components/CodeBlock';
import { Button } from '@src/client/components/Button';
import { Spinner } from '@src/client/components/Spinner';
import { Badge } from '@src/client/components/Badge';
import { Tooltip } from '@src/client/components/Tooltip';
import { Modal } from '@src/client/components/Modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/client/components/Tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@src/client/components/Card';
import { Textarea } from '@src/client/components/Textarea';
import { Input } from '@src/client/components/Input';
import { Label } from '@src/client/components/Label';
import { Alert, AlertDescription, AlertTitle } from '@src/client/components/Alert';
import { AlertCircle, CheckCircle, XCircle, Edit, Eye, AlertTriangle, Clock, Database } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { QueryApprovalStatus } from '@src/shared/types/entities/agentQuery';

interface SentientQueryApprovalProps {
  moduleId?: string;
}

export function SentientQueryApproval({ moduleId = 'agent-query' }: SentientQueryApprovalProps) {
  const {
    pendingQueries,
    selectedQuery,
    isLoading,
    error,
    approveQuery,
    rejectQuery,
    modifyQuery,
    selectQuery,
    refreshQueries,
  } = useSentientQueryApproval({ moduleId });

  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [modifiedParams, setModifiedParams] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  // Initialize modified params when a query is selected
  useEffect(() => {
    if (selectedQuery) {
      setModifiedParams(JSON.stringify(selectedQuery.queryParams, null, 2));
    }
  }, [selectedQuery]);

  // Handle query approval
  const handleApprove = async () => {
    if (!selectedQuery) return;
    
    try {
      await approveQuery(selectedQuery.id, comment);
      refreshQueries();
      setComment('');
    } catch (error) {
      console.error('Error approving query:', error);
    }
  };

  // Handle query rejection
  const handleReject = async () => {
    if (!selectedQuery) return;
    
    try {
      await rejectQuery(selectedQuery.id, rejectionReason);
      setIsRejectModalOpen(false);
      refreshQueries();
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting query:', error);
    }
  };

  // Handle query modification
  const handleModify = async () => {
    if (!selectedQuery) return;
    
    try {
      // Parse the modified params
      const parsedParams = JSON.parse(modifiedParams);
      
      await modifyQuery(selectedQuery.id, parsedParams, comment);
      setIsModifyModalOpen(false);
      refreshQueries();
      setComment('');
    } catch (error) {
      console.error('Error modifying query:', error);
    }
  };

  // Render status badge
  const renderStatusBadge = (status: QueryApprovalStatus) => {
    switch (status) {
      case QueryApprovalStatus.PENDING:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case QueryApprovalStatus.APPROVED:
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case QueryApprovalStatus.AUTO_APPROVED:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Auto-Approved</Badge>;
      case QueryApprovalStatus.REJECTED:
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Render query list
  const renderQueryList = () => {
    if (!pendingQueries || pendingQueries.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Database className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">No pending queries</h3>
          <p className="text-sm text-gray-500 mt-2">
            All agent-generated queries have been processed.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {pendingQueries.map((query) => (
          <Card 
            key={query.id} 
            className={`cursor-pointer hover:border-primary transition-colors ${
              selectedQuery?.id === query.id ? 'border-primary' : ''
            }`}
            onClick={() => selectQuery(query.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">
                    {query.targetModel}.{query.action}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Agent: {query.agent.name}
                  </CardDescription>
                </div>
                {renderStatusBadge(query.status)}
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm line-clamp-2">{query.prompt}</p>
            </CardContent>
            <CardFooter className="pt-0 text-xs text-gray-500">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatDistanceToNow(new Date(query.createdAt), { addSuffix: true })}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  // Render query details
  const renderQueryDetails = () => {
    if (!selectedQuery) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <Eye className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">No query selected</h3>
          <p className="text-sm text-gray-500 mt-2">
            Select a query from the list to view its details.
          </p>
        </div>
      );
    }

    const validationResults = selectedQuery.validationResults || { valid: true };
    const metadata = selectedQuery.metadata || {};

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">
            {selectedQuery.targetModel}.{selectedQuery.action}
          </h3>
          {renderStatusBadge(selectedQuery.status)}
        </div>

        <div className="space-y-2">
          <Label>Prompt</Label>
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
            <p className="text-sm">{selectedQuery.prompt}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Generated Query</Label>
          <CodeBlock
            code={selectedQuery.generatedQuery}
            language="javascript"
            showLineNumbers
          />
        </div>

        <div className="space-y-2">
          <Label>Query Parameters</Label>
          <CodeBlock
            code={JSON.stringify(selectedQuery.queryParams, null, 2)}
            language="json"
            showLineNumbers
          />
        </div>

        {validationResults.warnings && validationResults.warnings.length > 0 && (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warnings</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside text-sm">
                {validationResults.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {metadata.isComplexQuery && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Complex Query</AlertTitle>
            <AlertDescription>
              This query has been flagged as complex and requires human review.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label>Comment (Optional)</Label>
          <Textarea
            placeholder="Add a comment about your decision..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            onClick={() => setIsRejectModalOpen(true)}
            className="flex items-center"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsModifyModalOpen(true)}
            className="flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Modify
          </Button>
          <Button
            onClick={handleApprove}
            className="flex items-center"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Sentient Query Approval</h2>
        <Button onClick={refreshQueries} variant="outline">
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Queries</CardTitle>
                <CardDescription>
                  {pendingQueries?.length || 0} pending queries
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderQueryList()}
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Query Details</CardTitle>
              </CardHeader>
              <CardContent>
                {renderQueryDetails()}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Modify Modal */}
      <Modal
        isOpen={isModifyModalOpen}
        onClose={() => setIsModifyModalOpen(false)}
        title="Modify Query Parameters"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Edit the query parameters below. Make sure the JSON is valid.
          </p>
          <div className="space-y-2">
            <Label>Query Parameters</Label>
            <Textarea
              className="font-mono h-64"
              value={modifiedParams}
              onChange={(e) => setModifiedParams(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModifyModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleModify}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Query"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Please provide a reason for rejecting this query.
          </p>
          <div className="space-y-2">
            <Label>Rejection Reason</Label>
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Query
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
