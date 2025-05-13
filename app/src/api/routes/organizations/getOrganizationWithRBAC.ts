/**
 * API route for organization operations with RBAC
 * 
 * This demonstrates multi-tenancy aware access control.
 */

import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { withErrorHandling } from '../../middleware/error';
import { validateRequest } from '../../middleware/validation';
import { requirePermission } from '../../middleware/rbac';
import { applyFieldAccess } from '../../middleware/fieldAccess';
import { z } from 'zod';

// Validation schema for request arguments
const getOrganizationSchema = z.object({
  organizationId: z.string().uuid(),
});

/**
 * Get organization details with RBAC
 * 
 * This route demonstrates:
 * 1. Organization-specific access control
 * 2. Field-level visibility based on permissions
 */
export const getOrganizationWithRBAC = withErrorHandling(async (args, context) => {
  // Validate request arguments
  const validatedArgs = validateRequest(args, getOrganizationSchema);
  
  // Get the organization
  const organization = await prisma.organization.findUnique({
    where: { id: validatedArgs.organizationId },
    include: {
      users: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: {
            select: {
              id: true,
              name: true
            }
          }
        }
      },
      moduleConfigs: {
        select: {
          id: true,
          moduleName: true,
          isEnabled: true
        }
      }
    }
  });
  
  if (!organization) {
    throw new HttpError(404, 'Organization not found');
  }
  
  // Apply RBAC middleware - require 'organizations:read' permission
  // and check if user belongs to this organization
  const user = await requirePermission({
    resource: 'organizations',
    action: 'read',
    organizationId: validatedArgs.organizationId,
    adminOverride: true,
    auditRejection: true
  })(context);
  
  // Apply field-level access control
  const filteredOrganization = await applyFieldAccess(organization, user, 'organizations', 'read');
  
  return filteredOrganization;
});

// Validation schema for updating organization
const updateOrganizationSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
});

/**
 * Update organization with RBAC
 */
export const updateOrganizationWithRBAC = withErrorHandling(async (args, context) => {
  // Validate request arguments
  const validatedArgs = validateRequest(args, updateOrganizationSchema);
  
  // Check if organization exists
  const organization = await prisma.organization.findUnique({
    where: { id: validatedArgs.organizationId },
  });
  
  if (!organization) {
    throw new HttpError(404, 'Organization not found');
  }
  
  // Apply RBAC middleware - require 'organizations:update' permission
  // and check if user belongs to this organization
  const user = await requirePermission({
    resource: 'organizations',
    action: 'update',
    organizationId: validatedArgs.organizationId,
    adminOverride: true,
    auditRejection: true
  })(context);
  
  // Extract update data
  const updateData: any = {};
  
  if (validatedArgs.name !== undefined) updateData.name = validatedArgs.name;
  if (validatedArgs.description !== undefined) updateData.description = validatedArgs.description;
  if (validatedArgs.logoUrl !== undefined) updateData.logoUrl = validatedArgs.logoUrl;
  if (validatedArgs.website !== undefined) updateData.website = validatedArgs.website;
  if (validatedArgs.industry !== undefined) updateData.industry = validatedArgs.industry;
  if (validatedArgs.size !== undefined) updateData.size = validatedArgs.size;
  
  // Update organization
  const updatedOrganization = await prisma.organization.update({
    where: { id: validatedArgs.organizationId },
    data: updateData,
  });
  
  // Apply field-level access control
  const filteredOrganization = await applyFieldAccess(updatedOrganization, user, 'organizations', 'update');
  
  return filteredOrganization;
});
