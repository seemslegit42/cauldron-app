import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { z } from 'zod';
import { ensureArgsSchemaOrThrowHttpError } from '../../server/validation';

// Schema for retention policy
export const retentionPolicySchema = z.object({
  promptRetentionDays: z.number().int().min(1).max(3650),
  reasoningRetentionDays: z.number().int().min(1).max(3650),
  sessionRetentionDays: z.number().int().min(1).max(3650),
  responseNodeRetentionDays: z.number().int().min(1).max(3650),
  anonymizeUserData: z.boolean(),
  retainHighRiskPrompts: z.boolean(),
  archiveBeforeDelete: z.boolean(),
  exportArchivesToStorage: z.boolean(),
  storageLocation: z.string().optional(),
});

export type RetentionPolicyInput = z.infer<typeof retentionPolicySchema>;

/**
 * Get the current retention policy
 */
export const getRetentionPolicy = async (_args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }
  
  // Check if user has admin permissions
  // This would be implemented in a real system
  
  try {
    // Get the organization ID for the user
    const user = await prisma.user.findUnique({
      where: { id: context.user.id },
      select: { organizationId: true },
    });
    
    if (!user?.organizationId) {
      throw new HttpError(400, 'User is not associated with an organization');
    }
    
    // Get the retention policy for the organization
    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      include: { logRetentionPolicy: true },
    });
    
    if (!organization) {
      throw new HttpError(404, 'Organization not found');
    }
    
    // If no retention policy exists, return default values
    if (!organization.logRetentionPolicy) {
      return {
        promptRetentionDays: 90,
        reasoningRetentionDays: 30,
        sessionRetentionDays: 90,
        responseNodeRetentionDays: 30,
        anonymizeUserData: true,
        retainHighRiskPrompts: true,
        archiveBeforeDelete: true,
        exportArchivesToStorage: false,
        storageLocation: '',
      };
    }
    
    // Parse the retention policy from JSON
    const retentionPolicy = organization.logRetentionPolicy;
    
    return {
      promptRetentionDays: retentionPolicy.promptRetentionDays || 90,
      reasoningRetentionDays: retentionPolicy.reasoningRetentionDays || 30,
      sessionRetentionDays: retentionPolicy.sessionRetentionDays || 90,
      responseNodeRetentionDays: retentionPolicy.responseNodeRetentionDays || 30,
      anonymizeUserData: retentionPolicy.anonymizeUserData || true,
      retainHighRiskPrompts: retentionPolicy.retainHighRiskPrompts || true,
      archiveBeforeDelete: retentionPolicy.archiveBeforeDelete || true,
      exportArchivesToStorage: retentionPolicy.exportArchivesToStorage || false,
      storageLocation: retentionPolicy.storageLocation || '',
    };
  } catch (error) {
    console.error('Error getting retention policy:', error);
    throw new HttpError(500, 'Failed to get retention policy');
  }
};

/**
 * Update the retention policy
 */
export const updateRetentionPolicy = async (args: RetentionPolicyInput, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }
  
  // Check if user has admin permissions
  // This would be implemented in a real system
  
  // Validate input
  const validatedArgs = ensureArgsSchemaOrThrowHttpError(retentionPolicySchema, args);
  
  try {
    // Get the organization ID for the user
    const user = await prisma.user.findUnique({
      where: { id: context.user.id },
      select: { organizationId: true },
    });
    
    if (!user?.organizationId) {
      throw new HttpError(400, 'User is not associated with an organization');
    }
    
    // Update the retention policy for the organization
    await prisma.organization.update({
      where: { id: user.organizationId },
      data: {
        logRetentionPolicy: {
          upsert: {
            create: {
              promptRetentionDays: validatedArgs.promptRetentionDays,
              reasoningRetentionDays: validatedArgs.reasoningRetentionDays,
              sessionRetentionDays: validatedArgs.sessionRetentionDays,
              responseNodeRetentionDays: validatedArgs.responseNodeRetentionDays,
              anonymizeUserData: validatedArgs.anonymizeUserData,
              retainHighRiskPrompts: validatedArgs.retainHighRiskPrompts,
              archiveBeforeDelete: validatedArgs.archiveBeforeDelete,
              exportArchivesToStorage: validatedArgs.exportArchivesToStorage,
              storageLocation: validatedArgs.storageLocation,
            },
            update: {
              promptRetentionDays: validatedArgs.promptRetentionDays,
              reasoningRetentionDays: validatedArgs.reasoningRetentionDays,
              sessionRetentionDays: validatedArgs.sessionRetentionDays,
              responseNodeRetentionDays: validatedArgs.responseNodeRetentionDays,
              anonymizeUserData: validatedArgs.anonymizeUserData,
              retainHighRiskPrompts: validatedArgs.retainHighRiskPrompts,
              archiveBeforeDelete: validatedArgs.archiveBeforeDelete,
              exportArchivesToStorage: validatedArgs.exportArchivesToStorage,
              storageLocation: validatedArgs.storageLocation,
            },
          },
        },
      },
    });
    
    // Log the update
    await prisma.systemLog.create({
      data: {
        level: 'INFO',
        message: 'Retention policy updated',
        category: 'ADMIN',
        userId: context.user.id,
        organizationId: user.organizationId,
        metadata: {
          policy: validatedArgs,
        },
      },
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating retention policy:', error);
    throw new HttpError(500, 'Failed to update retention policy');
  }
};

/**
 * Run a data cleanup job
 */
export const runDataCleanupJob = async (_args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }
  
  // Check if user has admin permissions
  // This would be implemented in a real system
  
  try {
    // Get the organization ID for the user
    const user = await prisma.user.findUnique({
      where: { id: context.user.id },
      select: { organizationId: true },
    });
    
    if (!user?.organizationId) {
      throw new HttpError(400, 'User is not associated with an organization');
    }
    
    // Get the retention policy for the organization
    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      include: { logRetentionPolicy: true },
    });
    
    if (!organization || !organization.logRetentionPolicy) {
      throw new HttpError(400, 'No retention policy found for organization');
    }
    
    const policy = organization.logRetentionPolicy;
    
    // Create a cleanup job
    const cleanupJob = await prisma.dataCleanupJob.create({
      data: {
        status: 'PENDING',
        organizationId: user.organizationId,
        initiatedBy: context.user.id,
        policy: policy,
      },
    });
    
    // In a real implementation, this would trigger a background job
    // For now, we'll just return the job ID
    
    return { jobId: cleanupJob.id };
  } catch (error) {
    console.error('Error running data cleanup job:', error);
    throw new HttpError(500, 'Failed to run data cleanup job');
  }
};
