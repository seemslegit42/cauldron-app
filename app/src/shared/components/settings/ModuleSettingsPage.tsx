import React, { useState } from 'react';
import { useUser } from 'wasp/client/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/components/ui/Tabs';
import { Card } from '@src/shared/components/ui/Card';
import { Button } from '@src/shared/components/ui/Button';
import { Toggle } from '@src/shared/components/ui/Toggle';
import { AgentConfigPanel } from '@src/shared/components/ai/AgentConfigPanel';
import { useAgentConfig } from '@src/shared/hooks/useAgentConfig';
import { PermissionGuard } from '@src/shared/components/auth/PermissionGuard';
import { 
  AGENT_CONFIG_RESOURCE, 
  READ_ACTION, 
  UPDATE_ACTION 
} from '@src/shared/utils/permissions';

export interface ModuleAgent {
  /** Agent name */
  name: string;
  /** Display name */
  displayName: string;
  /** Agent description */
  description: string;
  /** Resource path for permissions */
  resourcePath: string;
}

export interface ModuleSettingsPageProps {
  /** Module ID */
  moduleId: string;
  /** Module display name */
  moduleName: string;
  /** Module description */
  moduleDescription?: string;
  /** List of agents in this module */
  agents: ModuleAgent[];
  /** Additional tabs to render */
  additionalTabs?: React.ReactNode;
  /** Additional class name */
  className?: string;
}

/**
 * Generic Module Settings Page
 * 
 * This component provides a standard settings page for modules,
 * with tabs for agent configuration and other settings.
 */
export const ModuleSettingsPage: React.FC<ModuleSettingsPageProps> = ({
  moduleId,
  moduleName,
  moduleDescription,
  agents,
  additionalTabs,
  className = '',
}) => {
  const user = useUser();
  const [activeTab, setActiveTab] = useState('agents');
  const [isUserOverride, setIsUserOverride] = useState(false);
  
  return (
    <div className={`container mx-auto py-8 px-4 ${className}`}>
      <h1 className="text-3xl font-bold mb-2">{moduleName} Settings</h1>
      {moduleDescription && (
        <p className="text-gray-500 mb-6">{moduleDescription}</p>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="agents">Agent Configuration</TabsTrigger>
          {additionalTabs && (
            <>
              {React.Children.map(additionalTabs, (child) => {
                if (React.isValidElement(child) && child.type === TabsTrigger) {
                  return child;
                }
                return null;
              })}
            </>
          )}
        </TabsList>
        
        <TabsContent value="agents" className="space-y-6">
          <PermissionGuard
            resource={AGENT_CONFIG_RESOURCE}
            action={READ_ACTION}
            fallback={<div>You don't have permission to view agent configurations.</div>}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Agent Configuration</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Use Organization Defaults</span>
                  <Toggle
                    isOn={!isUserOverride}
                    onChange={(value) => setIsUserOverride(!value)}
                  />
                  <span className="text-sm">Personal Override</span>
                </div>
              </div>
              
              <div className="space-y-8">
                {agents.map((agent) => (
                  <div key={agent.name} className="border-t border-gray-200 pt-6 first:border-t-0 first:pt-0">
                    <PermissionGuard
                      resource={`${moduleId}/${agent.resourcePath}`}
                      action={UPDATE_ACTION}
                      fallback={
                        <div className="text-yellow-500 mb-4">
                          You can view but not modify the {agent.displayName} agent configuration.
                        </div>
                      }
                    >
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold">{agent.displayName}</h3>
                        <p className="text-sm text-gray-500">{agent.description}</p>
                      </div>
                      
                      <AgentConfigPanel
                        module={moduleId}
                        agentName={agent.name}
                        isUserOverride={isUserOverride}
                      />
                    </PermissionGuard>
                  </div>
                ))}
              </div>
            </Card>
          </PermissionGuard>
        </TabsContent>
        
        {additionalTabs && (
          <>
            {React.Children.map(additionalTabs, (child) => {
              if (React.isValidElement(child) && child.type === TabsContent) {
                return child;
              }
              return null;
            })}
          </>
        )}
      </Tabs>
    </div>
  );
};
