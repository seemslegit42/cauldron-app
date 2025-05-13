import React, { useState, useEffect } from 'react';
import { useSentientLoopRecovery } from '../hooks/useSentientLoopRecovery';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Alert, 
  AlertTitle, 
  AlertDescription 
} from '@/components/ui/alert';
import { 
  Badge, 
  Button, 
  Spinner, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui';
import { 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Shield 
} from 'lucide-react';

interface SentientLoopFailureManagerProps {
  moduleId?: string;
  showHeader?: boolean;
  maxFailures?: number;
  onRecoveryComplete?: () => void;
}

/**
 * Component for displaying and managing Sentient Loop failures
 */
export function SentientLoopFailureManager({
  moduleId,
  showHeader = true,
  maxFailures = 5,
  onRecoveryComplete
}: SentientLoopFailureManagerProps) {
  // Get failure management functionality
  const {
    activeFailures,
    failureStats,
    isLoadingStats,
    statsError,
    recoveryInProgress,
    acknowledgeFailure,
    getRecoveryOptions,
    executeRecovery
  } = useSentientLoopRecovery(moduleId);
  
  // State for recovery options
  const [failureRecoveryOptions, setFailureRecoveryOptions] = useState<Record<string, any[]>>({});
  
  // State for selected recovery options
  const [selectedRecoveryOptions, setSelectedRecoveryOptions] = useState<Record<string, string>>({});
  
  // State for expanded failures
  const [expandedFailures, setExpandedFailures] = useState<Record<string, boolean>>({});
  
  // Load recovery options for active failures
  useEffect(() => {
    async function loadRecoveryOptions() {
      for (const failure of activeFailures) {
        if (!failureRecoveryOptions[failure.id]) {
          try {
            const options = await getRecoveryOptions(failure.id);
            setFailureRecoveryOptions(prev => ({
              ...prev,
              [failure.id]: options
            }));
            
            // Select the first option by default
            if (options.length > 0) {
              setSelectedRecoveryOptions(prev => ({
                ...prev,
                [failure.id]: options[0].id
              }));
            }
          } catch (error) {
            console.error(`Error loading recovery options for failure ${failure.id}:`, error);
          }
        }
      }
    }
    
    loadRecoveryOptions();
  }, [activeFailures, failureRecoveryOptions, getRecoveryOptions]);
  
  // Handle acknowledging a failure
  const handleAcknowledge = async (failureId: string) => {
    try {
      await acknowledgeFailure(failureId);
    } catch (error) {
      console.error(`Error acknowledging failure ${failureId}:`, error);
    }
  };
  
  // Handle executing recovery for a failure
  const handleRecovery = async (failureId: string) => {
    const recoveryOptionId = selectedRecoveryOptions[failureId];
    
    if (!recoveryOptionId) {
      console.error(`No recovery option selected for failure ${failureId}`);
      return;
    }
    
    try {
      const result = await executeRecovery({
        failureId,
        recoveryOptionId
      });
      
      if (result.status === 'SUCCESS' && onRecoveryComplete) {
        onRecoveryComplete();
      }
    } catch (error) {
      console.error(`Error executing recovery for failure ${failureId}:`, error);
    }
  };
  
  // Handle toggling failure expansion
  const toggleFailureExpansion = (failureId: string) => {
    setExpandedFailures(prev => ({
      ...prev,
      [failureId]: !prev[failureId]
    }));
  };
  
  // Get failure severity badge
  const getFailureSeverityBadge = (type: string) => {
    switch (type) {
      case 'TIMEOUT':
        return <Badge variant="warning">Timeout</Badge>;
      case 'OPERATION_ERROR':
        return <Badge variant="destructive">Operation Error</Badge>;
      case 'DECISION_ERROR':
        return <Badge variant="warning">Decision Error</Badge>;
      case 'INTEGRATION_ERROR':
        return <Badge variant="destructive">Integration Error</Badge>;
      case 'MEMORY_ERROR':
        return <Badge variant="warning">Memory Error</Badge>;
      case 'HITL_ERROR':
        return <Badge variant="warning">Human-in-the-Loop Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Get failure icon
  const getFailureIcon = (type: string) => {
    switch (type) {
      case 'TIMEOUT':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'OPERATION_ERROR':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'DECISION_ERROR':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'INTEGRATION_ERROR':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'MEMORY_ERROR':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'HITL_ERROR':
        return <Shield className="h-5 w-5 text-amber-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // If loading, show spinner
  if (isLoadingStats) {
    return (
      <div className="flex justify-center items-center p-4">
        <Spinner size="md" />
      </div>
    );
  }
  
  // If error, show error message
  if (statsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load Sentient Loop failure stats. Please try again.
        </AlertDescription>
      </Alert>
    );
  }
  
  // If no active failures, show success message
  if (!activeFailures.length) {
    return (
      <Alert variant="success" className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertTitle>All Systems Operational</AlertTitle>
        <AlertDescription>
          No active Sentient Loop failures detected.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Limit the number of failures shown
  const displayedFailures = activeFailures.slice(0, maxFailures);
  
  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle>Sentient Loop™ Failure Manager</CardTitle>
          <CardDescription>
            {activeFailures.length} active failure{activeFailures.length !== 1 ? 's' : ''} detected
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent>
        <div className="space-y-4">
          {displayedFailures.map(failure => (
            <div 
              key={failure.id} 
              className="border rounded-lg p-4 bg-white dark:bg-gray-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getFailureIcon(failure.type)}
                  <div>
                    <h4 className="font-medium">{failure.operationName}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      {getFailureSeverityBadge(failure.type)}
                      <span className="text-xs text-gray-500">
                        {new Date(failure.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFailureExpansion(failure.id)}
                >
                  {expandedFailures[failure.id] ? 'Hide Details' : 'Show Details'}
                </Button>
              </div>
              
              {expandedFailures[failure.id] && (
                <div className="mt-4 space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-sm">
                    <p><strong>Module:</strong> {failure.moduleId}</p>
                    <p><strong>Status:</strong> {failure.status}</p>
                    <p><strong>Recovery Attempts:</strong> {failure.recoveryAttempts}</p>
                    {failure.lastRecoveryAttempt && (
                      <p><strong>Last Recovery Attempt:</strong> {new Date(failure.lastRecoveryAttempt).toLocaleString()}</p>
                    )}
                    {failure.metadata && (
                      <div className="mt-2">
                        <strong>Additional Details:</strong>
                        <pre className="text-xs mt-1 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                          {JSON.stringify(failure.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">Recovery Options</h5>
                    {failureRecoveryOptions[failure.id]?.length > 0 ? (
                      <div className="space-y-3">
                        <Select
                          value={selectedRecoveryOptions[failure.id]}
                          onValueChange={(value) => {
                            setSelectedRecoveryOptions(prev => ({
                              ...prev,
                              [failure.id]: value
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a recovery option" />
                          </SelectTrigger>
                          <SelectContent>
                            {failureRecoveryOptions[failure.id].map(option => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.name} ({option.confidence.toFixed(2)} confidence)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="default"
                            onClick={() => handleRecovery(failure.id)}
                            disabled={recoveryInProgress[failure.id] || !selectedRecoveryOptions[failure.id]}
                            className="flex-1"
                          >
                            {recoveryInProgress[failure.id] ? (
                              <>
                                <Spinner size="sm" className="mr-2" />
                                Recovering...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Execute Recovery
                              </>
                            )}
                          </Button>
                          
                          {failure.status === 'ACTIVE' && (
                            <Button
                              variant="outline"
                              onClick={() => handleAcknowledge(failure.id)}
                              disabled={recoveryInProgress[failure.id]}
                            >
                              Acknowledge
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Loading recovery options...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {activeFailures.length > maxFailures && (
            <p className="text-sm text-gray-500 text-center">
              {activeFailures.length - maxFailures} more failure{activeFailures.length - maxFailures !== 1 ? 's' : ''} not shown
            </p>
          )}
        </div>
      </CardContent>
      
      {showHeader && (
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
          <Button variant="outline" size="sm">
            View All Failures
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
