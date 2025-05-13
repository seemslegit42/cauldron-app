/**
 * Agent Persona-related entity types
 */

// Persona category
export enum PersonaCategory {
  LEGAL = 'legal',
  COMPLIANCE = 'compliance',
  MARKETING = 'marketing',
  OPERATIONS = 'operations',
  SECURITY = 'security',
  FINANCE = 'finance',
  HUMAN_RESOURCES = 'human_resources',
  CUSTOMER_SERVICE = 'customer_service',
  SALES = 'sales',
  EXECUTIVE = 'executive',
  TECHNICAL = 'technical',
  OTHER = 'other',
}

// Trait category
export enum TraitCategory {
  PERSONALITY = 'personality',
  KNOWLEDGE = 'knowledge',
  SKILL = 'skill',
  COMMUNICATION = 'communication',
  DECISION_MAKING = 'decision_making',
  ETHICS = 'ethics',
  DOMAIN_EXPERTISE = 'domain_expertise',
  OTHER = 'other',
}

// Memory scope
export enum MemoryScopeType {
  CONVERSATION = 'conversation',
  USER_PREFERENCES = 'user_preferences',
  DOMAIN_KNOWLEDGE = 'domain_knowledge',
  TASK_HISTORY = 'task_history',
  DECISION_HISTORY = 'decision_history',
  FEEDBACK = 'feedback',
  CONTEXT = 'context',
  OTHER = 'other',
}

// Memory retention
export enum MemoryRetention {
  SESSION = 'session',
  USER = 'user',
  ORGANIZATION = 'organization',
  PERMANENT = 'permanent',
}

// Persona trait
export interface PersonaTrait {
  /** Unique identifier for the trait */
  id: string;
  /** When the trait was created */
  createdAt: Date;
  /** When the trait was last updated */
  updatedAt: Date;
  /** Trait name */
  name: string;
  /** Trait description */
  description: string;
  /** Trait category */
  category: TraitCategory | string;
  /** Trait value */
  value: string;
  /** Whether the trait is public */
  isPublic: boolean;
  /** User ID of the trait creator */
  createdById: string;
}

// Persona memory scope
export interface PersonaMemoryScope {
  /** Unique identifier for the memory scope */
  id: string;
  /** When the memory scope was created */
  createdAt: Date;
  /** When the memory scope was last updated */
  updatedAt: Date;
  /** Memory scope name */
  name: string;
  /** Memory scope description */
  description: string;
  /** Memory scope type */
  scope: MemoryScopeType | string;
  /** Memory retention policy */
  retention: MemoryRetention | string;
  /** Memory priority (1-10) */
  priority: number;
  /** Persona ID */
  personaId: string;
}

// Agent persona
export interface AgentPersona {
  /** Unique identifier for the persona */
  id: string;
  /** When the persona was created */
  createdAt: Date;
  /** When the persona was last updated */
  updatedAt: Date;
  /** Persona name */
  name: string;
  /** Persona description */
  description: string;
  /** Persona role */
  role: string;
  /** Persona category */
  category: PersonaCategory | string;
  /** Base system prompt for the persona */
  systemPrompt: string;
  /** Whether the persona is public */
  isPublic: boolean;
  /** Whether the persona is verified */
  isVerified: boolean;
  /** Persona version */
  version: string;
  /** User ID of the persona creator */
  createdById: string;
  /** Organization ID */
  organizationId?: string;
  /** ID of the persona this was forked from */
  forkedFromId?: string;
  /** Persona traits */
  traits?: PersonaTrait[];
  /** Persona memory scopes */
  memoryScopes?: PersonaMemoryScope[];
}

// Agent persona with traits and memory scopes
export interface AgentPersonaWithDetails extends AgentPersona {
  /** Persona traits */
  traits: PersonaTrait[];
  /** Persona memory scopes */
  memoryScopes: PersonaMemoryScope[];
  /** Forked from persona */
  forkedFrom?: AgentPersona;
  /** Forks of this persona */
  forks?: AgentPersona[];
}

// Create persona input
export interface CreatePersonaInput {
  /** Persona name */
  name: string;
  /** Persona description */
  description: string;
  /** Persona role */
  role: string;
  /** Persona category */
  category: PersonaCategory | string;
  /** Base system prompt for the persona */
  systemPrompt: string;
  /** Whether the persona is public */
  isPublic?: boolean;
  /** Organization ID */
  organizationId?: string;
  /** ID of the persona this was forked from */
  forkedFromId?: string;
  /** Trait IDs to associate with this persona */
  traitIds?: string[];
  /** Memory scopes to create for this persona */
  memoryScopes?: Omit<PersonaMemoryScope, 'id' | 'createdAt' | 'updatedAt' | 'personaId'>[];
}

// Update persona input
export interface UpdatePersonaInput {
  /** Persona ID */
  id: string;
  /** Persona name */
  name?: string;
  /** Persona description */
  description?: string;
  /** Persona role */
  role?: string;
  /** Persona category */
  category?: PersonaCategory | string;
  /** Base system prompt for the persona */
  systemPrompt?: string;
  /** Whether the persona is public */
  isPublic?: boolean;
  /** Trait IDs to associate with this persona */
  traitIds?: string[];
  /** Memory scopes to update for this persona */
  memoryScopes?: Partial<Omit<PersonaMemoryScope, 'id' | 'createdAt' | 'updatedAt' | 'personaId'>>[];
}

// Fork persona input
export interface ForkPersonaInput {
  /** ID of the persona to fork */
  personaId: string;
  /** New persona name */
  name: string;
  /** New persona description */
  description?: string;
  /** Whether to make the fork public */
  isPublic?: boolean;
  /** Organization ID for the fork */
  organizationId?: string;
}
