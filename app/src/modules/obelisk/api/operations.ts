import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { z } from 'zod';
import { ensureArgsSchemaOrThrowHttpError } from '@src/server/validation';

// Dashboard Operations
export const getOsintDashboardStats = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to access the dashboard');
  }

  const userId = context.user.id;

  try {
    // Get counts
    const sourceCount = await prisma.osintSource.count({
      where: { userId },
    });

    const activeSourceCount = await prisma.osintSource.count({
      where: { userId, isActive: true },
    });

    const findingCount = await prisma.osintFinding.count({
      where: {
        source: { userId },
      },
    });

    const unreadFindingCount = await prisma.osintFinding.count({
      where: {
        source: { userId },
        isRead: false,
      },
    });

    const alertCount = await prisma.osintAlert.count({
      where: { userId },
    });

    const unreadAlertCount = await prisma.osintAlert.count({
      where: { userId, isRead: false },
    });

    const scanJobCount = await prisma.osintScanJob.count({
      where: { userId },
    });

    const activeScanJobCount = await prisma.osintScanJob.count({
      where: { userId, status: 'running' },
    });

    // Get recent findings
    const recentFindings = await prisma.osintFinding.findMany({
      where: {
        source: { userId },
      },
      orderBy: { discoveredAt: 'desc' },
      take: 5,
      include: {
        source: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get recent alerts
    const recentAlerts = await prisma.osintAlert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        finding: {
          include: {
            source: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Get findings by category
    const findingsByCategory = await prisma.osintFinding.groupBy({
      by: ['category'],
      where: {
        source: { userId },
      },
      _count: true,
      orderBy: {
        _count: {
          category: 'desc',
        },
      },
    });

    // Get alerts by type
    const alertsByType = await prisma.osintAlert.groupBy({
      by: ['type'],
      where: { userId },
      _count: true,
      orderBy: {
        _count: {
          type: 'desc',
        },
      },
    });

    // Get findings by severity
    const findingsBySeverity = await prisma.osintFinding.groupBy({
      by: ['severity'],
      where: {
        source: { userId },
      },
      _count: true,
    });

    // Get alerts by severity
    const alertsBySeverity = await prisma.osintAlert.groupBy({
      by: ['severity'],
      where: { userId },
      _count: true,
    });

    return {
      counts: {
        sourceCount,
        activeSourceCount,
        findingCount,
        unreadFindingCount,
        alertCount,
        unreadAlertCount,
        scanJobCount,
        activeScanJobCount,
      },
      recentFindings,
      recentAlerts,
      findingsByCategory,
      alertsByType,
      findingsBySeverity,
      alertsBySeverity,
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw new HttpError(500, 'Failed to get dashboard stats');
  }
};

// Schema for OSINT sources
const osintSourceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum([
    'social_media',
    'dark_web',
    'domain_registry',
    'github',
    'job_board',
    'breach_data',
    'api',
    'other',
  ]),
  config: z.record(z.any()).default({}),
  isActive: z.boolean().default(true),
});

// Schema for OSINT findings
const osintFindingSchema = z.object({
  id: z.string().optional(),
  sourceId: z.string(),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  rawData: z.any().optional(),
  summary: z.string().optional(),
  category: z.enum([
    'security_threat',
    'market_intelligence',
    'competitor_activity',
    'brand_mention',
    'technology_trend',
    'other',
  ]),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'informational']),
  isRead: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  discoveredAt: z.date().default(() => new Date()),
});

// Schema for OSINT alerts
const osintAlertSchema = z.object({
  id: z.string().optional(),
  findingId: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['security', 'opportunity', 'trend', 'competitor', 'other']),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'informational']),
  isRead: z.boolean().default(false),
  isForwarded: z.boolean().default(false),
  targetModule: z.string().optional(),
  metadata: z.any().optional(),
});

// Schema for OSINT scan jobs
const osintScanJobSchema = z.object({
  id: z.string().optional(),
  sourceType: z.string(),
  parameters: z.record(z.any()).default({}),
  status: z.enum(['pending', 'running', 'completed', 'failed']).default('pending'),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  results: z.any().optional(),
  error: z.string().optional(),
});

// Schema for OSINT webhooks
const osintWebhookSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  endpoint: z.string().url('Must be a valid URL'),
  secret: z.string().min(8, 'Secret must be at least 8 characters'),
  events: z.array(z.string()).min(1, 'At least one event must be selected'),
  isActive: z.boolean().default(true),
});

// Schema for filters
const osintSourceFilterSchema = z.object({
  type: z
    .enum([
      'social_media',
      'dark_web',
      'domain_registry',
      'github',
      'job_board',
      'breach_data',
      'api',
      'other',
    ])
    .optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
});

const osintFindingFilterSchema = z.object({
  sourceId: z.string().optional(),
  category: z
    .enum([
      'security_threat',
      'market_intelligence',
      'competitor_activity',
      'brand_mention',
      'technology_trend',
      'other',
    ])
    .optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'informational']).optional(),
  isRead: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  search: z.string().optional(),
});

const osintAlertFilterSchema = z.object({
  findingId: z.string().optional(),
  type: z.enum(['security', 'opportunity', 'trend', 'competitor', 'other']).optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'informational']).optional(),
  isRead: z.boolean().optional(),
  isForwarded: z.boolean().optional(),
  targetModule: z.string().optional(),
  search: z.string().optional(),
});

const osintScanJobFilterSchema = z.object({
  sourceType: z.string().optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed']).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

// OSINT Source Operations

export const createOsintSource = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to create an OSINT source');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(osintSourceSchema, args);

  try {
    const osintSource = await prisma.osintSource.create({
      data: {
        ...validatedArgs,
        userId: context.user.id,
      },
    });

    return osintSource;
  } catch (error) {
    console.error('Error creating OSINT source:', error);
    throw new HttpError(500, 'Failed to create OSINT source');
  }
};

export const updateOsintSource = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to update an OSINT source');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(
    osintSourceSchema.extend({ id: z.string() }),
    args
  );

  try {
    const osintSource = await prisma.osintSource.findUnique({
      where: { id: validatedArgs.id },
    });

    if (!osintSource) {
      throw new HttpError(404, 'OSINT source not found');
    }

    if (osintSource.userId !== context.user.id) {
      throw new HttpError(403, "You don't have permission to update this OSINT source");
    }

    const updatedOsintSource = await prisma.osintSource.update({
      where: { id: validatedArgs.id },
      data: {
        name: validatedArgs.name,
        description: validatedArgs.description,
        type: validatedArgs.type,
        config: validatedArgs.config,
        isActive: validatedArgs.isActive,
      },
    });

    return updatedOsintSource;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error updating OSINT source:', error);
    throw new HttpError(500, 'Failed to update OSINT source');
  }
};

export const deleteOsintSource = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to delete an OSINT source');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(z.object({ id: z.string() }), args);

  try {
    const osintSource = await prisma.osintSource.findUnique({
      where: { id: validatedArgs.id },
    });

    if (!osintSource) {
      throw new HttpError(404, 'OSINT source not found');
    }

    if (osintSource.userId !== context.user.id) {
      throw new HttpError(403, "You don't have permission to delete this OSINT source");
    }

    // Delete related findings and alerts
    const findings = await prisma.osintFinding.findMany({
      where: { sourceId: validatedArgs.id },
    });

    for (const finding of findings) {
      await prisma.osintAlert.deleteMany({
        where: { findingId: finding.id },
      });
    }

    await prisma.osintFinding.deleteMany({
      where: { sourceId: validatedArgs.id },
    });

    // Delete the OSINT source
    await prisma.osintSource.delete({
      where: { id: validatedArgs.id },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error deleting OSINT source:', error);
    throw new HttpError(500, 'Failed to delete OSINT source');
  }
};

export const getOsintSources = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to get OSINT sources');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(osintSourceFilterSchema, args);

  try {
    const whereClause: any = {
      userId: context.user.id,
    };

    if (validatedArgs.type) {
      whereClause.type = validatedArgs.type;
    }

    if (validatedArgs.isActive !== undefined) {
      whereClause.isActive = validatedArgs.isActive;
    }

    if (validatedArgs.search) {
      whereClause.OR = [
        { name: { contains: validatedArgs.search, mode: 'insensitive' } },
        { description: { contains: validatedArgs.search, mode: 'insensitive' } },
      ];
    }

    const osintSources = await prisma.osintSource.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            findings: true,
          },
        },
      },
    });

    return osintSources;
  } catch (error) {
    console.error('Error getting OSINT sources:', error);
    throw new HttpError(500, 'Failed to get OSINT sources');
  }
};

export const getOsintSourceById = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to get an OSINT source');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(z.object({ id: z.string() }), args);

  try {
    const osintSource = await prisma.osintSource.findUnique({
      where: { id: validatedArgs.id },
      include: {
        findings: {
          orderBy: { discoveredAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!osintSource) {
      throw new HttpError(404, 'OSINT source not found');
    }

    if (osintSource.userId !== context.user.id) {
      throw new HttpError(403, "You don't have permission to view this OSINT source");
    }

    return osintSource;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error getting OSINT source:', error);
    throw new HttpError(500, 'Failed to get OSINT source');
  }
};

// Get all findings with optional filtering
export const getOsintFindings = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to get OSINT findings');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(osintFindingFilterSchema, args);

  try {
    const whereClause: any = {
      source: {
        userId: context.user.id,
      },
    };

    if (validatedArgs.sourceId) {
      whereClause.sourceId = validatedArgs.sourceId;
    }

    if (validatedArgs.category) {
      whereClause.category = validatedArgs.category;
    }

    if (validatedArgs.severity) {
      whereClause.severity = validatedArgs.severity;
    }

    if (validatedArgs.isRead !== undefined) {
      whereClause.isRead = validatedArgs.isRead;
    }

    if (validatedArgs.isArchived !== undefined) {
      whereClause.isArchived = validatedArgs.isArchived;
    }

    if (validatedArgs.startDate && validatedArgs.endDate) {
      whereClause.discoveredAt = {
        gte: validatedArgs.startDate,
        lte: validatedArgs.endDate,
      };
    } else if (validatedArgs.startDate) {
      whereClause.discoveredAt = {
        gte: validatedArgs.startDate,
      };
    } else if (validatedArgs.endDate) {
      whereClause.discoveredAt = {
        lte: validatedArgs.endDate,
      };
    }

    if (validatedArgs.search) {
      whereClause.OR = [
        { title: { contains: validatedArgs.search, mode: 'insensitive' } },
        { content: { contains: validatedArgs.search, mode: 'insensitive' } },
        { summary: { contains: validatedArgs.search, mode: 'insensitive' } },
      ];
    }

    const findings = await prisma.osintFinding.findMany({
      where: whereClause,
      orderBy: { discoveredAt: 'desc' },
      include: {
        source: {
          select: {
            name: true,
            type: true,
          },
        },
        _count: {
          select: {
            alerts: true,
          },
        },
      },
    });

    return findings;
  } catch (error) {
    console.error('Error getting OSINT findings:', error);
    throw new HttpError(500, 'Failed to get OSINT findings');
  }
};

// Get all alerts with optional filtering
export const getOsintAlerts = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to get OSINT alerts');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(osintAlertFilterSchema, args);

  try {
    const whereClause: any = {
      userId: context.user.id,
    };

    if (validatedArgs.findingId) {
      whereClause.findingId = validatedArgs.findingId;
    }

    if (validatedArgs.type) {
      whereClause.type = validatedArgs.type;
    }

    if (validatedArgs.severity) {
      whereClause.severity = validatedArgs.severity;
    }

    if (validatedArgs.isRead !== undefined) {
      whereClause.isRead = validatedArgs.isRead;
    }

    if (validatedArgs.isForwarded !== undefined) {
      whereClause.isForwarded = validatedArgs.isForwarded;
    }

    if (validatedArgs.targetModule) {
      whereClause.targetModule = validatedArgs.targetModule;
    }

    if (validatedArgs.search) {
      whereClause.OR = [
        { title: { contains: validatedArgs.search, mode: 'insensitive' } },
        { description: { contains: validatedArgs.search, mode: 'insensitive' } },
      ];
    }

    const alerts = await prisma.osintAlert.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        finding: {
          include: {
            source: {
              select: {
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });

    return alerts;
  } catch (error) {
    console.error('Error getting OSINT alerts:', error);
    throw new HttpError(500, 'Failed to get OSINT alerts');
  }
};

// OSINT Finding Operations

export const createOsintFinding = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to create an OSINT finding');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(osintFindingSchema, args);

  try {
    // Check if the OSINT source exists and belongs to the user
    const osintSource = await prisma.osintSource.findUnique({
      where: { id: validatedArgs.sourceId },
    });

    if (!osintSource) {
      throw new HttpError(404, 'OSINT source not found');
    }

    if (osintSource.userId !== context.user.id) {
      throw new HttpError(403, "You don't have permission to add findings to this OSINT source");
    }

    const osintFinding = await prisma.osintFinding.create({
      data: validatedArgs,
    });

    return osintFinding;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error creating OSINT finding:', error);
    throw new HttpError(500, 'Failed to create OSINT finding');
  }
};

export const updateOsintFinding = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to update an OSINT finding');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(
    osintFindingSchema.extend({ id: z.string() }),
    args
  );

  try {
    const osintFinding = await prisma.osintFinding.findUnique({
      where: { id: validatedArgs.id },
      include: { source: true },
    });

    if (!osintFinding) {
      throw new HttpError(404, 'OSINT finding not found');
    }

    if (osintFinding.source.userId !== context.user.id) {
      throw new HttpError(403, "You don't have permission to update this OSINT finding");
    }

    const updatedOsintFinding = await prisma.osintFinding.update({
      where: { id: validatedArgs.id },
      data: {
        title: validatedArgs.title,
        content: validatedArgs.content,
        rawData: validatedArgs.rawData,
        summary: validatedArgs.summary,
        category: validatedArgs.category,
        severity: validatedArgs.severity,
        isRead: validatedArgs.isRead,
        isArchived: validatedArgs.isArchived,
        discoveredAt: validatedArgs.discoveredAt,
      },
    });

    return updatedOsintFinding;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error updating OSINT finding:', error);
    throw new HttpError(500, 'Failed to update OSINT finding');
  }
};

export const deleteOsintFinding = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to delete an OSINT finding');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(z.object({ id: z.string() }), args);

  try {
    const osintFinding = await prisma.osintFinding.findUnique({
      where: { id: validatedArgs.id },
      include: { source: true },
    });

    if (!osintFinding) {
      throw new HttpError(404, 'OSINT finding not found');
    }

    if (osintFinding.source.userId !== context.user.id) {
      throw new HttpError(403, "You don't have permission to delete this OSINT finding");
    }

    // Delete related alerts
    await prisma.osintAlert.deleteMany({
      where: { findingId: validatedArgs.id },
    });

    // Delete the OSINT finding
    await prisma.osintFinding.delete({
      where: { id: validatedArgs.id },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error deleting OSINT finding:', error);
    throw new HttpError(500, 'Failed to delete OSINT finding');
  }
};

export const getOsintFindings = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to get OSINT findings');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(osintFindingFilterSchema, args);

  try {
    // First, get all sources that belong to the user
    const userSources = await prisma.osintSource.findMany({
      where: { userId: context.user.id },
      select: { id: true },
    });

    const sourceIds = userSources.map((source) => source.id);

    const whereClause: any = {
      sourceId: { in: sourceIds },
    };

    if (validatedArgs.sourceId) {
      whereClause.sourceId = validatedArgs.sourceId;
    }

    if (validatedArgs.category) {
      whereClause.category = validatedArgs.category;
    }

    if (validatedArgs.severity) {
      whereClause.severity = validatedArgs.severity;
    }

    if (validatedArgs.isRead !== undefined) {
      whereClause.isRead = validatedArgs.isRead;
    }

    if (validatedArgs.isArchived !== undefined) {
      whereClause.isArchived = validatedArgs.isArchived;
    }

    if (validatedArgs.startDate) {
      whereClause.discoveredAt = {
        ...(whereClause.discoveredAt || {}),
        gte: validatedArgs.startDate,
      };
    }

    if (validatedArgs.endDate) {
      whereClause.discoveredAt = {
        ...(whereClause.discoveredAt || {}),
        lte: validatedArgs.endDate,
      };
    }

    if (validatedArgs.search) {
      whereClause.OR = [
        { title: { contains: validatedArgs.search, mode: 'insensitive' } },
        { content: { contains: validatedArgs.search, mode: 'insensitive' } },
        { summary: { contains: validatedArgs.search, mode: 'insensitive' } },
      ];
    }

    const osintFindings = await prisma.osintFinding.findMany({
      where: whereClause,
      orderBy: { discoveredAt: 'desc' },
      include: {
        source: {
          select: {
            name: true,
            type: true,
          },
        },
        _count: {
          select: {
            alerts: true,
          },
        },
      },
    });

    return osintFindings;
  } catch (error) {
    console.error('Error getting OSINT findings:', error);
    throw new HttpError(500, 'Failed to get OSINT findings');
  }
};

export const getOsintFindingById = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to get an OSINT finding');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(z.object({ id: z.string() }), args);

  try {
    const osintFinding = await prisma.osintFinding.findUnique({
      where: { id: validatedArgs.id },
      include: {
        source: true,
        alerts: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!osintFinding) {
      throw new HttpError(404, 'OSINT finding not found');
    }

    if (osintFinding.source.userId !== context.user.id) {
      throw new HttpError(403, "You don't have permission to view this OSINT finding");
    }

    // Mark as read if it wasn't already
    if (!osintFinding.isRead) {
      await prisma.osintFinding.update({
        where: { id: validatedArgs.id },
        data: { isRead: true },
      });
    }

    return osintFinding;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error getting OSINT finding:', error);
    throw new HttpError(500, 'Failed to get OSINT finding');
  }
};

// OSINT Alert Operations

export const createOsintAlert = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to create an OSINT alert');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(osintAlertSchema, args);

  try {
    // Check if the OSINT finding exists and belongs to the user
    const osintFinding = await prisma.osintFinding.findUnique({
      where: { id: validatedArgs.findingId },
      include: { source: true },
    });

    if (!osintFinding) {
      throw new HttpError(404, 'OSINT finding not found');
    }

    if (osintFinding.source.userId !== context.user.id) {
      throw new HttpError(403, "You don't have permission to add alerts to this OSINT finding");
    }

    const osintAlert = await prisma.osintAlert.create({
      data: {
        ...validatedArgs,
        userId: context.user.id,
      },
    });

    return osintAlert;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error creating OSINT alert:', error);
    throw new HttpError(500, 'Failed to create OSINT alert');
  }
};

export const updateOsintAlert = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to update an OSINT alert');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(
    osintAlertSchema.extend({ id: z.string() }),
    args
  );

  try {
    const osintAlert = await prisma.osintAlert.findUnique({
      where: { id: validatedArgs.id },
    });

    if (!osintAlert) {
      throw new HttpError(404, 'OSINT alert not found');
    }

    if (osintAlert.userId !== context.user.id) {
      throw new HttpError(403, "You don't have permission to update this OSINT alert");
    }

    const updatedOsintAlert = await prisma.osintAlert.update({
      where: { id: validatedArgs.id },
      data: {
        title: validatedArgs.title,
        description: validatedArgs.description,
        type: validatedArgs.type,
        severity: validatedArgs.severity,
        isRead: validatedArgs.isRead,
        isForwarded: validatedArgs.isForwarded,
        targetModule: validatedArgs.targetModule,
        metadata: validatedArgs.metadata,
      },
    });

    return updatedOsintAlert;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error updating OSINT alert:', error);
    throw new HttpError(500, 'Failed to update OSINT alert');
  }
};

export const deleteOsintAlert = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to delete an OSINT alert');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(z.object({ id: z.string() }), args);

  try {
    const osintAlert = await prisma.osintAlert.findUnique({
      where: { id: validatedArgs.id },
    });

    if (!osintAlert) {
      throw new HttpError(404, 'OSINT alert not found');
    }

    if (osintAlert.userId !== context.user.id) {
      throw new HttpError(403, "You don't have permission to delete this OSINT alert");
    }

    await prisma.osintAlert.delete({
      where: { id: validatedArgs.id },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error deleting OSINT alert:', error);
    throw new HttpError(500, 'Failed to delete OSINT alert');
  }
};

export const getOsintAlerts = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to get OSINT alerts');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(osintAlertFilterSchema, args);

  try {
    const whereClause: any = {
      userId: context.user.id,
    };

    if (validatedArgs.findingId) {
      whereClause.findingId = validatedArgs.findingId;
    }

    if (validatedArgs.type) {
      whereClause.type = validatedArgs.type;
    }

    if (validatedArgs.severity) {
      whereClause.severity = validatedArgs.severity;
    }

    if (validatedArgs.isRead !== undefined) {
      whereClause.isRead = validatedArgs.isRead;
    }

    if (validatedArgs.isForwarded !== undefined) {
      whereClause.isForwarded = validatedArgs.isForwarded;
    }

    if (validatedArgs.targetModule) {
      whereClause.targetModule = validatedArgs.targetModule;
    }

    if (validatedArgs.search) {
      whereClause.OR = [
        { title: { contains: validatedArgs.search, mode: 'insensitive' } },
        { description: { contains: validatedArgs.search, mode: 'insensitive' } },
      ];
    }

    const osintAlerts = await prisma.osintAlert.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        finding: {
          select: {
            title: true,
            category: true,
            severity: true,
            source: {
              select: {
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });

    return osintAlerts;
  } catch (error) {
    console.error('Error getting OSINT alerts:', error);
    throw new HttpError(500, 'Failed to get OSINT alerts');
  }
};

export const getOsintAlertById = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to get an OSINT alert');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(z.object({ id: z.string() }), args);

  try {
    const osintAlert = await prisma.osintAlert.findUnique({
      where: { id: validatedArgs.id },
      include: {
        finding: {
          include: {
            source: true,
          },
        },
      },
    });

    if (!osintAlert) {
      throw new HttpError(404, 'OSINT alert not found');
    }

    if (osintAlert.userId !== context.user.id) {
      throw new HttpError(403, "You don't have permission to view this OSINT alert");
    }

    // Mark as read if it wasn't already
    if (!osintAlert.isRead) {
      await prisma.osintAlert.update({
        where: { id: validatedArgs.id },
        data: { isRead: true },
      });
    }

    return osintAlert;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error getting OSINT alert:', error);
    throw new HttpError(500, 'Failed to get OSINT alert');
  }
};

// OSINT Scan Job Operations

export const createOsintScanJob = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to create an OSINT scan job');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(osintScanJobSchema, args);

  try {
    const osintScanJob = await prisma.osintScanJob.create({
      data: {
        ...validatedArgs,
        userId: context.user.id,
      },
    });

    // Here you would typically trigger the actual scan job
    // This could be done via a background job or a webhook

    return osintScanJob;
  } catch (error) {
    console.error('Error creating OSINT scan job:', error);
    throw new HttpError(500, 'Failed to create OSINT scan job');
  }
};

export const updateOsintScanJob = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to update an OSINT scan job');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(
    osintScanJobSchema.extend({ id: z.string() }),
    args
  );

  try {
    const osintScanJob = await prisma.osintScanJob.findUnique({
      where: { id: validatedArgs.id },
    });

    if (!osintScanJob) {
      throw new HttpError(404, 'OSINT scan job not found');
    }

    if (osintScanJob.userId !== context.user.id) {
      throw new HttpError(403, "You don't have permission to update this OSINT scan job");
    }

    const updatedOsintScanJob = await prisma.osintScanJob.update({
      where: { id: validatedArgs.id },
      data: {
        sourceType: validatedArgs.sourceType,
        parameters: validatedArgs.parameters,
        status: validatedArgs.status,
        startedAt: validatedArgs.startedAt,
        completedAt: validatedArgs.completedAt,
        results: validatedArgs.results,
        error: validatedArgs.error,
      },
    });

    return updatedOsintScanJob;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error updating OSINT scan job:', error);
    throw new HttpError(500, 'Failed to update OSINT scan job');
  }
};

export const deleteOsintScanJob = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to delete an OSINT scan job');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(z.object({ id: z.string() }), args);

  try {
    const osintScanJob = await prisma.osintScanJob.findUnique({
      where: { id: validatedArgs.id },
    });

    if (!osintScanJob) {
      throw new HttpError(404, 'OSINT scan job not found');
    }

    if (osintScanJob.userId !== context.user.id) {
      throw new HttpError(403, "You don't have permission to delete this OSINT scan job");
    }

    await prisma.osintScanJob.delete({
      where: { id: validatedArgs.id },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error deleting OSINT scan job:', error);
    throw new HttpError(500, 'Failed to delete OSINT scan job');
  }
};

export const getOsintScanJobs = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to get OSINT scan jobs');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(osintScanJobFilterSchema, args);

  try {
    const whereClause: any = {
      userId: context.user.id,
    };

    if (validatedArgs.sourceType) {
      whereClause.sourceType = validatedArgs.sourceType;
    }

    if (validatedArgs.status) {
      whereClause.status = validatedArgs.status;
    }

    if (validatedArgs.startDate) {
      whereClause.createdAt = {
        ...(whereClause.createdAt || {}),
        gte: validatedArgs.startDate,
      };
    }

    if (validatedArgs.endDate) {
      whereClause.createdAt = {
        ...(whereClause.createdAt || {}),
        lte: validatedArgs.endDate,
      };
    }

    const osintScanJobs = await prisma.osintScanJob.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return osintScanJobs;
  } catch (error) {
    console.error('Error getting OSINT scan jobs:', error);
    throw new HttpError(500, 'Failed to get OSINT scan jobs');
  }
};

export const getOsintScanJobById = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to get an OSINT scan job');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(z.object({ id: z.string() }), args);

  try {
    const osintScanJob = await prisma.osintScanJob.findUnique({
      where: { id: validatedArgs.id },
    });

    if (!osintScanJob) {
      throw new HttpError(404, 'OSINT scan job not found');
    }

    if (osintScanJob.userId !== context.user.id) {
      throw new HttpError(403, "You don't have permission to view this OSINT scan job");
    }

    return osintScanJob;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error getting OSINT scan job:', error);
    throw new HttpError(500, 'Failed to get OSINT scan job');
  }
};

// OSINT Webhook Operations

export const createOsintWebhook = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to create an OSINT webhook');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(osintWebhookSchema, args);

  try {
    const osintWebhook = await prisma.osintWebhook.create({
      data: {
        ...validatedArgs,
        userId: context.user.id,
      },
    });

    return osintWebhook;
  } catch (error) {
    console.error('Error creating OSINT webhook:', error);
    throw new HttpError(500, 'Failed to create OSINT webhook');
  }
};

export const updateOsintWebhook = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to update an OSINT webhook');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(
    osintWebhookSchema.extend({ id: z.string() }),
    args
  );

  try {
    const osintWebhook = await prisma.osintWebhook.findUnique({
      where: { id: validatedArgs.id },
    });

    if (!osintWebhook) {
      throw new HttpError(404, 'OSINT webhook not found');
    }

    if (osintWebhook.userId !== context.user.id) {
      throw new HttpError(403, "You don't have permission to update this OSINT webhook");
    }

    const updatedOsintWebhook = await prisma.osintWebhook.update({
      where: { id: validatedArgs.id },
      data: {
        name: validatedArgs.name,
        endpoint: validatedArgs.endpoint,
        secret: validatedArgs.secret,
        events: validatedArgs.events,
        isActive: validatedArgs.isActive,
      },
    });

    return updatedOsintWebhook;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error updating OSINT webhook:', error);
    throw new HttpError(500, 'Failed to update OSINT webhook');
  }
};

export const deleteOsintWebhook = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to delete an OSINT webhook');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(z.object({ id: z.string() }), args);

  try {
    const osintWebhook = await prisma.osintWebhook.findUnique({
      where: { id: validatedArgs.id },
    });

    if (!osintWebhook) {
      throw new HttpError(404, 'OSINT webhook not found');
    }

    if (osintWebhook.userId !== context.user.id) {
      throw new HttpError(403, "You don't have permission to delete this OSINT webhook");
    }

    await prisma.osintWebhook.delete({
      where: { id: validatedArgs.id },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error deleting OSINT webhook:', error);
    throw new HttpError(500, 'Failed to delete OSINT webhook');
  }
};

export const getOsintWebhooks = async (_args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to get OSINT webhooks');
  }

  try {
    const osintWebhooks = await prisma.osintWebhook.findMany({
      where: { userId: context.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return osintWebhooks;
  } catch (error) {
    console.error('Error getting OSINT webhooks:', error);
    throw new HttpError(500, 'Failed to get OSINT webhooks');
  }
};

export const getOsintWebhookById = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to get an OSINT webhook');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(z.object({ id: z.string() }), args);

  try {
    const osintWebhook = await prisma.osintWebhook.findUnique({
      where: { id: validatedArgs.id },
    });

    if (!osintWebhook) {
      throw new HttpError(404, 'OSINT webhook not found');
    }

    if (osintWebhook.userId !== context.user.id) {
      throw new HttpError(403, "You don't have permission to view this OSINT webhook");
    }

    return osintWebhook;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error getting OSINT webhook:', error);
    throw new HttpError(500, 'Failed to get OSINT webhook');
  }
};

// Dashboard Operations

export const getOsintDashboardStats = async (_args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to get OSINT dashboard stats');
  }

  try {
    // Get counts for various entities
    const sourceCount = await prisma.osintSource.count({
      where: { userId: context.user.id },
    });

    const activeSourceCount = await prisma.osintSource.count({
      where: { userId: context.user.id, isActive: true },
    });

    // Get user's sources
    const userSources = await prisma.osintSource.findMany({
      where: { userId: context.user.id },
      select: { id: true },
    });

    const sourceIds = userSources.map((source) => source.id);

    const findingCount = await prisma.osintFinding.count({
      where: { sourceId: { in: sourceIds } },
    });

    const unreadFindingCount = await prisma.osintFinding.count({
      where: { sourceId: { in: sourceIds }, isRead: false },
    });

    const alertCount = await prisma.osintAlert.count({
      where: { userId: context.user.id },
    });

    const unreadAlertCount = await prisma.osintAlert.count({
      where: { userId: context.user.id, isRead: false },
    });

    const scanJobCount = await prisma.osintScanJob.count({
      where: { userId: context.user.id },
    });

    const activeScanJobCount = await prisma.osintScanJob.count({
      where: { userId: context.user.id, status: 'running' },
    });

    // Get recent findings
    const recentFindings = await prisma.osintFinding.findMany({
      where: { sourceId: { in: sourceIds } },
      orderBy: { discoveredAt: 'desc' },
      take: 5,
      include: {
        source: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    });

    // Get recent alerts
    const recentAlerts = await prisma.osintAlert.findMany({
      where: { userId: context.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        finding: {
          select: {
            title: true,
            source: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Get findings by category
    const findingsByCategory = await prisma.osintFinding.groupBy({
      by: ['category'],
      where: { sourceId: { in: sourceIds } },
      _count: true,
    });

    // Get findings by severity
    const findingsBySeverity = await prisma.osintFinding.groupBy({
      by: ['severity'],
      where: { sourceId: { in: sourceIds } },
      _count: true,
    });

    // Get alerts by type
    const alertsByType = await prisma.osintAlert.groupBy({
      by: ['type'],
      where: { userId: context.user.id },
      _count: true,
    });

    // Get alerts by severity
    const alertsBySeverity = await prisma.osintAlert.groupBy({
      by: ['severity'],
      where: { userId: context.user.id },
      _count: true,
    });

    return {
      counts: {
        sourceCount,
        activeSourceCount,
        findingCount,
        unreadFindingCount,
        alertCount,
        unreadAlertCount,
        scanJobCount,
        activeScanJobCount,
      },
      recentFindings,
      recentAlerts,
      findingsByCategory,
      findingsBySeverity,
      alertsByType,
      alertsBySeverity,
    };
  } catch (error) {
    console.error('Error getting OSINT dashboard stats:', error);
    throw new HttpError(500, 'Failed to get OSINT dashboard stats');
  }
};

// Helper function to generate a summary for a finding using AI
export const generateFindingSummary = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to generate a finding summary');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(
    z.object({
      findingId: z.string(),
    }),
    args
  );

  try {
    const finding = await prisma.osintFinding.findUnique({
      where: { id: validatedArgs.findingId },
      include: { source: true },
    });

    if (!finding) {
      throw new HttpError(404, 'OSINT finding not found');
    }

    if (finding.source.userId !== context.user.id) {
      throw new HttpError(403, "You don't have permission to access this finding");
    }

    // Here you would typically call an AI service to generate a summary
    // For now, we'll just return a placeholder
    const summary = `AI-generated summary of "${finding.title}" would appear here.`;

    // Update the finding with the summary
    const updatedFinding = await prisma.osintFinding.update({
      where: { id: validatedArgs.findingId },
      data: { summary },
    });

    return updatedFinding;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error generating finding summary:', error);
    throw new HttpError(500, 'Failed to generate finding summary');
  }
};

// Helper function to forward an alert to another module (Phantom, Athena)
export const forwardAlertToModule = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to forward an alert');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(
    z.object({
      alertId: z.string(),
      targetModule: z.enum(['phantom', 'athena']),
    }),
    args
  );

  try {
    const alert = await prisma.osintAlert.findUnique({
      where: { id: validatedArgs.alertId },
    });

    if (!alert) {
      throw new HttpError(404, 'OSINT alert not found');
    }

    if (alert.userId !== context.user.id) {
      throw new HttpError(403, "You don't have permission to forward this alert");
    }

    // Here you would typically implement the logic to forward the alert to the target module
    // For now, we'll just update the alert status

    const updatedAlert = await prisma.osintAlert.update({
      where: { id: validatedArgs.alertId },
      data: {
        isForwarded: true,
        targetModule: validatedArgs.targetModule,
      },
    });

    return updatedAlert;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error forwarding alert:', error);
    throw new HttpError(500, 'Failed to forward alert');
  }
};

// Get all scan jobs with optional filtering
export const getOsintScanJobs = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to get OSINT scan jobs');
  }

  const validatedArgs = ensureArgsSchemaOrThrowHttpError(osintScanJobFilterSchema, args);

  try {
    const whereClause: any = {
      userId: context.user.id,
    };

    if (validatedArgs.sourceType) {
      whereClause.sourceType = validatedArgs.sourceType;
    }

    if (validatedArgs.status) {
      whereClause.status = validatedArgs.status;
    }

    if (validatedArgs.startDate && validatedArgs.endDate) {
      whereClause.createdAt = {
        gte: validatedArgs.startDate,
        lte: validatedArgs.endDate,
      };
    } else if (validatedArgs.startDate) {
      whereClause.createdAt = {
        gte: validatedArgs.startDate,
      };
    } else if (validatedArgs.endDate) {
      whereClause.createdAt = {
        lte: validatedArgs.endDate,
      };
    }

    const scanJobs = await prisma.osintScanJob.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return scanJobs;
  } catch (error) {
    console.error('Error getting OSINT scan jobs:', error);
    throw new HttpError(500, 'Failed to get OSINT scan jobs');
  }
};

// Get all webhooks with optional filtering
export const getOsintWebhooks = async (args: unknown, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to get OSINT webhooks');
  }

  try {
    const whereClause: any = {
      userId: context.user.id,
    };

    // Add isActive filter if provided
    if (args && typeof args === 'object' && 'isActive' in args) {
      whereClause.isActive = args.isActive;
    }

    const webhooks = await prisma.osintWebhook.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return webhooks;
  } catch (error) {
    console.error('Error getting OSINT webhooks:', error);
    throw new HttpError(500, 'Failed to get OSINT webhooks');
  }
};

// Scheduled job to run OSINT scans
export const runScheduledOsintScans = async () => {
  console.log('Running scheduled OSINT scans...');

  try {
    // Get all active sources
    const activeSources = await prisma.osintSource.findMany({
      where: { isActive: true },
    });

    for (const source of activeSources) {
      // Create a scan job for each active source
      await prisma.osintScanJob.create({
        data: {
          sourceType: source.type,
          parameters: {
            sourceId: source.id,
            isScheduled: true,
          },
          status: 'pending',
          user: { connect: { id: source.userId } },
        },
      });
    }

    console.log(`Created ${activeSources.length} scheduled scan jobs`);
    return { success: true, jobsCreated: activeSources.length };
  } catch (error) {
    console.error('Error running scheduled OSINT scans:', error);
    return { success: false, error: 'Failed to run scheduled scans' };
  }
};
