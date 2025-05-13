import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { useQuery, useAction } from 'wasp/client/operations';
import { getFeedback, getEscalations } from 'wasp/client/operations';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Alert } from './Alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { Pagination } from '../ui/Pagination';
import { formatDistanceToNow } from 'date-fns';

export interface FeedbackModerationProps {
  className?: string;
  defaultTab?: 'feedback' | 'escalations';
}

/**
 * FeedbackModeration component for reviewing and moderating agent feedback and escalations
 */
export const FeedbackModeration: React.FC<FeedbackModerationProps> = ({
  className,
  defaultTab = 'feedback',
}) => {
  const [activeTab, setActiveTab] = useState<'feedback' | 'escalations'>(defaultTab);
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [escalationsPage, setEscalationsPage] = useState(1);
  const [feedbackFilters, setFeedbackFilters] = useState({
    agentId: '',
    minRating: undefined as number | undefined,
    maxRating: undefined as number | undefined,
    category: '',
  });
  const [escalationFilters, setEscalationFilters] = useState({
    agentId: '',
    status: '' as '' | 'pending' | 'in_progress' | 'resolved' | 'rejected',
    priority: '' as '' | 'low' | 'medium' | 'high' | 'critical',
  });

  // Fetch feedback data
  const { data: feedbackData, isLoading: isFeedbackLoading, error: feedbackError, refetch: refetchFeedback } = 
    useQuery(getFeedback, {
      agentId: feedbackFilters.agentId || undefined,
      minRating: feedbackFilters.minRating,
      maxRating: feedbackFilters.maxRating,
      category: feedbackFilters.category || undefined,
      page: feedbackPage,
      limit: 10,
    });

  // Fetch escalations data
  const { data: escalationsData, isLoading: isEscalationsLoading, error: escalationsError, refetch: refetchEscalations } = 
    useQuery(getEscalations, {
      agentId: escalationFilters.agentId || undefined,
      status: escalationFilters.status || undefined,
      priority: escalationFilters.priority || undefined,
      page: escalationsPage,
      limit: 10,
    });

  // Handle feedback filter changes
  const handleFeedbackFilterChange = (key: string, value: any) => {
    setFeedbackFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setFeedbackPage(1); // Reset to first page when filters change
  };

  // Handle escalation filter changes
  const handleEscalationFilterChange = (key: string, value: any) => {
    setEscalationFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setEscalationsPage(1); // Reset to first page when filters change
  };

  // Get rating badge color
  const getRatingBadgeColor = (rating: number) => {
    if (rating <= 2) return 'destructive';
    if (rating === 3) return 'warning';
    return 'success';
  };

  // Get priority badge color
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'default';
      case 'medium': return 'warning';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'default';
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'resolved': return 'success';
      case 'rejected': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>Agent Feedback Moderation</CardTitle>
        <CardDescription>
          Review and moderate agent feedback and escalations
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'feedback' | 'escalations')}>
          <TabsList className="mb-4">
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="escalations">Escalations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feedback">
            {/* Feedback Filters */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="w-full md:w-auto">
                <Input
                  placeholder="Agent ID"
                  value={feedbackFilters.agentId}
                  onChange={(e) => handleFeedbackFilterChange('agentId', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-full md:w-auto">
                <Select
                  value={feedbackFilters.minRating?.toString() || ''}
                  onValueChange={(value) => handleFeedbackFilterChange('minRating', value ? parseInt(value) : undefined)}
                  className="w-full"
                >
                  <option value="">Min Rating</option>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <option key={rating} value={rating}>{rating}</option>
                  ))}
                </Select>
              </div>
              <div className="w-full md:w-auto">
                <Select
                  value={feedbackFilters.maxRating?.toString() || ''}
                  onValueChange={(value) => handleFeedbackFilterChange('maxRating', value ? parseInt(value) : undefined)}
                  className="w-full"
                >
                  <option value="">Max Rating</option>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <option key={rating} value={rating}>{rating}</option>
                  ))}
                </Select>
              </div>
              <div className="w-full md:w-auto">
                <Input
                  placeholder="Category"
                  value={feedbackFilters.category}
                  onChange={(e) => handleFeedbackFilterChange('category', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-full md:w-auto">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFeedbackFilters({
                      agentId: '',
                      minRating: undefined,
                      maxRating: undefined,
                      category: '',
                    });
                    setFeedbackPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
            
            {/* Feedback Table */}
            {feedbackError ? (
              <Alert variant="error" className="mb-4">
                Error loading feedback: {feedbackError.message}
              </Alert>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Agent</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Feedback</TableHead>
                        <TableHead>Category</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isFeedbackLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : feedbackData?.data.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            No feedback found
                          </TableCell>
                        </TableRow>
                      ) : (
                        feedbackData?.data.map((feedback) => (
                          <TableRow key={feedback.id}>
                            <TableCell>
                              {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
                            </TableCell>
                            <TableCell>{feedback.user.username || feedback.user.email}</TableCell>
                            <TableCell>{feedback.agent.name}</TableCell>
                            <TableCell>
                              <Badge variant={getRatingBadgeColor(feedback.rating)}>
                                {feedback.rating}/5
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {feedback.feedback || '-'}
                            </TableCell>
                            <TableCell>{feedback.category || '-'}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Feedback Pagination */}
                {feedbackData && (
                  <Pagination
                    className="mt-4"
                    currentPage={feedbackPage}
                    totalPages={feedbackData.pagination.pages}
                    onPageChange={setFeedbackPage}
                  />
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="escalations">
            {/* Escalation Filters */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="w-full md:w-auto">
                <Input
                  placeholder="Agent ID"
                  value={escalationFilters.agentId}
                  onChange={(e) => handleEscalationFilterChange('agentId', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-full md:w-auto">
                <Select
                  value={escalationFilters.status}
                  onValueChange={(value) => handleEscalationFilterChange('status', value)}
                  className="w-full"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </Select>
              </div>
              <div className="w-full md:w-auto">
                <Select
                  value={escalationFilters.priority}
                  onValueChange={(value) => handleEscalationFilterChange('priority', value)}
                  className="w-full"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </Select>
              </div>
              <div className="w-full md:w-auto">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEscalationFilters({
                      agentId: '',
                      status: '',
                      priority: '',
                    });
                    setEscalationsPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
            
            {/* Escalations Table */}
            {escalationsError ? (
              <Alert variant="error" className="mb-4">
                Error loading escalations: {escalationsError.message}
              </Alert>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Agent</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isEscalationsLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : escalationsData?.data.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            No escalations found
                          </TableCell>
                        </TableRow>
                      ) : (
                        escalationsData?.data.map((escalation) => (
                          <TableRow key={escalation.id}>
                            <TableCell>
                              {formatDistanceToNow(new Date(escalation.createdAt), { addSuffix: true })}
                            </TableCell>
                            <TableCell>{escalation.user.username || escalation.user.email}</TableCell>
                            <TableCell>{escalation.agent.name}</TableCell>
                            <TableCell>
                              <Badge variant={getPriorityBadgeColor(escalation.priority)}>
                                {escalation.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeColor(escalation.status)}>
                                {escalation.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {escalation.reason}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Escalations Pagination */}
                {escalationsData && (
                  <Pagination
                    className="mt-4"
                    currentPage={escalationsPage}
                    totalPages={escalationsData.pagination.pages}
                    onPageChange={setEscalationsPage}
                  />
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
