/**
 * Query Approval Page
 * 
 * This page provides a UI for approving, rejecting, or modifying agent-generated
 * queries through the Sentient Loop™ system.
 */

import React from 'react';
import { SentientQueryApproval } from '../components/SentientQueryApproval';
import { PageHeader } from '@src/client/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@src/client/components/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/client/components/Tabs';
import { Database, Shield, AlertTriangle, BarChart } from 'lucide-react';
import { useQuery } from 'wasp/client/operations';
import { getQueryPerformanceMetrics } from '../api/queryPerformanceOperations';

export default function QueryApprovalPage() {
  const { data: performanceMetrics, isLoading: isLoadingMetrics } = useQuery(getQueryPerformanceMetrics);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Query Approval"
        description="Review and approve agent-generated database queries"
        icon={<Database className="h-6 w-6" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Queries</CardTitle>
            <CardDescription>Awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingMetrics ? '...' : performanceMetrics?.pendingCount || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CardDescription>Last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingMetrics ? '...' : performanceMetrics?.approvedToday || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejected Today</CardTitle>
            <CardDescription>Last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingMetrics ? '...' : performanceMetrics?.rejectedToday || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <CardDescription>Time to approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingMetrics ? '...' : `${performanceMetrics?.avgResponseTime || 0}m`}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="approval" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="approval" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Query Approval
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center">
            <BarChart className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Security Alerts
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="approval" className="mt-4">
          <SentientQueryApproval />
        </TabsContent>
        
        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Query Performance</CardTitle>
              <CardDescription>
                Performance metrics for agent-generated queries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMetrics ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading performance metrics...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
                        <CardDescription>All time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {performanceMetrics?.totalQueries || 0}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Execution Time</CardTitle>
                        <CardDescription>In milliseconds</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {performanceMetrics?.avgExecutionTime || 0}ms
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
                        <CardDescription>Percentage</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {performanceMetrics?.cacheHitRate || 0}%
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Top Models</h3>
                    <div className="space-y-2">
                      {performanceMetrics?.topModels?.map((model: any) => (
                        <div key={model.model} className="flex justify-between items-center">
                          <span className="text-sm">{model.model}</span>
                          <span className="text-sm font-medium">{model.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Top Actions</h3>
                    <div className="space-y-2">
                      {performanceMetrics?.topActions?.map((action: any) => (
                        <div key={action.action} className="flex justify-between items-center">
                          <span className="text-sm">{action.action}</span>
                          <span className="text-sm font-medium">{action.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>
                Security alerts related to agent-generated queries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMetrics ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading security alerts...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">High Risk Queries</CardTitle>
                        <CardDescription>Last 30 days</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {performanceMetrics?.highRiskQueries || 0}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Rejected Rate</CardTitle>
                        <CardDescription>Percentage</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {performanceMetrics?.rejectionRate || 0}%
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Modified Rate</CardTitle>
                        <CardDescription>Percentage</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {performanceMetrics?.modificationRate || 0}%
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Recent Security Alerts</h3>
                    {performanceMetrics?.securityAlerts?.length > 0 ? (
                      <div className="space-y-2">
                        {performanceMetrics.securityAlerts.map((alert: any) => (
                          <Card key={alert.id}>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-sm font-medium">{alert.title}</CardTitle>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  alert.severity === 'HIGH' ? 'bg-red-100 text-red-800' :
                                  alert.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {alert.severity}
                                </span>
                              </div>
                              <CardDescription className="text-xs">
                                {new Date(alert.timestamp).toLocaleString()}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm">{alert.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No security alerts found.</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
