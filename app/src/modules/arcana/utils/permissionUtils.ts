/**
 * Arcana Module Permission Utilities
 * 
 * This file contains constants and helper functions for Arcana module permissions.
 */

import { useAuth } from 'wasp/client/auth';
import { usePermission } from '../../shared/components/auth/PermissionGuard';
import type { Resource, ResourceAction } from '../../api/middleware/rbac';

// Resource constants
export const ARCANA_RESOURCE: Resource = 'arcana';
export const SENTIENT_LOOP_RESOURCE: Resource = 'sentient-loop';
export const USER_CONTEXT_RESOURCE: Resource = 'user-context';
export const DASHBOARD_WIDGETS_RESOURCE: Resource = 'dashboard-widgets';
export const AI_ASSISTANT_RESOURCE: Resource = 'ai-assistant';
export const CHIEF_OF_STAFF_RESOURCE: Resource = 'chief-of-staff';

// Action constants
export const READ_ACTION: ResourceAction = 'read';
export const USE_ACTION: ResourceAction = 'use';
export const CONFIGURE_ACTION: ResourceAction = 'configure';
export const MANAGE_ACTION: ResourceAction = 'manage';
export const CREATE_ACTION: ResourceAction = 'create';
export const UPDATE_ACTION: ResourceAction = 'update';
export const DELETE_ACTION: ResourceAction = 'delete';
export const EXECUTE_ACTION: ResourceAction = 'execute';

/**
 * Hook to check if user can view the Arcana dashboard
 */
export function useCanViewArcanaDashboard(): boolean {
  return usePermission(ARCANA_RESOURCE, READ_ACTION);
}

/**
 * Hook to check if user can use the Sentient Loop
 */
export function useCanUseSentientLoop(): boolean {
  return usePermission(SENTIENT_LOOP_RESOURCE, USE_ACTION);
}

/**
 * Hook to check if user can configure the Sentient Loop
 */
export function useCanConfigureSentientLoop(): boolean {
  return usePermission(SENTIENT_LOOP_RESOURCE, CONFIGURE_ACTION);
}

/**
 * Hook to check if user can view user context
 */
export function useCanViewUserContext(): boolean {
  return usePermission(USER_CONTEXT_RESOURCE, READ_ACTION);
}

/**
 * Hook to check if user can update user context
 */
export function useCanUpdateUserContext(): boolean {
  return usePermission(USER_CONTEXT_RESOURCE, UPDATE_ACTION);
}

/**
 * Hook to check if user can configure dashboard widgets
 */
export function useCanConfigureDashboardWidgets(): boolean {
  return usePermission(DASHBOARD_WIDGETS_RESOURCE, CONFIGURE_ACTION);
}

/**
 * Hook to check if user can create dashboard widgets
 */
export function useCanCreateDashboardWidgets(): boolean {
  return usePermission(DASHBOARD_WIDGETS_RESOURCE, CREATE_ACTION);
}

/**
 * Hook to check if user can delete dashboard widgets
 */
export function useCanDeleteDashboardWidgets(): boolean {
  return usePermission(DASHBOARD_WIDGETS_RESOURCE, DELETE_ACTION);
}

/**
 * Hook to check if user can use the AI assistant
 */
export function useCanUseAIAssistant(): boolean {
  return usePermission(AI_ASSISTANT_RESOURCE, USE_ACTION);
}

/**
 * Hook to check if user can configure the AI assistant
 */
export function useCanConfigureAIAssistant(): boolean {
  return usePermission(AI_ASSISTANT_RESOURCE, CONFIGURE_ACTION);
}

/**
 * Hook to check if user can use the Chief of Staff
 */
export function useCanUseChiefOfStaff(): boolean {
  return usePermission(CHIEF_OF_STAFF_RESOURCE, USE_ACTION);
}

/**
 * Hook to check if user can view Chief of Staff tasks
 */
export function useCanViewChiefOfStaffTasks(): boolean {
  return usePermission(CHIEF_OF_STAFF_RESOURCE, READ_ACTION);
}

/**
 * Hook to check if user can manage Arcana
 */
export function useCanManageArcana(): boolean {
  return usePermission(ARCANA_RESOURCE, MANAGE_ACTION);
}

/**
 * Get permission requirements for Arcana module features
 * 
 * This is useful for displaying permission requirements in the UI
 */
export const ARCANA_PERMISSION_REQUIREMENTS = {
  viewDashboard: {
    resource: ARCANA_RESOURCE,
    action: READ_ACTION,
    description: 'View the Arcana dashboard'
  },
  useSentientLoop: {
    resource: SENTIENT_LOOP_RESOURCE,
    action: USE_ACTION,
    description: 'Use the Sentient Loop™ for daily operations'
  },
  configureSentientLoop: {
    resource: SENTIENT_LOOP_RESOURCE,
    action: CONFIGURE_ACTION,
    description: 'Configure the Sentient Loop™ settings'
  },
  viewUserContext: {
    resource: USER_CONTEXT_RESOURCE,
    action: READ_ACTION,
    description: 'View user context information'
  },
  updateUserContext: {
    resource: USER_CONTEXT_RESOURCE,
    action: UPDATE_ACTION,
    description: 'Update user context information'
  },
  configureDashboardWidgets: {
    resource: DASHBOARD_WIDGETS_RESOURCE,
    action: CONFIGURE_ACTION,
    description: 'Configure dashboard widgets'
  },
  createDashboardWidgets: {
    resource: DASHBOARD_WIDGETS_RESOURCE,
    action: CREATE_ACTION,
    description: 'Create new dashboard widgets'
  },
  deleteDashboardWidgets: {
    resource: DASHBOARD_WIDGETS_RESOURCE,
    action: DELETE_ACTION,
    description: 'Delete dashboard widgets'
  },
  useAIAssistant: {
    resource: AI_ASSISTANT_RESOURCE,
    action: USE_ACTION,
    description: 'Use the AI assistant'
  },
  configureAIAssistant: {
    resource: AI_ASSISTANT_RESOURCE,
    action: CONFIGURE_ACTION,
    description: 'Configure the AI assistant'
  },
  manageArcana: {
    resource: ARCANA_RESOURCE,
    action: MANAGE_ACTION,
    description: 'Manage all Arcana aspects'
  },
  useChiefOfStaff: {
    resource: CHIEF_OF_STAFF_RESOURCE,
    action: USE_ACTION,
    description: 'Use the Chief of Staff for task delegation'
  },
  viewChiefOfStaffTasks: {
    resource: CHIEF_OF_STAFF_RESOURCE,
    action: READ_ACTION,
    description: 'View Chief of Staff tasks'
  }
};
