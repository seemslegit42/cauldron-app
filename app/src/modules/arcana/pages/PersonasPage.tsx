import React, { useState } from 'react';
import { useUser } from 'wasp/client/auth';
import { useAgentPersonas } from '@src/shared/hooks/ai/useAgentPersonas';
import { PersonaLibrary } from '@src/shared/components/ai/PersonaLibrary';
import { PersonaDetail } from '@src/shared/components/ai/PersonaDetail';
import { PersonaEditor } from '@src/shared/components/ai/PersonaEditor';
import { Button } from '@src/shared/components/ui/Button';
import { PermissionGuard } from '@src/shared/components/auth/PermissionGuard';
import { ModuleSettingsButton } from '@src/shared/components/settings/ModuleSettingsButton';
import { ArcanaLayout } from '../components/layout/ArcanaLayout';
import { GlassmorphicCard } from '@src/shared/components/branding/GlassmorphicCard';
import { Plus, Library, Settings, Users } from 'lucide-react';

/**
 * Agent Personas Page
 *
 * Where AI personalities are born, nurtured, and occasionally given existential crises.
 * This page allows users to create and manage different personas for their AI agents.
 */

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
      <ArcanaLayout
        title="Agent Personas"
        description="Create, customize, and manage agent personalities"
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
      >
        {error && (
          <GlassmorphicCard moduleId="arcana" level="light" border shadow className="p-4 mb-6 bg-red-900/20">
            <div className="text-red-400">
              {error}
            </div>
          </GlassmorphicCard>
        )}

        <GlassmorphicCard moduleId="arcana" level="medium" border shadow className="p-6">
          {renderContent()}
        </GlassmorphicCard>
      </ArcanaLayout>
    </PermissionGuard>
  );
};

export default PersonasPage;
