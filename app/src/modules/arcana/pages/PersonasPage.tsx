import React, { useState } from 'react';
import { useUser } from 'wasp/client/auth';
import { useAgentPersonas } from '@src/shared/hooks/ai/useAgentPersonas';
import { PersonaLibrary } from '@src/shared/components/ai/PersonaLibrary';
import { PersonaDetail } from '@src/shared/components/ai/PersonaDetail';
import { PersonaEditor } from '@src/shared/components/ai/PersonaEditor';
import { Button } from '@src/shared/components/ui/Button';
import { PageHeader } from '@src/shared/components/layout/PageHeader';
import { PermissionGuard } from '@src/shared/components/auth/PermissionGuard';
import { ModuleSettingsButton } from '@src/shared/components/settings/ModuleSettingsButton';
import { Plus, Library, Settings } from 'lucide-react';

const PersonasPage: React.FC = () => {
  const { data: user } = useUser();
  const [view, setView] = useState<'library' | 'detail' | 'create' | 'edit'>('library');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  
  const {
    selectedPersona,
    createPersona,
    updatePersona,
    forkPersona,
    error,
  } = useAgentPersonas();

  // Handle persona selection
  const handleSelectPersona = (personaId: string) => {
    setSelectedPersonaId(personaId);
    setView('detail');
  };

  // Handle create persona
  const handleCreatePersona = () => {
    setSelectedPersonaId(null);
    setView('create');
  };

  // Handle edit persona
  const handleEditPersona = (personaId: string) => {
    setSelectedPersonaId(personaId);
    setView('edit');
  };

  // Handle back to library
  const handleBackToLibrary = () => {
    setView('library');
  };

  // Handle back to detail
  const handleBackToDetail = () => {
    if (selectedPersonaId) {
      setView('detail');
    } else {
      setView('library');
    }
  };

  // Handle persona creation
  const handlePersonaCreated = (personaId: string) => {
    setSelectedPersonaId(personaId);
    setView('detail');
  };

  // Handle persona update
  const handlePersonaUpdated = (personaId: string) => {
    setSelectedPersonaId(personaId);
    setView('detail');
  };

  // Handle persona fork
  const handlePersonaForked = (personaId: string) => {
    setSelectedPersonaId(personaId);
    setView('detail');
  };

  // Handle apply persona to agent
  const handleApplyPersona = (personaId: string) => {
    // TODO: Implement applying persona to an agent
    console.log('Apply persona to agent:', personaId);
  };

  // Render content based on current view
  const renderContent = () => {
    switch (view) {
      case 'library':
        return (
          <PersonaLibrary
            onSelectPersona={handleSelectPersona}
            onCreatePersona={handleCreatePersona}
          />
        );
      case 'detail':
        return (
          <PersonaDetail
            personaId={selectedPersonaId}
            onBack={handleBackToLibrary}
            onEdit={handleEditPersona}
            onFork={handlePersonaForked}
            onApply={handleApplyPersona}
          />
        );
      case 'create':
        return (
          <PersonaEditor
            mode="create"
            onBack={handleBackToLibrary}
            onSave={handlePersonaCreated}
          />
        );
      case 'edit':
        return (
          <PersonaEditor
            mode="edit"
            personaId={selectedPersonaId}
            onBack={handleBackToDetail}
            onSave={handlePersonaUpdated}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PermissionGuard
      requiredPermission="personas:read"
      fallback={<div>You don't have permission to access this page.</div>}
    >
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Agent Personas"
          description="Create, customize, and manage agent personas for your AI assistants."
          icon={<Library className="h-6 w-6" />}
          actions={
            <div className="flex space-x-2">
              {view === 'library' && (
                <Button onClick={handleCreatePersona}>
                  <Plus className="h-4 w-4 mr-1" />
                  Create Persona
                </Button>
              )}
              <ModuleSettingsButton moduleId="arcana" section="personas">
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </ModuleSettingsButton>
            </div>
          }
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {renderContent()}
        </div>
      </div>
    </PermissionGuard>
  );
};

export default PersonasPage;
