/**
 * Data Retention Cleanup Job
 * 
 * This job runs on a schedule to clean up old data based on retention policies.
 * It handles:
 * 1. Archiving data before deletion (if configured)
 * 2. Anonymizing user data (if configured)
 * 3. Deleting data that has exceeded its retention period
 * 4. Logging cleanup activities
 */

import { prisma } from 'wasp/server';
import { subDays } from 'date-fns';

/**
 * Main cleanup function
 */
export async function dataRetentionCleanup(): Promise<void> {
  console.log('Starting data retention cleanup job');
  
  try {
    // Get all organizations with retention policies
    const organizations = await prisma.organization.findMany({
      where: {
        logRetentionPolicy: {
          isNot: null,
        },
      },
      include: {
        logRetentionPolicy: true,
      },
    });
    
    // Process each organization
    for (const organization of organizations) {
      if (!organization.logRetentionPolicy) continue;
      
      console.log(`Processing organization: ${organization.id}`);
      
      // Create a cleanup job record
      const cleanupJob = await prisma.dataCleanupJob.create({
        data: {
          status: 'RUNNING',
          organizationId: organization.id,
          initiatedBy: 'SYSTEM',
          policy: organization.logRetentionPolicy,
        },
      });
      
      // Process each data type
      const results = {
        prompts: 0,
        reasoningChains: 0,
        sessions: 0,
        responseNodes: 0,
      };
      
      try {
        // Clean up prompts
        if (organization.logRetentionPolicy.promptRetentionDays > 0) {
          results.prompts = await cleanupPrompts(
            organization.id,
            organization.logRetentionPolicy.promptRetentionDays,
            organization.logRetentionPolicy.archiveBeforeDelete,
            organization.logRetentionPolicy.anonymizeUserData,
            organization.logRetentionPolicy.retainHighRiskPrompts
          );
        }
        
        // Clean up reasoning chains
        if (organization.logRetentionPolicy.reasoningRetentionDays > 0) {
          results.reasoningChains = await cleanupReasoningChains(
            organization.id,
            organization.logRetentionPolicy.reasoningRetentionDays,
            organization.logRetentionPolicy.archiveBeforeDelete,
            organization.logRetentionPolicy.anonymizeUserData
          );
        }
        
        // Clean up sessions
        if (organization.logRetentionPolicy.sessionRetentionDays > 0) {
          results.sessions = await cleanupSessions(
            organization.id,
            organization.logRetentionPolicy.sessionRetentionDays,
            organization.logRetentionPolicy.archiveBeforeDelete,
            organization.logRetentionPolicy.anonymizeUserData
          );
        }
        
        // Clean up response nodes
        if (organization.logRetentionPolicy.responseNodeRetentionDays > 0) {
          results.responseNodes = await cleanupResponseNodes(
            organization.id,
            organization.logRetentionPolicy.responseNodeRetentionDays,
            organization.logRetentionPolicy.archiveBeforeDelete
          );
        }
        
        // Update the cleanup job record
        await prisma.dataCleanupJob.update({
          where: { id: cleanupJob.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            results: results,
          },
        });
        
        // Log the cleanup
        await prisma.systemLog.create({
          data: {
            level: 'INFO',
            message: 'Data retention cleanup completed',
            category: 'ADMIN',
            organizationId: organization.id,
            metadata: {
              jobId: cleanupJob.id,
              results,
            },
          },
        });
        
        console.log(`Cleanup completed for organization ${organization.id}:`, results);
      } catch (error) {
        console.error(`Error cleaning up data for organization ${organization.id}:`, error);
        
        // Update the cleanup job record
        await prisma.dataCleanupJob.update({
          where: { id: cleanupJob.id },
          data: {
            status: 'FAILED',
            completedAt: new Date(),
            error: error instanceof Error ? error.message : String(error),
            results,
          },
        });
        
        // Log the error
        await prisma.systemLog.create({
          data: {
            level: 'ERROR',
            message: 'Data retention cleanup failed',
            category: 'ADMIN',
            organizationId: organization.id,
            metadata: {
              jobId: cleanupJob.id,
              error: error instanceof Error ? error.message : String(error),
              results,
            },
          },
        });
      }
    }
    
    console.log('Data retention cleanup job completed');
  } catch (error) {
    console.error('Error in data retention cleanup job:', error);
  }
}

/**
 * Clean up prompts
 */
async function cleanupPrompts(
  organizationId: string,
  retentionDays: number,
  archiveBeforeDelete: boolean,
  anonymizeUserData: boolean,
  retainHighRiskPrompts: boolean
): Promise<number> {
  const cutoffDate = subDays(new Date(), retentionDays);
  
  // Find prompts to clean up
  const promptsToCleanup = await prisma.aIPrompt.findMany({
    where: {
      organizationId,
      createdAt: {
        lt: cutoffDate,
      },
      // If retainHighRiskPrompts is true, exclude prompts with low safety scores
      ...(retainHighRiskPrompts ? {
        safetyScore: {
          gte: 0.5,
        },
      } : {}),
    },
    include: {
      createdBy: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });
  
  // Archive prompts if configured
  if (archiveBeforeDelete && promptsToCleanup.length > 0) {
    await archiveData('prompts', promptsToCleanup, organizationId, anonymizeUserData);
  }
  
  // Delete prompts
  if (promptsToCleanup.length > 0) {
    await prisma.aIPrompt.deleteMany({
      where: {
        id: {
          in: promptsToCleanup.map(prompt => prompt.id),
        },
      },
    });
  }
  
  return promptsToCleanup.length;
}

/**
 * Clean up reasoning chains
 */
async function cleanupReasoningChains(
  organizationId: string,
  retentionDays: number,
  archiveBeforeDelete: boolean,
  anonymizeUserData: boolean
): Promise<number> {
  const cutoffDate = subDays(new Date(), retentionDays);
  
  // Find reasoning chains to clean up
  const reasoningChainsToCleanup = await prisma.aIReasoning.findMany({
    where: {
      user: {
        organizationId,
      },
      createdAt: {
        lt: cutoffDate,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
      agent: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  
  // Archive reasoning chains if configured
  if (archiveBeforeDelete && reasoningChainsToCleanup.length > 0) {
    await archiveData('reasoningChains', reasoningChainsToCleanup, organizationId, anonymizeUserData);
  }
  
  // Delete reasoning chains
  if (reasoningChainsToCleanup.length > 0) {
    await prisma.aIReasoning.deleteMany({
      where: {
        id: {
          in: reasoningChainsToCleanup.map(chain => chain.id),
        },
      },
    });
  }
  
  return reasoningChainsToCleanup.length;
}

/**
 * Clean up sessions
 */
async function cleanupSessions(
  organizationId: string,
  retentionDays: number,
  archiveBeforeDelete: boolean,
  anonymizeUserData: boolean
): Promise<number> {
  const cutoffDate = subDays(new Date(), retentionDays);
  
  // Find sessions to clean up
  const sessionsToCleanup = await prisma.aISession.findMany({
    where: {
      user: {
        organizationId,
      },
      createdAt: {
        lt: cutoffDate,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
      agent: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  
  // Archive sessions if configured
  if (archiveBeforeDelete && sessionsToCleanup.length > 0) {
    await archiveData('sessions', sessionsToCleanup, organizationId, anonymizeUserData);
  }
  
  // Delete sessions
  if (sessionsToCleanup.length > 0) {
    await prisma.aISession.deleteMany({
      where: {
        id: {
          in: sessionsToCleanup.map(session => session.id),
        },
      },
    });
  }
  
  return sessionsToCleanup.length;
}

/**
 * Clean up response nodes
 */
async function cleanupResponseNodes(
  organizationId: string,
  retentionDays: number,
  archiveBeforeDelete: boolean
): Promise<number> {
  const cutoffDate = subDays(new Date(), retentionDays);
  
  // Find response nodes to clean up
  const responseNodesToCleanup = await prisma.aIResponseNode.findMany({
    where: {
      reasoning: {
        user: {
          organizationId,
        },
      },
      createdAt: {
        lt: cutoffDate,
      },
    },
  });
  
  // Archive response nodes if configured
  if (archiveBeforeDelete && responseNodesToCleanup.length > 0) {
    await archiveData('responseNodes', responseNodesToCleanup, organizationId, false);
  }
  
  // Delete response nodes
  if (responseNodesToCleanup.length > 0) {
    await prisma.aIResponseNode.deleteMany({
      where: {
        id: {
          in: responseNodesToCleanup.map(node => node.id),
        },
      },
    });
  }
  
  return responseNodesToCleanup.length;
}

/**
 * Archive data before deletion
 */
async function archiveData(
  dataType: string,
  data: any[],
  organizationId: string,
  anonymizeUserData: boolean
): Promise<void> {
  if (data.length === 0) return;
  
  // Anonymize user data if configured
  if (anonymizeUserData) {
    data = data.map(item => {
      if (item.user) {
        return {
          ...item,
          user: {
            ...item.user,
            id: `anon_${item.user.id.substring(0, 8)}`,
            username: 'anonymous',
            email: 'anonymous@example.com',
          },
        };
      }
      if (item.createdBy) {
        return {
          ...item,
          createdBy: {
            ...item.createdBy,
            id: `anon_${item.createdBy.id.substring(0, 8)}`,
            username: 'anonymous',
            email: 'anonymous@example.com',
          },
        };
      }
      return item;
    });
  }
  
  // Create archive record
  await prisma.dataArchive.create({
    data: {
      dataType,
      data,
      organizationId,
      itemCount: data.length,
    },
  });
}
