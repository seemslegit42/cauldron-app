/**
 * Collaboration Archive Operations
 *
 * This file defines the server operations (queries and actions) for the collaboration archive system.
 * It provides endpoints for creating, retrieving, and verifying tamper-proof archives of human-AI collaboration sessions.
 */

import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { z } from 'zod';
import { ensureArgsSchemaOrThrowHttpError } from '@src/server/validation';
import { LoggingService } from '@src/shared/services/logging';
import { requirePermission } from '@src/api/middleware/rbac';
import { applyFieldVisibility } from '@src/api/middleware/fieldAccess';
import { CollaborationArchiveService } from '../services/collaborationArchiveService';

// Schema for creating an archive
const createArchiveSchema = z.object({
  archiveType: z.string(),
  sourceSessionId: z.string().optional(),
  startTimestamp: z.string().transform(val => new Date(val)),
  endTimestamp: z.string().transform(val => new Date(val)),
  content: z.any(),
  retentionPolicy: z.string(),
  complianceStandards: z.array(z.string()),
  organizationId: z.string().optional(),
  metadata: z.any().optional(),
});

// Schema for verifying an archive
const verifyArchiveSchema = z.object({
  archiveId: z.string(),
  verificationMethod: z.string(),
  metadata: z.any().optional(),
});

// Schema for retrieving archives
const getArchivesSchema = z.object({
  archiveType: z.string().optional(),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  sourceSessionId: z.string().optional(),
  status: z.string().optional(),
  page: z.number().optional().default(1),
  pageSize: z.number().optional().default(10),
});

// Schema for retrieving archive content
const getArchiveContentSchema = z.object({
  archiveId: z.string(),
  decryptionKey: z.string().optional(),
  reason: z.string().optional(),
});

// Schema for compliance report
const generateComplianceReportSchema = z.object({
  standard: z.string(), // "SOC2", "GDPR", "HIPAA", etc.
  startDate: z.string().transform(val => new Date(val)),
  endDate: z.string().transform(val => new Date(val)),
  organizationId: z.string().optional(),
  includeArchiveTypes: z.array(z.string()).optional(),
  format: z.enum(['pdf', 'json', 'csv']).default('pdf'),
});

/**
 * Creates a tamper-proof archive of a collaboration session
 */
export const createCollaborationArchive = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'archive:create' permission
  const user = await requirePermission({
    resource: 'archive',
    action: 'create',
    adminOverride: true,
    auditRejection: true
  })(context);

  try {
    // Validate arguments
    const validatedArgs = ensureArgsSchemaOrThrowHttpError(createArchiveSchema, args);

    // Log the operation
    LoggingService.info({
      message: 'Creating tamper-proof collaboration archive',
      userId: user.id,
      module: 'sentinel',
      category: 'ARCHIVE',
      metadata: {
        archiveType: validatedArgs.archiveType,
        sourceSessionId: validatedArgs.sourceSessionId,
      }
    });

    // Create the archive
    const result = await CollaborationArchiveService.createArchive({
      userId: user.id,
      organizationId: validatedArgs.organizationId || user.organizationId,
      archiveType: validatedArgs.archiveType,
      sourceSessionId: validatedArgs.sourceSessionId,
      startTimestamp: validatedArgs.startTimestamp,
      endTimestamp: validatedArgs.endTimestamp,
      content: validatedArgs.content,
      retentionPolicy: validatedArgs.retentionPolicy,
      complianceStandards: validatedArgs.complianceStandards,
      metadata: validatedArgs.metadata,
    });

    return result;
  } catch (error) {
    console.error('Error creating collaboration archive:', error);
    LoggingService.error({
      message: 'Failed to create collaboration archive',
      userId: user.id,
      module: 'sentinel',
      category: 'ARCHIVE',
      error
    });
    throw new HttpError(500, 'Failed to create collaboration archive');
  }
};

/**
 * Verifies the integrity of an archive
 */
export const verifyCollaborationArchive = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'archive:verify' permission
  const user = await requirePermission({
    resource: 'archive',
    action: 'verify',
    adminOverride: true,
    auditRejection: true
  })(context);

  try {
    // Validate arguments
    const validatedArgs = ensureArgsSchemaOrThrowHttpError(verifyArchiveSchema, args);

    // Log the operation
    LoggingService.info({
      message: 'Verifying collaboration archive',
      userId: user.id,
      module: 'sentinel',
      category: 'ARCHIVE',
      metadata: {
        archiveId: validatedArgs.archiveId,
        verificationMethod: validatedArgs.verificationMethod,
      }
    });

    // Verify the archive
    const result = await CollaborationArchiveService.verifyArchive({
      archiveId: validatedArgs.archiveId,
      verifiedBy: user.id,
      verificationMethod: validatedArgs.verificationMethod,
      metadata: validatedArgs.metadata,
    });

    // Log archive access
    await CollaborationArchiveService.logArchiveAccess({
      archiveId: validatedArgs.archiveId,
      accessedBy: user.id,
      accessType: 'verify',
      metadata: {
        verificationMethod: validatedArgs.verificationMethod,
        result: result.isValid,
      },
    });

    return result;
  } catch (error) {
    console.error('Error verifying collaboration archive:', error);
    LoggingService.error({
      message: 'Failed to verify collaboration archive',
      userId: user.id,
      module: 'sentinel',
      category: 'ARCHIVE',
      error,
      metadata: { archiveId: args.archiveId }
    });
    throw new HttpError(500, 'Failed to verify collaboration archive');
  }
};

/**
 * Gets a list of collaboration archives
 */
export const getCollaborationArchives = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'archive:read' permission
  const user = await requirePermission({
    resource: 'archive',
    action: 'read',
    adminOverride: true,
    auditRejection: true
  })(context);

  try {
    // Validate arguments
    const validatedArgs = ensureArgsSchemaOrThrowHttpError(getArchivesSchema, args);

    // Build where clause
    const where: any = {};

    // If not admin, restrict to user's archives or organization's archives
    if (!user.isAdmin) {
      where.OR = [
        { userId: user.id },
        { organizationId: user.organizationId }
      ];
    }

    // Add optional filters
    if (validatedArgs.archiveType) {
      where.archiveType = validatedArgs.archiveType;
    }
    if (validatedArgs.sourceSessionId) {
      where.sourceSessionId = validatedArgs.sourceSessionId;
    }
    if (validatedArgs.status) {
      where.status = validatedArgs.status;
    }
    if (validatedArgs.startDate || validatedArgs.endDate) {
      where.startTimestamp = {};
      if (validatedArgs.startDate) {
        where.startTimestamp.gte = validatedArgs.startDate;
      }
      if (validatedArgs.endDate) {
        where.startTimestamp.lte = validatedArgs.endDate;
      }
    }

    // Calculate pagination
    const skip = (validatedArgs.page - 1) * validatedArgs.pageSize;
    const take = validatedArgs.pageSize;

    // Get archives
    const [archives, total] = await Promise.all([
      prisma.collaborationArchive.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          verifications: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          accessLogs: {
            orderBy: { timestamp: 'desc' },
            take: 5,
          },
        },
      }),
      prisma.collaborationArchive.count({ where }),
    ]);

    // Apply field-level access control
    const filteredArchives = applyFieldVisibility(archives, 'collaboration-archives', 'read');

    // Log archive access
    for (const archive of archives) {
      await CollaborationArchiveService.logArchiveAccess({
        archiveId: archive.id,
        accessedBy: user.id,
        accessType: 'view',
      });
    }

    return {
      archives: filteredArchives,
      pagination: {
        page: validatedArgs.page,
        pageSize: validatedArgs.pageSize,
        totalItems: total,
        totalPages: Math.ceil(total / validatedArgs.pageSize),
      },
    };
  } catch (error) {
    console.error('Error getting collaboration archives:', error);
    LoggingService.error({
      message: 'Failed to get collaboration archives',
      userId: user.id,
      module: 'sentinel',
      category: 'ARCHIVE',
      error
    });
    throw new HttpError(500, 'Failed to get collaboration archives');
  }
};

/**
 * Gets the content of a collaboration archive
 */
export const getCollaborationArchiveContent = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'archive:download' permission
  const user = await requirePermission({
    resource: 'archive',
    action: 'download',
    adminOverride: true,
    auditRejection: true
  })(context);

  try {
    // Validate arguments
    const validatedArgs = ensureArgsSchemaOrThrowHttpError(getArchiveContentSchema, args);

    // Check if user has access to this archive
    const archive = await prisma.collaborationArchive.findUnique({
      where: { id: validatedArgs.archiveId },
      select: { id: true, userId: true, organizationId: true }
    });

    if (!archive) {
      throw new HttpError(404, 'Archive not found');
    }

    // Check if user has access to this archive
    if (!user.isAdmin && archive.userId !== user.id && archive.organizationId !== user.organizationId) {
      throw new HttpError(403, 'You do not have permission to access this archive');
    }

    // Log the operation
    LoggingService.info({
      message: 'Retrieving collaboration archive content',
      userId: user.id,
      module: 'sentinel',
      category: 'ARCHIVE',
      metadata: {
        archiveId: validatedArgs.archiveId,
      }
    });

    // Get the archive content
    const result = await CollaborationArchiveService.getArchiveContent({
      archiveId: validatedArgs.archiveId,
      accessedBy: user.id,
      decryptionKey: validatedArgs.decryptionKey,
      reason: validatedArgs.reason,
      metadata: {
        source: 'api',
        ipAddress: context.req?.ip,
        userAgent: context.req?.headers['user-agent'],
      },
    });

    return result;
  } catch (error) {
    console.error('Error getting collaboration archive content:', error);
    LoggingService.error({
      message: 'Failed to get collaboration archive content',
      userId: user.id,
      module: 'sentinel',
      category: 'ARCHIVE',
      error,
      metadata: { archiveId: args.archiveId }
    });

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(500, 'Failed to get collaboration archive content');
  }
};
