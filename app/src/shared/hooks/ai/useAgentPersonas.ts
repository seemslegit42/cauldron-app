/**
 * Hook for managing agent personas
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { useUser } from 'wasp/client/auth';
import { 
  getPersonas, 
  getPersonaById, 
  createPersona, 
  updatePersona, 
  forkPersona,
  getTraits,
  getTraitById,
  createTrait,
  updateTrait,
  deleteTrait
} from 'wasp/client/operations';
import type { 
  AgentPersona, 
  PersonaTrait, 
  PersonaMemoryScope,
  CreatePersonaInput,
  UpdatePersonaInput,
  ForkPersonaInput,
  PersonaCategory,
  TraitCategory,
  MemoryScopeType,
  MemoryRetention
} from '@src/shared/types/entities/agentPersona';

/**
 * Hook for managing agent personas
 * @returns Object containing persona-related functions and state
 */
export const useAgentPersonas = () => {
  const { data: user } = useUser();
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [isCreatingPersona, setIsCreatingPersona] = useState(false);
  const [isEditingPersona, setIsEditingPersona] = useState(false);
  const [isForkingPersona, setIsForkingPersona] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Queries
  const { data: personas, isLoading: isLoadingPersonas, refetch: refetchPersonas } = useQuery(getPersonas);
  const { data: selectedPersona, isLoading: isLoadingSelectedPersona, refetch: refetchSelectedPersona } = 
    useQuery(getPersonaById, { id: selectedPersonaId || '' }, { enabled: !!selectedPersonaId });
  const { data: traits, isLoading: isLoadingTraits, refetch: refetchTraits } = useQuery(getTraits);

  // Actions
  const createPersonaAction = useAction(createPersona);
  const updatePersonaAction = useAction(updatePersona);
  const forkPersonaAction = useAction(forkPersona);
  const createTraitAction = useAction(createTrait);
  const updateTraitAction = useAction(updateTrait);
  const deleteTraitAction = useAction(deleteTrait);

  // Select a persona
  const selectPersona = useCallback((id: string | null) => {
    setSelectedPersonaId(id);
  }, []);

  // Create a new persona
  const handleCreatePersona = useCallback(async (data: CreatePersonaInput) => {
    setError(null);
    setIsCreatingPersona(true);
    try {
      const result = await createPersonaAction(data);
      await refetchPersonas();
      setSelectedPersonaId(result.id);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to create persona');
      throw err;
    } finally {
      setIsCreatingPersona(false);
    }
  }, [createPersonaAction, refetchPersonas]);

  // Update a persona
  const handleUpdatePersona = useCallback(async (data: UpdatePersonaInput) => {
    setError(null);
    setIsEditingPersona(true);
    try {
      const result = await updatePersonaAction(data);
      await refetchPersonas();
      if (selectedPersonaId === data.id) {
        await refetchSelectedPersona();
      }
      return result;
    } catch (err) {
      setError(err.message || 'Failed to update persona');
      throw err;
    } finally {
      setIsEditingPersona(false);
    }
  }, [updatePersonaAction, refetchPersonas, refetchSelectedPersona, selectedPersonaId]);

  // Fork a persona
  const handleForkPersona = useCallback(async (data: ForkPersonaInput) => {
    setError(null);
    setIsForkingPersona(true);
    try {
      const result = await forkPersonaAction(data);
      await refetchPersonas();
      setSelectedPersonaId(result.id);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to fork persona');
      throw err;
    } finally {
      setIsForkingPersona(false);
    }
  }, [forkPersonaAction, refetchPersonas]);

  // Create a new trait
  const handleCreateTrait = useCallback(async (data: Omit<PersonaTrait, 'id' | 'createdAt' | 'updatedAt' | 'createdById'>) => {
    setError(null);
    try {
      const result = await createTraitAction(data);
      await refetchTraits();
      return result;
    } catch (err) {
      setError(err.message || 'Failed to create trait');
      throw err;
    }
  }, [createTraitAction, refetchTraits]);

  // Update a trait
  const handleUpdateTrait = useCallback(async (data: Partial<PersonaTrait> & { id: string }) => {
    setError(null);
    try {
      const result = await updateTraitAction(data);
      await refetchTraits();
      if (selectedPersonaId) {
        await refetchSelectedPersona();
      }
      return result;
    } catch (err) {
      setError(err.message || 'Failed to update trait');
      throw err;
    }
  }, [updateTraitAction, refetchTraits, refetchSelectedPersona, selectedPersonaId]);

  // Delete a trait
  const handleDeleteTrait = useCallback(async (id: string) => {
    setError(null);
    try {
      const result = await deleteTraitAction({ id });
      await refetchTraits();
      if (selectedPersonaId) {
        await refetchSelectedPersona();
      }
      return result;
    } catch (err) {
      setError(err.message || 'Failed to delete trait');
      throw err;
    }
  }, [deleteTraitAction, refetchTraits, refetchSelectedPersona, selectedPersonaId]);

  // Get personas by category
  const getPersonasByCategory = useCallback((category: PersonaCategory | string) => {
    if (!personas) return [];
    return personas.filter(persona => persona.category === category);
  }, [personas]);

  // Get traits by category
  const getTraitsByCategory = useCallback((category: TraitCategory | string) => {
    if (!traits) return [];
    return traits.filter(trait => trait.category === category);
  }, [traits]);

  // Get public personas
  const getPublicPersonas = useCallback(() => {
    if (!personas) return [];
    return personas.filter(persona => persona.isPublic);
  }, [personas]);

  // Get user's personas
  const getUserPersonas = useCallback(() => {
    if (!personas || !user) return [];
    return personas.filter(persona => persona.createdById === user.id);
  }, [personas, user]);

  return {
    // State
    personas,
    selectedPersona,
    traits,
    selectedPersonaId,
    error,
    
    // Loading states
    isLoadingPersonas,
    isLoadingSelectedPersona,
    isLoadingTraits,
    isCreatingPersona,
    isEditingPersona,
    isForkingPersona,
    
    // Actions
    selectPersona,
    createPersona: handleCreatePersona,
    updatePersona: handleUpdatePersona,
    forkPersona: handleForkPersona,
    createTrait: handleCreateTrait,
    updateTrait: handleUpdateTrait,
    deleteTrait: handleDeleteTrait,
    
    // Helpers
    getPersonasByCategory,
    getTraitsByCategory,
    getPublicPersonas,
    getUserPersonas,
    
    // Refetch functions
    refetchPersonas,
    refetchSelectedPersona,
    refetchTraits,
  };
};
