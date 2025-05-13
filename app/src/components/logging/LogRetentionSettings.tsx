import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { Loader2, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { updateLogRetentionPolicy } from '@wasp/actions/logs';

interface RetentionPolicy {
  enabled: boolean;
  systemLogs: {
    retentionDays: number;
    archiveEnabled: boolean;
    archiveStorage: 'local' | 's3' | 'azure';
  };
  agentLogs: {
    retentionDays: number;
    archiveEnabled: boolean;
  };
  apiLogs: {
    retentionDays: number;
    archiveEnabled: boolean;
    excludeHealthChecks: boolean;
  };
  approvalLogs: {
    retentionDays: number;
    archiveEnabled: boolean;
    preserveApproved: boolean;
  };
  complianceMode: boolean;
}

const LogRetentionSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [policy, setPolicy] = useState<RetentionPolicy>({
    enabled: true,
    systemLogs: {
      retentionDays: 90,
      archiveEnabled: true,
      archiveStorage: 's3',
    },
    agentLogs: {
      retentionDays: 30,
      archiveEnabled: true,
    },
    apiLogs: {
      retentionDays: 14,
      archiveEnabled: false,
      excludeHealthChecks: true,
    },
    approvalLogs: {
      retentionDays: 365,
      archiveEnabled: true,
      preserveApproved: true,
    },
    complianceMode: false,
  });

  // Fetch current policy
  useEffect(() => {
    // Simulate fetching policy
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  // Handle policy change
  const handlePolicyChange = (
    section: keyof RetentionPolicy,
    field: string,
    value: any
  ) => {
    if (section === 'enabled' || section === 'complianceMode') {
      setPolicy(prev => ({ ...prev, [section]: value }));
    } else {
      setPolicy(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof Omit<RetentionPolicy, 'enabled' | 'complianceMode'>],
          [field]: value,
        },
      }));
    }
  };

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      // Call the action to update the policy
      await updateLogRetentionPolicy(policy);
      setSaveStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Failed to update retention policy:', error);
      setSaveStatus('error');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Loading retention settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            checked={policy.enabled}
            onCheckedChange={(checked) => handlePolicyChange('enabled', '', checked)}
            id="retention-enabled"
          />
          <Label htmlFor="retention-enabled">Enable log retention</Label>
        </div>
        {policy.complianceMode && (
          <Badge variant="outline" className="bg-blue-50">Compliance Mode</Badge>
        )}
      </div>

      {policy.enabled && (
        <>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>System Logs</Label>
                <span className="text-sm text-muted-foreground">
                  {policy.systemLogs.retentionDays} days
                </span>
              </div>
              <Slider
                value={[policy.systemLogs.retentionDays]}
                min={7}
                max={365}
                step={1}
                onValueChange={(value) => 
                  handlePolicyChange('systemLogs', 'retentionDays', value[0])
                }
              />
              <div className="flex items-center space-x-2">
                <Switch
                  checked={policy.systemLogs.archiveEnabled}
                  onCheckedChange={(checked) => 
                    handlePolicyChange('systemLogs', 'archiveEnabled', checked)
                  }
                  id="system-archive"
                />
                <Label htmlFor="system-archive" className="text-sm">Archive before deletion</Label>
                
                {policy.systemLogs.archiveEnabled && (
                  <Select
                    value={policy.systemLogs.archiveStorage}
                    onValueChange={(value) => 
                      handlePolicyChange('systemLogs', 'archiveStorage', value)
                    }
                  >
                    <SelectTrigger className="w-24 h-7 text-xs">
                      <SelectValue placeholder="Storage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="s3">S3</SelectItem>
                      <SelectItem value="azure">Azure</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Agent Logs</Label>
                <span className="text-sm text-muted-foreground">
                  {policy.agentLogs.retentionDays} days
                </span>
              </div>
              <Slider
                value={[policy.agentLogs.retentionDays]}
                min={7}
                max={365}
                step={1}
                onValueChange={(value) => 
                  handlePolicyChange('agentLogs', 'retentionDays', value[0])
                }
              />
              <div className="flex items-center space-x-2">
                <Switch
                  checked={policy.agentLogs.archiveEnabled}
                  onCheckedChange={(checked) => 
                    handlePolicyChange('agentLogs', 'archiveEnabled', checked)
                  }
                  id="agent-archive"
                />
                <Label htmlFor="agent-archive" className="text-sm">Archive before deletion</Label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>API Logs</Label>
                <span className="text-sm text-muted-foreground">
                  {policy.apiLogs.retentionDays} days
                </span>
              </div>
              <Slider
                value={[policy.apiLogs.retentionDays]}
                min={7}
                max={365}
                step={1}
                onValueChange={(value) => 
                  handlePolicyChange('apiLogs', 'retentionDays', value[0])
                }
              />
              <div className="flex items-center space-x-2">
                <Switch
                  checked={policy.apiLogs.excludeHealthChecks}
                  onCheckedChange={(checked) => 
                    handlePolicyChange('apiLogs', 'excludeHealthChecks', checked)
                  }
                  id="api-exclude-health"
                />
                <Label htmlFor="api-exclude-health" className="text-sm">Exclude health checks</Label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Approval Logs</Label>
                <span className="text-sm text-muted-foreground">
                  {policy.approvalLogs.retentionDays} days
                </span>
              </div>
              <Slider
                value={[policy.approvalLogs.retentionDays]}
                min={30}
                max={730}
                step={30}
                onValueChange={(value) => 
                  handlePolicyChange('approvalLogs', 'retentionDays', value[0])
                }
              />
              <div className="flex items-center space-x-2">
                <Switch
                  checked={policy.approvalLogs.preserveApproved}
                  onCheckedChange={(checked) => 
                    handlePolicyChange('approvalLogs', 'preserveApproved', checked)
                  }
                  id="approval-preserve"
                />
                <Label htmlFor="approval-preserve" className="text-sm">Preserve approved logs</Label>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={policy.complianceMode}
                  onCheckedChange={(checked) => 
                    handlePolicyChange('complianceMode', '', checked)
                  }
                  id="compliance-mode"
                />
                <div>
                  <Label htmlFor="compliance-mode">Compliance Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Enforces retention policies required for regulatory compliance
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : saveStatus === 'success' ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Saved
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Error
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
};

export default LogRetentionSettings;
