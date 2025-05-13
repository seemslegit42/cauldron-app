import React, { useState } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { useUser } from 'wasp/client/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../../shared/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../../../shared/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../../shared/components/ui/select';
import { Input } from '../../../shared/components/ui/input';
import { Button } from '../../shared/components/ui/button';
import { Switch } from '../../../shared/components/ui/switch';
import { Loader } from '../../../shared/components/ui/loader';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../../shared/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../shared/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getRetentionPolicy, updateRetentionPolicy } from '../api/retentionOperations';

// Form schema for retention policy
const retentionPolicySchema = z.object({
  promptRetentionDays: z.number().int().min(1).max(3650),
  reasoningRetentionDays: z.number().int().min(1).max(3650),
  sessionRetentionDays: z.number().int().min(1).max(3650),
  responseNodeRetentionDays: z.number().int().min(1).max(3650),
  anonymizeUserData: z.boolean(),
  retainHighRiskPrompts: z.boolean(),
  archiveBeforeDelete: z.boolean(),
  exportArchivesToStorage: z.boolean(),
  storageLocation: z.string().optional(),
});

type RetentionPolicyFormValues = z.infer<typeof retentionPolicySchema>;

/**
 * Admin page for managing data retention policies
 */
export function DataRetentionPage() {
  const user = useUser();
  const [activeTab, setActiveTab] = useState('settings');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Query retention policy
  const { data: retentionPolicy, isLoading, error } = useQuery(getRetentionPolicy);

  // Update retention policy action
  const updateRetentionPolicyAction = useAction(updateRetentionPolicy);

  // Form
  const form = useForm<RetentionPolicyFormValues>({
    resolver: zodResolver(retentionPolicySchema),
    defaultValues: {
      promptRetentionDays: 90,
      reasoningRetentionDays: 30,
      sessionRetentionDays: 90,
      responseNodeRetentionDays: 30,
      anonymizeUserData: true,
      retainHighRiskPrompts: true,
      archiveBeforeDelete: true,
      exportArchivesToStorage: false,
      storageLocation: '',
    },
  });

  // Update form values when data is loaded
  React.useEffect(() => {
    if (retentionPolicy) {
      form.reset({
        promptRetentionDays: retentionPolicy.promptRetentionDays,
        reasoningRetentionDays: retentionPolicy.reasoningRetentionDays,
        sessionRetentionDays: retentionPolicy.sessionRetentionDays,
        responseNodeRetentionDays: retentionPolicy.responseNodeRetentionDays,
        anonymizeUserData: retentionPolicy.anonymizeUserData,
        retainHighRiskPrompts: retentionPolicy.retainHighRiskPrompts,
        archiveBeforeDelete: retentionPolicy.archiveBeforeDelete,
        exportArchivesToStorage: retentionPolicy.exportArchivesToStorage,
        storageLocation: retentionPolicy.storageLocation || '',
      });
    }
  }, [retentionPolicy, form]);

  // Submit form
  const onSubmit = async (values: RetentionPolicyFormValues) => {
    try {
      await updateRetentionPolicyAction(values);
      setSuccessMessage('Retention policy updated successfully');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating retention policy:', error);
      form.setError('root', {
        type: 'manual',
        message: error instanceof Error ? error.message : 'Failed to update retention policy',
      });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You must be logged in to access the Data Retention settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Data Retention Policies</h1>
        <Button variant="outline">Run Cleanup Job</Button>
      </div>

      {successMessage && (
        <Alert variant="success" className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="settings">Retention Settings</TabsTrigger>
          <TabsTrigger value="schedule">Cleanup Schedule</TabsTrigger>
          <TabsTrigger value="logs">Cleanup Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Retention Configuration</CardTitle>
              <CardDescription>
                Configure how long different types of AI data are retained in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader size="lg" />
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {error.message || 'Failed to load retention policy'}
                  </AlertDescription>
                </Alert>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="promptRetentionDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prompt Retention (Days)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                            </FormControl>
                            <FormDescription>
                              Number of days to retain prompt data
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reasoningRetentionDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reasoning Chain Retention (Days)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                            </FormControl>
                            <FormDescription>
                              Number of days to retain reasoning chain data
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sessionRetentionDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Session Retention (Days)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                            </FormControl>
                            <FormDescription>
                              Number of days to retain session data
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="responseNodeRetentionDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Response Node Retention (Days)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                            </FormControl>
                            <FormDescription>
                              Number of days to retain response node data
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="anonymizeUserData"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Anonymize User Data</FormLabel>
                              <FormDescription>
                                Anonymize user identifiers before archiving data
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="retainHighRiskPrompts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Retain High-Risk Prompts</FormLabel>
                              <FormDescription>
                                Keep prompts with low safety scores for longer review periods
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="archiveBeforeDelete"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Archive Before Delete</FormLabel>
                              <FormDescription>
                                Create archives of data before permanent deletion
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="exportArchivesToStorage"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Export Archives to Storage</FormLabel>
                              <FormDescription>
                                Export archives to external storage location
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {form.watch('exportArchivesToStorage') && (
                        <FormField
                          control={form.control}
                          name="storageLocation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Storage Location</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select storage location" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="s3">AWS S3</SelectItem>
                                  <SelectItem value="azure">Azure Blob Storage</SelectItem>
                                  <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                                  <SelectItem value="local">Local Storage</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Where to export archived data
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <Button type="submit" className="w-full md:w-auto">
                      Save Retention Policy
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cleanup Schedule</CardTitle>
              <CardDescription>
                Configure when data cleanup jobs run
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Cleanup schedule configuration will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cleanup Logs</CardTitle>
              <CardDescription>
                View logs of data cleanup operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Cleanup logs will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DataRetentionPage;