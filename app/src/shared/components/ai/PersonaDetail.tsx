import React, { useState } from 'react';
import { useAgentPersonas } from '@src/shared/hooks/ai/useAgentPersonas';
import { Spinner } from '@src/shared/components/ui/Spinner';
import { Badge } from '@src/shared/components/ui/Badge';
import { Button } from '@src/shared/components/ui/Button';
import { Card } from '@src/shared/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/components/ui/Tabs';
import { Textarea } from '@src/shared/components/ui/Textarea';
import { 
  GitFork, 
  Star, 
  Edit, 
  Copy, 
  Tag, 
  Brain, 
  Database, 
  User, 
  Users, 
  ArrowLeft,
  Trash,
  Save,
  X
} from 'lucide-react';
import { ForkPersonaInput } from '@src/shared/types/entities/agentPersona';

interface PersonaDetailProps {
  personaId: string;
  onBack?: () => void;
  onEdit?: (personaId: string) => void;
  onFork?: (personaId: string) => void;
  onApply?: (personaId: string) => void;
}

export const PersonaDetail: React.FC<PersonaDetailProps> = ({
  personaId,
  onBack,
  onEdit,
  onFork,
  onApply,
}) => {
  const {
    selectedPersona,
    isLoadingSelectedPersona,
    selectPersona,
    forkPersona,
    isForkingPersona,
  } = useAgentPersonas();

  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [forkDialogOpen, setForkDialogOpen] = useState(false);
  const [forkName, setForkName] = useState('');
  const [forkDescription, setForkDescription] = useState('');
  const [forkError, setForkError] = useState<string | null>(null);

  // Set the selected persona
  React.useEffect(() => {
    selectPersona(personaId);
  }, [personaId, selectPersona]);

  // Handle edit
  const handleEdit = () => {
    if (onEdit) {
      onEdit(personaId);
    }
  };

  // Handle fork dialog open
  const handleOpenForkDialog = () => {
    if (selectedPersona) {
      setForkName(`Fork of ${selectedPersona.name}`);
      setForkDescription(selectedPersona.description);
      setForkDialogOpen(true);
    }
  };

  // Handle fork dialog close
  const handleCloseForkDialog = () => {
    setForkDialogOpen(false);
    setForkError(null);
  };

  // Handle fork
  const handleFork = async () => {
    if (!forkName.trim()) {
      setForkError('Name is required');
      return;
    }

    try {
      const forkData: ForkPersonaInput = {
        personaId,
        name: forkName,
        description: forkDescription,
        isPublic: false,
      };

      const forkedPersona = await forkPersona(forkData);
      setForkDialogOpen(false);
      
      if (onFork) {
        onFork(forkedPersona.id);
      }
    } catch (error) {
      setForkError(error.message || 'Failed to fork persona');
    }
  };

  // Handle apply
  const handleApply = () => {
    if (onApply) {
      onApply(personaId);
    }
  };

  // Handle copy system prompt
  const handleCopySystemPrompt = async () => {
    if (selectedPersona) {
      setIsCopying(true);
      try {
        await navigator.clipboard.writeText(selectedPersona.systemPrompt);
        setTimeout(() => setIsCopying(false), 1500);
      } catch (error) {
        console.error('Failed to copy system prompt:', error);
        setIsCopying(false);
      }
    }
  };

  // Render loading state
  if (isLoadingSelectedPersona) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // Render not found state
  if (!selectedPersona) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">Persona not found</h3>
        <p className="text-gray-500 mb-4">The requested persona could not be found.</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h2 className="text-xl font-semibold">{selectedPersona.name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium">{selectedPersona.role}</h3>
                <div className="flex items-center mt-1 space-x-2">
                  <Badge variant="outline">{selectedPersona.category}</Badge>
                  {selectedPersona.isPublic && (
                    <Badge variant="secondary" className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      Public
                    </Badge>
                  )}
                  {selectedPersona.isVerified && (
                    <Badge variant="success" className="flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={handleOpenForkDialog}>
                  <GitFork className="h-4 w-4 mr-1" />
                  Fork
                </Button>
                <Button variant="default" size="sm" onClick={handleApply}>
                  <User className="h-4 w-4 mr-1" />
                  Apply
                </Button>
              </div>
            </div>

            <p className="mb-4">{selectedPersona.description}</p>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium flex items-center">
                  <Brain className="h-4 w-4 mr-1" />
                  System Prompt
                </h4>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                  >
                    {showSystemPrompt ? 'Hide' : 'Show'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopySystemPrompt}
                    disabled={isCopying}
                  >
                    {isCopying ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {showSystemPrompt && (
                <Textarea
                  value={selectedPersona.systemPrompt}
                  readOnly
                  className="font-mono text-sm h-64"
                />
              )}
            </div>

            {selectedPersona.forkedFrom && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <GitFork className="h-4 w-4 mr-1" />
                  Forked from <span className="font-medium ml-1">{selectedPersona.forkedFrom.name}</span>
                </p>
              </div>
            )}
          </Card>

          <Tabs defaultValue="traits" className="w-full">
            <TabsList>
              <TabsTrigger value="traits">
                <Tag className="h-4 w-4 mr-1" />
                Traits ({selectedPersona.traits?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="memory">
                <Database className="h-4 w-4 mr-1" />
                Memory Scopes ({selectedPersona.memoryScopes?.length || 0})
              </TabsTrigger>
              {selectedPersona.forks && selectedPersona.forks.length > 0 && (
                <TabsTrigger value="forks">
                  <GitFork className="h-4 w-4 mr-1" />
                  Forks ({selectedPersona.forks?.length || 0})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="traits" className="mt-4">
              {selectedPersona.traits && selectedPersona.traits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPersona.traits.map(trait => (
                    <Card key={trait.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{trait.name}</h4>
                        <Badge variant="outline">{trait.category}</Badge>
                      </div>
                      <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">{trait.description}</p>
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-mono">{trait.value}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  This persona has no traits defined.
                </div>
              )}
            </TabsContent>

            <TabsContent value="memory" className="mt-4">
              {selectedPersona.memoryScopes && selectedPersona.memoryScopes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPersona.memoryScopes.map(scope => (
                    <Card key={scope.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{scope.name}</h4>
                        <Badge variant="outline">{scope.retention}</Badge>
                      </div>
                      <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">{scope.description}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <Badge variant="secondary">{scope.scope}</Badge>
                        <span className="text-xs text-gray-500">Priority: {scope.priority}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  This persona has no memory scopes defined.
                </div>
              )}
            </TabsContent>

            {selectedPersona.forks && selectedPersona.forks.length > 0 && (
              <TabsContent value="forks" className="mt-4">
                <div className="grid grid-cols-1 gap-4">
                  {selectedPersona.forks.map(fork => (
                    <Card key={fork.id} className="p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{fork.name}</h4>
                        <p className="text-sm text-gray-500">Created by {fork.createdById}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => selectPersona(fork.id)}
                      >
                        View
                      </Button>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-medium mb-4">Details</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Created by</h4>
                <p className="mt-1">{selectedPersona.createdById}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Version</h4>
                <p className="mt-1">{selectedPersona.version}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Created at</h4>
                <p className="mt-1">{new Date(selectedPersona.createdAt).toLocaleString()}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Last updated</h4>
                <p className="mt-1">{new Date(selectedPersona.updatedAt).toLocaleString()}</p>
              </div>
              
              {selectedPersona.agents && selectedPersona.agents.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Used by agents</h4>
                  <div className="mt-1 space-y-2">
                    {selectedPersona.agents.map(agent => (
                      <div key={agent.id} className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{agent.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Fork Dialog */}
      {forkDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Fork Persona</h3>
              <Button variant="ghost" size="sm" onClick={handleCloseForkDialog}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={forkName}
                  onChange={(e) => setForkName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={forkDescription}
                  onChange={(e) => setForkDescription(e.target.value)}
                  className="w-full p-2 border rounded-md h-24"
                />
              </div>
              
              {forkError && (
                <div className="text-red-500 text-sm">{forkError}</div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCloseForkDialog}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleFork} 
                  disabled={isForkingPersona || !forkName.trim()}
                >
                  {isForkingPersona ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Forking...
                    </>
                  ) : (
                    <>
                      <GitFork className="h-4 w-4 mr-1" />
                      Fork
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Check component for Lucide-React
const Check = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
