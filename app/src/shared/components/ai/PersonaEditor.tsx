import React, { useState, useEffect } from 'react';
import { useAgentPersonas } from '@src/shared/hooks/ai/useAgentPersonas';
import { 
  PersonaCategory, 
  TraitCategory, 
  MemoryScopeType, 
  MemoryRetention,
  CreatePersonaInput,
  UpdatePersonaInput
} from '@src/shared/types/entities/agentPersona';
import { Button } from '@src/shared/components/ui/Button';
import { Input } from '@src/shared/components/ui/Input';
import { Textarea } from '@src/shared/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@src/shared/components/ui/Select';
import { Switch } from '@src/shared/components/ui/Switch';
import { Badge } from '@src/shared/components/ui/Badge';
import { Card } from '@src/shared/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/components/ui/Tabs';
import { Spinner } from '@src/shared/components/ui/Spinner';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash, 
  Tag, 
  Database, 
  Brain, 
  Info, 
  AlertTriangle 
} from 'lucide-react';

interface PersonaEditorProps {
  mode: 'create' | 'edit';
  personaId?: string;
  onBack?: () => void;
  onSave?: (personaId: string) => void;
}

export const PersonaEditor: React.FC<PersonaEditorProps> = ({
  mode,
  personaId,
  onBack,
  onSave,
}) => {
  const {
    selectedPersona,
    isLoadingSelectedPersona,
    traits,
    isLoadingTraits,
    createPersona,
    updatePersona,
    isCreatingPersona,
    isEditingPersona,
    selectPersona,
    error,
  } = useAgentPersonas();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [role, setRole] = useState('');
  const [category, setCategory] = useState<string>(PersonaCategory.OTHER);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedTraitIds, setSelectedTraitIds] = useState<string[]>([]);
  const [memoryScopes, setMemoryScopes] = useState<any[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic');

  // Set the selected persona if in edit mode
  useEffect(() => {
    if (mode === 'edit' && personaId) {
      selectPersona(personaId);
    }
  }, [mode, personaId, selectPersona]);

  // Initialize form with selected persona data
  useEffect(() => {
    if (mode === 'edit' && selectedPersona) {
      setName(selectedPersona.name);
      setDescription(selectedPersona.description);
      setRole(selectedPersona.role);
      setCategory(selectedPersona.category);
      setSystemPrompt(selectedPersona.systemPrompt);
      setIsPublic(selectedPersona.isPublic);
      setSelectedTraitIds(selectedPersona.traits?.map(trait => trait.id) || []);
      setMemoryScopes(selectedPersona.memoryScopes || []);
    }
  }, [mode, selectedPersona]);

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!role.trim()) {
      errors.role = 'Role is required';
    }
    
    if (!systemPrompt.trim()) {
      errors.systemPrompt = 'System prompt is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      setActiveTab('basic');
      return;
    }
    
    try {
      if (mode === 'create') {
        const createData: CreatePersonaInput = {
          name,
          description,
          role,
          category,
          systemPrompt,
          isPublic,
          traitIds: selectedTraitIds,
          memoryScopes: memoryScopes.map(scope => ({
            name: scope.name,
            description: scope.description,
            scope: scope.scope,
            retention: scope.retention,
            priority: scope.priority,
          })),
        };
        
        const createdPersona = await createPersona(createData);
        
        if (onSave) {
          onSave(createdPersona.id);
        }
      } else if (mode === 'edit' && personaId) {
        const updateData: UpdatePersonaInput = {
          id: personaId,
          name,
          description,
          role,
          category,
          systemPrompt,
          isPublic,
          traitIds: selectedTraitIds,
          memoryScopes: memoryScopes.map(scope => ({
            id: scope.id,
            name: scope.name,
            description: scope.description,
            scope: scope.scope,
            retention: scope.retention,
            priority: scope.priority,
          })),
        };
        
        const updatedPersona = await updatePersona(updateData);
        
        if (onSave) {
          onSave(updatedPersona.id);
        }
      }
    } catch (err) {
      console.error('Error saving persona:', err);
    }
  };

  // Handle trait selection
  const handleTraitSelection = (traitId: string) => {
    setSelectedTraitIds(prev => {
      if (prev.includes(traitId)) {
        return prev.filter(id => id !== traitId);
      } else {
        return [...prev, traitId];
      }
    });
  };

  // Add new memory scope
  const handleAddMemoryScope = () => {
    setMemoryScopes(prev => [
      ...prev,
      {
        name: '',
        description: '',
        scope: MemoryScopeType.CONVERSATION,
        retention: MemoryRetention.SESSION,
        priority: 1,
      },
    ]);
  };

  // Update memory scope
  const handleUpdateMemoryScope = (index: number, field: string, value: any) => {
    setMemoryScopes(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  // Remove memory scope
  const handleRemoveMemoryScope = (index: number) => {
    setMemoryScopes(prev => prev.filter((_, i) => i !== index));
  };

  // Render loading state
  if (mode === 'edit' && isLoadingSelectedPersona) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h2 className="text-xl font-semibold">
          {mode === 'create' ? 'Create New Persona' : 'Edit Persona'}
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="system">System Prompt</TabsTrigger>
          <TabsTrigger value="traits">Traits</TabsTrigger>
          <TabsTrigger value="memory">Memory Scopes</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter persona name"
                className={formErrors.name ? 'border-red-500' : ''}
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Legal Advisor, Compliance Copilot"
                className={formErrors.role ? 'border-red-500' : ''}
              />
              {formErrors.role && (
                <p className="text-red-500 text-sm mt-1">{formErrors.role}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this persona does and its purpose"
              rows={3}
              className={formErrors.description ? 'border-red-500' : ''}
            />
            {formErrors.description && (
              <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PersonaCategory).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
              id="public-switch"
            />
            <label htmlFor="public-switch" className="text-sm font-medium">
              Make this persona public
            </label>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">System Prompt</label>
              <div className="text-xs text-gray-500">
                Define the core behavior and capabilities of this persona
              </div>
            </div>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Enter the system prompt for this persona..."
              rows={12}
              className={`font-mono text-sm ${formErrors.systemPrompt ? 'border-red-500' : ''}`}
            />
            {formErrors.systemPrompt && (
              <p className="text-red-500 text-sm mt-1">{formErrors.systemPrompt}</p>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">System Prompt Tips</h4>
                <ul className="text-xs text-blue-700 dark:text-blue-400 mt-1 list-disc list-inside space-y-1">
                  <li>Define the persona's role, expertise, and communication style</li>
                  <li>Include specific knowledge domains and limitations</li>
                  <li>Specify how the persona should handle uncertainty or sensitive topics</li>
                  <li>Consider including example responses to guide the AI's behavior</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="traits" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Selected Traits</h3>
            <div className="text-sm text-gray-500">
              {selectedTraitIds.length} traits selected
            </div>
          </div>

          {isLoadingTraits ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : traits && traits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {traits.map(trait => (
                <Card 
                  key={trait.id} 
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedTraitIds.includes(trait.id) 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handleTraitSelection(trait.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium flex items-center">
                        {trait.name}
                        {selectedTraitIds.includes(trait.id) && (
                          <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                            Selected
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{trait.description}</p>
                    </div>
                    <Badge variant="outline">{trait.category}</Badge>
                  </div>
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-mono">{trait.value}</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No traits available. Create traits to associate with this persona.
            </div>
          )}

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Trait Management</h4>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                  To create new traits, go to the Traits management page. You can select existing traits here to associate with this persona.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="memory" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Memory Scopes</h3>
            <Button onClick={handleAddMemoryScope} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Memory Scope
            </Button>
          </div>

          {memoryScopes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No memory scopes defined. Add memory scopes to control how this persona remembers information.
            </div>
          ) : (
            <div className="space-y-6">
              {memoryScopes.map((scope, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Memory Scope #{index + 1}</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveMemoryScope(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Name</label>
                      <Input
                        value={scope.name}
                        onChange={(e) => handleUpdateMemoryScope(index, 'name', e.target.value)}
                        placeholder="e.g., Conversation History"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">Scope Type</label>
                      <Select 
                        value={scope.scope} 
                        onValueChange={(value) => handleUpdateMemoryScope(index, 'scope', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a scope type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(MemoryScopeType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-medium mb-1">Description</label>
                    <Textarea
                      value={scope.description}
                      onChange={(e) => handleUpdateMemoryScope(index, 'description', e.target.value)}
                      placeholder="Describe what this memory scope is used for"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Retention</label>
                      <Select 
                        value={scope.retention} 
                        onValueChange={(value) => handleUpdateMemoryScope(index, 'retention', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select retention policy" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(MemoryRetention).map((retention) => (
                            <SelectItem key={retention} value={retention}>
                              {retention.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">Priority (1-10)</label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={scope.priority}
                        onChange={(e) => handleUpdateMemoryScope(index, 'priority', parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end space-x-2">
        <Button variant="outline" onClick={onBack}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isCreatingPersona || isEditingPersona}
        >
          {isCreatingPersona || isEditingPersona ? (
            <>
              <Spinner size="sm" className="mr-2" />
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1" />
              {mode === 'create' ? 'Create Persona' : 'Update Persona'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
