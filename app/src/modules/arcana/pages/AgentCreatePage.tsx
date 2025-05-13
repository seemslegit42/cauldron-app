import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAction } from 'wasp/client/operations';
import { createAgent } from '@src/modules/forgeflow/api/operations';
import { PageHeader } from '@src/shared/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@src/shared/components/ui/Card';
import { Button } from '@src/shared/components/ui/Button';
import { Input } from '@src/shared/components/ui/Input';
import { Textarea } from '@src/shared/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@src/shared/components/ui/Select';
import { Label } from '@src/shared/components/ui/Label';
import { Checkbox } from '@src/shared/components/ui/Checkbox';
import { useToast } from '@src/shared/hooks/useToast';
import { AgentType } from '@src/shared/types/entities/agent';

/**
 * Page for creating a new agent
 */
const AgentCreatePage: React.FC = () => {
  const history = useHistory();
  const { toast } = useToast();
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<string>(AgentType.ANALYSIS);
  const [model, setModel] = useState('gpt-4');
  const [provider, setProvider] = useState('openai');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Available capabilities
  const availableCapabilities = [
    'text-generation',
    'code-generation',
    'data-analysis',
    'summarization',
    'translation',
    'question-answering',
    'classification',
    'sentiment-analysis',
    'entity-recognition',
    'image-generation',
  ];
  
  // Handle capability toggle
  const toggleCapability = (capability: string) => {
    if (capabilities.includes(capability)) {
      setCapabilities(capabilities.filter(c => c !== capability));
    } else {
      setCapabilities([...capabilities, capability]);
    }
  };
  
  // Create agent action
  const createAgentAction = useAction(createAgent);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !description || !type || !model || !provider) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const result = await createAgentAction({
        name,
        description,
        type,
        model,
        provider,
        systemPrompt,
        capabilities,
        configuration: {},
        isActive: true,
      });
      
      toast({
        title: 'Agent created',
        description: 'Your agent has been created successfully.',
      });
      
      // Redirect to agent details page
      history.push(`/agents/${result.id}`);
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: 'Error creating agent',
        description: error.message || 'An error occurred while creating the agent.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Create New Agent"
        description="Configure and create a new AI agent"
      />
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Agent Details</CardTitle>
            <CardDescription>
              Provide basic information about your new agent
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter agent name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AgentType.PERCEPTION}>Perception</SelectItem>
                    <SelectItem value={AgentType.ANALYSIS}>Analysis</SelectItem>
                    <SelectItem value={AgentType.ACTION}>Action</SelectItem>
                    <SelectItem value={AgentType.COORDINATION}>Coordination</SelectItem>
                    <SelectItem value={AgentType.MEMORY}>Memory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what this agent does"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="provider">Provider *</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="groq">Groq</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">System Prompt</Label>
              <Textarea
                id="systemPrompt"
                placeholder="Enter system prompt for the agent"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={5}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Capabilities</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-2">
                {availableCapabilities.map((capability) => (
                  <div key={capability} className="flex items-center space-x-2">
                    <Checkbox
                      id={`capability-${capability}`}
                      checked={capabilities.includes(capability)}
                      onCheckedChange={() => toggleCapability(capability)}
                    />
                    <Label htmlFor={`capability-${capability}`} className="text-sm cursor-pointer">
                      {capability.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => history.goBack()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Agent'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AgentCreatePage;
