/**
 * SimulationRunner Component
 *
 * A red team simulation launcher with outcome tracking. Allows users to configure
 * and run security simulations to test defenses and track results.
 */

import React, { useState, useCallback } from 'react';
import { useAction } from 'wasp/client/operations';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@src/shared/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@src/shared/components/ui/tabs';
import { Button } from '@src/shared/components/ui/button';
import { Input } from '@src/shared/components/ui/input';
import { Textarea } from '@src/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@src/shared/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@src/shared/components/ui/form';
import { Checkbox } from '@src/shared/components/ui/checkbox';
import { Badge } from '@src/shared/components/ui/badge';
import { Progress } from '@src/shared/components/ui/progress';
import { Spinner } from '@src/shared/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@src/shared/components/ui/alert';
import {
  AlertTriangle,
  Play,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Users,
  Mail,
  Globe,
  Server,
  Lock,
  Zap,
  FileText,
  BarChart
} from 'lucide-react';
import { useToast } from '@src/shared/hooks/useToast';
import { runSecurityScan } from '../api/operations';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@src/shared/utils/cn';

// Types
interface SimulationRunnerProps {
  className?: string;
  onSimulationComplete?: (results: any) => void;
}

// Simulation types
const simulationTypes = [
  { id: 'phishing', name: 'Phishing Campaign', icon: <Mail className="h-4 w-4" /> },
  { id: 'domain_spoofing', name: 'Domain Spoofing', icon: <Globe className="h-4 w-4" /> },
  { id: 'network_scan', name: 'Network Penetration', icon: <Server className="h-4 w-4" /> },
  { id: 'password_breach', name: 'Password Breach', icon: <Lock className="h-4 w-4" /> },
  { id: 'social_engineering', name: 'Social Engineering', icon: <Users className="h-4 w-4" /> },
  { id: 'vulnerability_exploit', name: 'Vulnerability Exploit', icon: <Zap className="h-4 w-4" /> },
];

// Form schema
const simulationFormSchema = z.object({
  name: z.string().min(3, { message: "Simulation name must be at least 3 characters" }),
  type: z.string().min(1, { message: "Please select a simulation type" }),
  description: z.string().optional(),
  targets: z.array(z.string()).min(1, { message: "At least one target must be selected" }),
  options: z.object({
    intensity: z.enum(['low', 'medium', 'high']),
    duration: z.number().min(1).max(60),
    recordEvidence: z.boolean().default(true),
    notifyTargets: z.boolean().default(false),
  }),
});

type SimulationFormValues = z.infer<typeof simulationFormSchema>;

// Default form values
const defaultValues: Partial<SimulationFormValues> = {
  name: '',
  type: '',
  description: '',
  targets: [],
  options: {
    intensity: 'medium',
    duration: 15,
    recordEvidence: true,
    notifyTargets: false,
  },
};

export function SimulationRunner({
  className = '',
  onSimulationComplete
}: SimulationRunnerProps) {
  // State
  const [activeTab, setActiveTab] = useState('configure');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [availableTargets, setAvailableTargets] = useState([
    { id: 'email_system', name: 'Email System', type: 'system' },
    { id: 'website', name: 'Corporate Website', type: 'web' },
    { id: 'vpn', name: 'VPN Access', type: 'network' },
    { id: 'employees', name: 'All Employees', type: 'users' },
    { id: 'executives', name: 'Executive Team', type: 'users' },
    { id: 'it_department', name: 'IT Department', type: 'users' },
    { id: 'cloud_services', name: 'Cloud Services', type: 'system' },
    { id: 'customer_portal', name: 'Customer Portal', type: 'web' },
  ]);

  // Hooks
  const { toast } = useToast();
  const runSecurityScanAction = useAction(runSecurityScan);

  // Form
  const form = useForm<SimulationFormValues>({
    resolver: zodResolver(simulationFormSchema),
    defaultValues,
  });

  // Run simulation
  const runSimulation = useCallback(async (values: SimulationFormValues) => {
    try {
      setIsRunning(true);
      setProgress(0);
      setActiveTab('running');

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 5;
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 1000);

      // Call the security scan action
      const result = await runSecurityScanAction({
        scanType: values.type,
        targets: values.targets,
        configuration: {
          ...values.options,
          simulationName: values.name,
          simulationDescription: values.description,
        },
      });

      // Clear interval and set final progress
      clearInterval(progressInterval);
      setProgress(100);

      // Process results
      setTimeout(() => {
        setIsRunning(false);
        setSimulationResults({
          id: `sim-${Date.now()}`,
          name: values.name,
          type: values.type,
          startTime: new Date(),
          endTime: new Date(),
          duration: values.options.duration,
          targets: values.targets.map(targetId => {
            const target = availableTargets.find(t => t.id === targetId);
            return target ? target.name : targetId;
          }),
          results: {
            success: Math.random() > 0.3, // Simulate success/failure
            compromisedTargets: Math.floor(Math.random() * values.targets.length),
            detectionRate: Math.random() * 100,
            averageTimeToDetect: Math.floor(Math.random() * 60) + 5, // 5-65 minutes
            findings: result?.results || [],
          }
        });
        setActiveTab('results');

        if (onSimulationComplete) {
          onSimulationComplete(simulationResults);
        }
      }, 1000);

    } catch (error) {
      console.error('Simulation error:', error);
      toast({
        title: 'Simulation Failed',
        description: 'There was an error running the simulation. Please try again.',
        variant: 'destructive',
      });
      setIsRunning(false);
    }
  }, [runSecurityScanAction, availableTargets, onSimulationComplete, toast]);



  // Reset simulation
  const resetSimulation = () => {
    form.reset(defaultValues);
    setSimulationResults(null);
    setProgress(0);
    setActiveTab('configure');
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Target className="mr-2 h-5 w-5 text-red-500" />
          Red Team Simulation Runner
        </CardTitle>
        <CardDescription>
          Configure and run security simulations to test your defenses
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="configure" disabled={isRunning}>Configure</TabsTrigger>
            <TabsTrigger value="running" disabled={!isRunning && activeTab !== 'running'}>Running</TabsTrigger>
            <TabsTrigger value="results" disabled={!simulationResults && activeTab !== 'results'}>Results</TabsTrigger>
          </TabsList>

          <TabsContent value="configure">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(runSimulation)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Simulation Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Q2 Security Assessment" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Simulation Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a simulation type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {simulationTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              <div className="flex items-center">
                                {type.icon}
                                <span className="ml-2">{type.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the purpose and scope of this simulation"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targets"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Targets</FormLabel>
                        <FormDescription>
                          Select the systems or user groups to target
                        </FormDescription>
                      </div>
                      {availableTargets.map((target) => (
                        <FormField
                          key={target.id}
                          control={form.control}
                          name="targets"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={target.id}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mb-2"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(target.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, target.id])
                                        : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== target.id
                                          )
                                        )
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="flex items-center">
                                    {target.name}
                                    <Badge variant="outline" className="ml-2">
                                      {target.type}
                                    </Badge>
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="options.intensity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intensity</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select intensity level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low (Minimal Impact)</SelectItem>
                          <SelectItem value="medium">Medium (Moderate Impact)</SelectItem>
                          <SelectItem value="high">High (Realistic Attack)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Determines how aggressive the simulation will be
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="options.recordEvidence"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Record Evidence
                        </FormLabel>
                        <FormDescription>
                          Capture screenshots and logs during the simulation
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="options.notifyTargets"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Notify Targets
                        </FormLabel>
                        <FormDescription>
                          Inform targets that a simulation is being conducted
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={isRunning}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Run Simulation
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="running">
            <div className="py-8 space-y-8">
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Spinner size="lg" className="mb-4" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">
                  Simulation in Progress
                </h3>
                <p className="text-muted-foreground mb-4">
                  Running {form.getValues().name || 'security simulation'}...
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Simulation Active</AlertTitle>
                <AlertDescription>
                  This is a controlled security test. All activities are being monitored and logged.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="results">
            {simulationResults && (
              <div className="py-4 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {simulationResults.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {simulationResults.type.replace('_', ' ')} simulation
                    </p>
                  </div>
                  <Badge
                    variant={simulationResults.results.success ? 'destructive' : 'outline'}
                    className="text-sm"
                  >
                    {simulationResults.results.success ? 'Vulnerabilities Found' : 'No Vulnerabilities'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Target className="mr-2 h-4 w-4 text-red-500" />
                        Compromised
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-0">
                      <div className="text-2xl font-bold">
                        {simulationResults.results.compromisedTargets} / {simulationResults.targets.length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        targets successfully breached
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Shield className="mr-2 h-4 w-4 text-green-500" />
                        Detection Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-0">
                      <div className="text-2xl font-bold">
                        {Math.round(simulationResults.results.detectionRate)}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        of attacks were detected
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-blue-500" />
                        Time to Detect
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-0">
                      <div className="text-2xl font-bold">
                        {simulationResults.results.averageTimeToDetect} min
                      </div>
                      <p className="text-xs text-muted-foreground">
                        average detection time
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Findings
                  </h4>

                  {simulationResults.results.findings.length > 0 ? (
                    <div className="space-y-3">
                      {simulationResults.results.findings.map((finding: any, index: number) => (
                        <div
                          key={finding.id || index}
                          className="border rounded-md p-4"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium">{finding.title}</div>
                            <Badge
                              variant="default"
                              className={cn(
                                finding.severity === 'critical' ? 'bg-red-500' :
                                  finding.severity === 'high' ? 'bg-orange-500' :
                                    finding.severity === 'medium' ? 'bg-yellow-500' :
                                      'bg-blue-500'
                              )}
                            >
                              {finding.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {finding.description}
                          </p>
                          {finding.remediationSteps && (
                            <div className="text-sm">
                              <div className="font-medium mb-1">Remediation Steps:</div>
                              <ul className="list-disc pl-5 space-y-1">
                                {finding.remediationSteps.map((step: string, i: number) => (
                                  <li key={i}>{step}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No findings were discovered during this simulation.
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={resetSimulation}
                  >
                    Run New Simulation
                  </Button>
                  <Button>
                    <BarChart className="mr-2 h-4 w-4" />
                    Export Report
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
