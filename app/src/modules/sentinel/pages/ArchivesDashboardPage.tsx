import React from 'react';
import { AdminLayout } from '@src/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@src/shared/components/ui/card';
import { Shield, Archive, FileText, Settings } from 'lucide-react';
import CollaborationArchivesDashboard from '../components/securityStack/CollaborationArchivesDashboard';

const ArchivesDashboardPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Shield className="h-8 w-8 mr-2" />
            Tamper-Proof Archives
          </h1>
          <p className="text-muted-foreground">
            Secure, compliant archives of human-AI collaboration sessions for auditing, legal review, and ML improvement
          </p>
        </div>

        <Tabs defaultValue="archives" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="archives" className="flex items-center">
              <Archive className="h-4 w-4 mr-2" />
              Collaboration Archives
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Compliance Reports
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Archive Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="archives" className="space-y-4 mt-4">
            <CollaborationArchivesDashboard />
          </TabsContent>
          
          <TabsContent value="compliance" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Reports</CardTitle>
                <CardDescription>
                  Generate compliance reports for SOC2, GDPR, and internal governance standards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <p className="text-muted-foreground">
                    Compliance reporting functionality will be implemented in a future update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Archive Settings</CardTitle>
                <CardDescription>
                  Configure archive retention policies, encryption settings, and compliance standards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <p className="text-muted-foreground">
                    Archive settings functionality will be implemented in a future update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default ArchivesDashboardPage;
