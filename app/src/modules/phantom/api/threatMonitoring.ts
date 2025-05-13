import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { z } from 'zod';
import { ensureArgsSchemaOrThrowHttpError } from '@src/server/validation';
import { LoggingService } from '@src/shared/services/logging';
import { requirePermission } from '@src/api/middleware/rbac';
import { applyFieldAccess, applyFieldAccessToArray } from '@src/api/middleware/fieldAccess';
import { sentientLoop } from '@src/shared/services/sentientLoopService';

// ==================== Threat Feed Operations ====================

// Schema for creating a threat feed
const createThreatFeedSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  type: z.enum(['osint', 'cve', 'domain_clone', 'phishing', 'external_api']),
  url: z.string().url().optional(),
  apiKey: z.string().optional(),
  refreshInterval: z.number().int().positive().optional(),
  configuration: z.record(z.any()).optional(),
});

// Create a new threat feed
export const createThreatFeed = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'threat-feeds:create' permission
  const user = await requirePermission({
    resource: 'threat-feeds',
    action: 'create',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Validate arguments
    const validatedArgs = ensureArgsSchemaOrThrowHttpError(createThreatFeedSchema, args);

    // Log the operation
    LoggingService.info({
      message: `Creating threat feed: ${validatedArgs.name}`,
      userId: user.id,
      module: 'phantom',
      category: 'SECURITY',
      metadata: {
        feedType: validatedArgs.type,
      },
    });

    // Create the threat feed
    const threatFeed = await prisma.threatFeed.create({
      data: {
        ...validatedArgs,
        userId: user.id,
      },
    });

    return threatFeed;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error creating threat feed:', error);
    LoggingService.error({
      message: `Error creating threat feed: ${error}`,
      userId: user.id,
      module: 'phantom',
      category: 'SECURITY',
      error,
    });
    throw new HttpError(500, 'Failed to create threat feed');
  }
};

// Schema for updating a threat feed
const updateThreatFeedSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  type: z.enum(['osint', 'cve', 'domain_clone', 'phishing', 'external_api']).optional(),
  url: z.string().url().optional(),
  apiKey: z.string().optional(),
  refreshInterval: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  configuration: z.record(z.any()).optional(),
});

// Update a threat feed
export const updateThreatFeed = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'threat-feeds:update' permission
  const user = await requirePermission({
    resource: 'threat-feeds',
    action: 'update',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Validate arguments
    const validatedArgs = ensureArgsSchemaOrThrowHttpError(updateThreatFeedSchema, args);

    // Check if the threat feed exists and belongs to the user
    const existingFeed = await prisma.threatFeed.findUnique({
      where: { id: validatedArgs.id },
    });

    if (!existingFeed) {
      throw new HttpError(404, 'Threat feed not found');
    }

    if (existingFeed.userId !== user.id) {
      throw new HttpError(403, "You don't have permission to update this threat feed");
    }

    // Log the operation
    LoggingService.info({
      message: `Updating threat feed: ${existingFeed.name}`,
      userId: user.id,
      module: 'phantom',
      category: 'SECURITY',
      metadata: {
        feedId: existingFeed.id,
        feedType: existingFeed.type,
      },
    });

    // Update the threat feed
    const updatedFeed = await prisma.threatFeed.update({
      where: { id: validatedArgs.id },
      data: {
        name: validatedArgs.name,
        description: validatedArgs.description,
        type: validatedArgs.type,
        url: validatedArgs.url,
        apiKey: validatedArgs.apiKey,
        refreshInterval: validatedArgs.refreshInterval,
        isActive: validatedArgs.isActive,
        configuration: validatedArgs.configuration,
      },
    });

    return updatedFeed;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error updating threat feed:', error);
    LoggingService.error({
      message: `Error updating threat feed: ${error}`,
      userId: user.id,
      module: 'phantom',
      category: 'SECURITY',
      error,
    });
    throw new HttpError(500, 'Failed to update threat feed');
  }
};

// Schema for deleting a threat feed
const deleteThreatFeedSchema = z.object({
  id: z.string().uuid(),
});

// Delete a threat feed
export const deleteThreatFeed = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'threat-feeds:delete' permission
  const user = await requirePermission({
    resource: 'threat-feeds',
    action: 'delete',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Validate arguments
    const validatedArgs = ensureArgsSchemaOrThrowHttpError(deleteThreatFeedSchema, args);

    // Check if the threat feed exists and belongs to the user
    const existingFeed = await prisma.threatFeed.findUnique({
      where: { id: validatedArgs.id },
    });

    if (!existingFeed) {
      throw new HttpError(404, 'Threat feed not found');
    }

    if (existingFeed.userId !== user.id) {
      throw new HttpError(403, "You don't have permission to delete this threat feed");
    }

    // Log the operation
    LoggingService.info({
      message: `Deleting threat feed: ${existingFeed.name}`,
      userId: user.id,
      module: 'phantom',
      category: 'SECURITY',
      metadata: {
        feedId: existingFeed.id,
        feedType: existingFeed.type,
      },
    });

    // Delete the threat feed
    await prisma.threatFeed.delete({
      where: { id: validatedArgs.id },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error deleting threat feed:', error);
    LoggingService.error({
      message: `Error deleting threat feed: ${error}`,
      userId: user.id,
      module: 'phantom',
      category: 'SECURITY',
      error,
    });
    throw new HttpError(500, 'Failed to delete threat feed');
  }
};

// Schema for getting threat feeds
const getThreatFeedsSchema = z.object({
  type: z.enum(['osint', 'cve', 'domain_clone', 'phishing', 'external_api', 'all']).optional().default('all'),
  isActive: z.boolean().optional(),
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().optional().default(10),
});

// Get all threat feeds for a user
export const getThreatFeeds = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'threat-feeds:read' permission
  const user = await requirePermission({
    resource: 'threat-feeds',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
    fieldVisibility: { resource: 'threat-feeds', action: 'read' },
  })(context);

  try {
    // Validate arguments
    const validatedArgs = ensureArgsSchemaOrThrowHttpError(getThreatFeedsSchema, args);

    // Log the operation
    LoggingService.info({
      message: 'Fetching threat feeds',
      userId: user.id,
      module: 'phantom',
      category: 'SECURITY',
      metadata: {
        type: validatedArgs.type,
        isActive: validatedArgs.isActive,
      },
    });

    // Build the query
    const where: any = { userId: user.id };
    if (validatedArgs.type !== 'all') {
      where.type = validatedArgs.type;
    }
    if (validatedArgs.isActive !== undefined) {
      where.isActive = validatedArgs.isActive;
    }

    // Get the total count
    const totalCount = await prisma.threatFeed.count({ where });

    // Get the threat feeds with pagination
    const threatFeeds = await prisma.threatFeed.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (validatedArgs.page - 1) * validatedArgs.pageSize,
      limit: validatedArgs.pageSize,
    });

    // Apply field-level access control
    const filteredFeeds = await applyFieldAccessToArray(threatFeeds, user, 'threat-feeds', 'read');

    return {
      feeds: filteredFeeds,
      pagination: {
        page: validatedArgs.page,
        pageSize: validatedArgs.pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / validatedArgs.pageSize),
      },
    };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error fetching threat feeds:', error);
    LoggingService.error({
      message: `Error fetching threat feeds: ${error}`,
      userId: user.id,
      module: 'phantom',
      category: 'SECURITY',
      error,
    });
    throw new HttpError(500, 'Failed to fetch threat feeds');
  }
};

// Schema for getting a threat feed by ID
const getThreatFeedByIdSchema = z.object({
  id: z.string().uuid(),
});

// Get a threat feed by ID
export const getThreatFeedById = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'threat-feeds:read' permission
  const user = await requirePermission({
    resource: 'threat-feeds',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
    fieldVisibility: { resource: 'threat-feeds', action: 'read' },
  })(context);

  try {
    // Validate arguments
    const validatedArgs = ensureArgsSchemaOrThrowHttpError(getThreatFeedByIdSchema, args);

    // Get the threat feed
    const threatFeed = await prisma.threatFeed.findUnique({
      where: { id: validatedArgs.id },
    });

    if (!threatFeed) {
      throw new HttpError(404, 'Threat feed not found');
    }

    if (threatFeed.userId !== user.id) {
      throw new HttpError(403, "You don't have permission to view this threat feed");
    }

    // Apply field-level access control
    const filteredFeed = await applyFieldAccess(threatFeed, user, 'threat-feeds', 'read');

    return filteredFeed;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error fetching threat feed:', error);
    LoggingService.error({
      message: `Error fetching threat feed: ${error}`,
      userId: user.id,
      module: 'phantom',
      category: 'SECURITY',
      error,
    });
    throw new HttpError(500, 'Failed to fetch threat feed');
  }
};

// Schema for refreshing a threat feed
const refreshThreatFeedSchema = z.object({
  id: z.string().uuid(),
});

// Refresh a threat feed
export const refreshThreatFeed = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'threat-feeds:refresh' permission
  const user = await requirePermission({
    resource: 'threat-feeds',
    action: 'refresh',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Validate arguments
    const validatedArgs = ensureArgsSchemaOrThrowHttpError(refreshThreatFeedSchema, args);

    // Check if the threat feed exists and belongs to the user
    const existingFeed = await prisma.threatFeed.findUnique({
      where: { id: validatedArgs.id },
    });

    if (!existingFeed) {
      throw new HttpError(404, 'Threat feed not found');
    }

    if (existingFeed.userId !== user.id) {
      throw new HttpError(403, "You don't have permission to refresh this threat feed");
    }

    // Log the operation
    LoggingService.info({
      message: `Refreshing threat feed: ${existingFeed.name}`,
      userId: user.id,
      module: 'phantom',
      category: 'SECURITY',
      metadata: {
        feedId: existingFeed.id,
        feedType: existingFeed.type,
      },
    });

    // Implement the refresh logic based on the feed type
    let refreshResult;
    switch (existingFeed.type) {
      case 'osint':
        refreshResult = await refreshOsintFeed(existingFeed, user);
        break;
      case 'cve':
        refreshResult = await refreshCveFeed(existingFeed, user);
        break;
      case 'domain_clone':
        refreshResult = await refreshDomainCloneFeed(existingFeed, user);
        break;
      case 'phishing':
        refreshResult = await refreshPhishingFeed(existingFeed, user);
        break;
      case 'external_api':
        refreshResult = await refreshExternalApiFeed(existingFeed, user);
        break;
      default:
        throw new HttpError(400, `Unsupported feed type: ${existingFeed.type}`);
    }

    // Update the lastRefreshed timestamp
    await prisma.threatFeed.update({
      where: { id: existingFeed.id },
      data: { lastRefreshed: new Date() },
    });

    return refreshResult;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error refreshing threat feed:', error);
    LoggingService.error({
      message: `Error refreshing threat feed: ${error}`,
      userId: user.id,
      module: 'phantom',
      category: 'SECURITY',
      error,
    });
    throw new HttpError(500, 'Failed to refresh threat feed');
  }
};

// Helper functions for refreshing different types of feeds
async function refreshOsintFeed(feed: any, user: any) {
  // Implement OSINT feed refresh logic
  // This would typically involve fetching data from an OSINT source
  // and creating/updating relevant alerts

  // For now, return a mock result
  return {
    success: true,
    message: 'OSINT feed refreshed successfully',
    newAlerts: 0,
    updatedAlerts: 0,
  };
}

async function refreshCveFeed(feed: any, user: any) {
  // Implement CVE feed refresh logic
  // This would typically involve fetching data from a CVE database
  // and creating/updating relevant alerts

  // For now, return a mock result
  return {
    success: true,
    message: 'CVE feed refreshed successfully',
    newAlerts: 0,
    updatedAlerts: 0,
  };
}

async function refreshDomainCloneFeed(feed: any, user: any) {
  // Implement domain clone detection logic
  // This would typically involve checking for similar domains
  // and creating/updating relevant alerts

  // For now, return a mock result
  return {
    success: true,
    message: 'Domain clone feed refreshed successfully',
    newAlerts: 0,
    updatedAlerts: 0,
  };
}

async function refreshPhishingFeed(feed: any, user: any) {
  // Implement phishing detection logic
  // This would typically involve checking for phishing attempts
  // and creating/updating relevant alerts

  // For now, return a mock result
  return {
    success: true,
    message: 'Phishing feed refreshed successfully',
    newAlerts: 0,
    updatedAlerts: 0,
  };
}

async function refreshExternalApiFeed(feed: any, user: any) {
  // Implement external API feed refresh logic
  // This would typically involve fetching data from an external API
  // and creating/updating relevant alerts

  // For now, return a mock result
  return {
    success: true,
    message: 'External API feed refreshed successfully',
    newAlerts: 0,
    updatedAlerts: 0,
  };
}

// ==================== Threat Monitor Operations ====================

// Schema for creating a threat monitor
const createThreatMonitorSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  type: z.enum(['brand', 'domain', 'vulnerability', 'general']),
  keywords: z.array(z.string()).min(1),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'all']),
  notificationEnabled: z.boolean().optional().default(true),
  configuration: z.record(z.any()).optional(),
});

// Create a new threat monitor
export const createThreatMonitor = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'threat-monitors:create' permission
  const user = await requirePermission({
    resource: 'threat-monitors',
    action: 'create',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Validate arguments
    const validatedArgs = ensureArgsSchemaOrThrowHttpError(createThreatMonitorSchema, args);

    // Log the operation
    LoggingService.info({
      message: `Creating threat monitor: ${validatedArgs.name}`,
      userId: user.id,
      module: 'phantom',
      category: 'SECURITY',
      metadata: {
        monitorType: validatedArgs.type,
        keywords: validatedArgs.keywords,
      },
    });

    // Create the threat monitor
    const threatMonitor = await prisma.threatMonitor.create({
      data: {
        ...validatedArgs,
        userId: user.id,
      },
    });

    return threatMonitor;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error creating threat monitor:', error);
    LoggingService.error({
      message: `Error creating threat monitor: ${error}`,
      userId: user.id,
      module: 'phantom',
      category: 'SECURITY',
      error,
    });
    throw new HttpError(500, 'Failed to create threat monitor');
  }
};

// Schema for deleting a threat monitor
const deleteThreatMonitorSchema = z.object({
  id: z.string().uuid(),
});

// Delete a threat monitor
export const deleteThreatMonitor = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'threat-monitors:delete' permission
  const user = await requirePermission({
    resource: 'threat-monitors',
    action: 'delete',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Validate arguments
    const validatedArgs = ensureArgsSchemaOrThrowHttpError(deleteThreatMonitorSchema, args);

    // Check if the threat monitor exists and belongs to the user
    const existingMonitor = await prisma.threatMonitor.findUnique({
      where: { id: validatedArgs.id },
    });

    if (!existingMonitor) {
      throw new HttpError(404, 'Threat monitor not found');
    }

    if (existingMonitor.userId !== user.id) {
      throw new HttpError(403, "You don't have permission to delete this threat monitor");
    }

    // Log the operation
    LoggingService.info({
      message: `Deleting threat monitor: ${existingMonitor.name}`,
      userId: user.id,
      module: 'phantom',
      category: 'SECURITY',
      metadata: {
        monitorId: existingMonitor.id,
        monitorType: existingMonitor.type,
      },
    });

    // Delete the threat monitor
    await prisma.threatMonitor.delete({
      where: { id: validatedArgs.id },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error deleting threat monitor:', error);
    LoggingService.error({
      message: `Error deleting threat monitor: ${error}`,
      userId: user.id,
      module: 'phantom',
      category: 'SECURITY',
      error,
    });
    throw new HttpError(500, 'Failed to delete threat monitor');
  }
};

// Schema for getting threat monitors
const getThreatMonitorsSchema = z.object({
  type: z.enum(['brand', 'domain', 'vulnerability', 'general', 'all']).optional().default('all'),
  isActive: z.boolean().optional(),
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().optional().default(10),
});

// Get all threat monitors for a user
export const getThreatMonitors = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'threat-monitors:read' permission
  const user = await requirePermission({
    resource: 'threat-monitors',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
    fieldVisibility: { resource: 'threat-monitors', action: 'read' },
  })(context);

  try {
    // Validate arguments
    const validatedArgs = ensureArgsSchemaOrThrowHttpError(getThreatMonitorsSchema, args);

    // Log the operation
    LoggingService.info({
      message: 'Fetching threat monitors',
      userId: user.id,
      module: 'phantom',
      category: 'SECURITY',
      metadata: {
        type: validatedArgs.type,
        isActive: validatedArgs.isActive,
      },
    });

    // Build the query
    const where: any = { userId: user.id };
    if (validatedArgs.type !== 'all') {
      where.type = validatedArgs.type;
    }
    if (validatedArgs.isActive !== undefined) {
      where.isActive = validatedArgs.isActive;
    }

    // Get the total count
    const totalCount = await prisma.threatMonitor.count({ where });

    // Get the threat monitors with pagination
    const threatMonitors = await prisma.threatMonitor.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (validatedArgs.page - 1) * validatedArgs.pageSize,
      limit: validatedArgs.pageSize,
    });

    // Apply field-level access control
    const filteredMonitors = await applyFieldAccessToArray(threatMonitors, user, 'threat-monitors', 'read');

    return {
      monitors: filteredMonitors,
      pagination: {
        page: validatedArgs.page,
        pageSize: validatedArgs.pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / validatedArgs.pageSize),
      },
    };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error fetching threat monitors:', error);
    LoggingService.error({
      message: `Error fetching threat monitors: ${error}`,
      userId: user.id,
      module: 'phantom',
      category: 'SECURITY',
      error,
    });
    throw new HttpError(500, 'Failed to fetch threat monitors');
  }
};

// Schema for getting a threat monitor by ID
const getThreatMonitorByIdSchema = z.object({
  id: z.string().uuid(),
});

// Get a threat monitor by ID
export const getThreatMonitorById = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'threat-monitors:read' permission
  const user = await requirePermission({
    resource: 'threat-monitors',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
    fieldVisibility: { resource: 'threat-monitors', action: 'read' },
  })(context);

  try {
    // Validate arguments
    const validatedArgs = ensureArgsSchemaOrThrowHttpError(getThreatMonitorByIdSchema, args);

    // Get the threat monitor
    const threatMonitor = await prisma.threatMonitor.findUnique({
      where: { id: validatedArgs.id },
      include: {
        brandAlerts: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!threatMonitor) {
      throw new HttpError(404, 'Threat monitor not found');
    }

    if (threatMonitor.userId !== user.id) {
      throw new HttpError(403, "You don't have permission to view this threat monitor");
    }

    // Apply field-level access control
    const filteredMonitor = await applyFieldAccess(threatMonitor, user, 'threat-monitors', 'read');

    return filteredMonitor;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error fetching threat monitor:', error);
    LoggingService.error({
      message: `Error fetching threat monitor: ${error}`,
      userId: user.id,
      module: 'phantom',
      category: 'SECURITY',
      error,
    });
    throw new HttpError(500, 'Failed to fetch threat monitor');
  }
};

// ==================== Brand Alert Operations ====================

// Schema for creating a brand alert
const createBrandAlertSchema = z.object({
  monitorId: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string(),
  brandName: z.string(),
  source: z.enum(['social_media', 'dark_web', 'domain', 'phishing', 'other']),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  threatFeedId: z.string().uuid().optional(),
  rawData: z.record(z.any()).optional(),
});

// Create a new brand alert
export const createBrandAlert = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'brand-alerts:create' permission
  const user = await requirePermission({
    resource: 'brand-alerts',
    action: 'create',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Validate arguments
    const validatedArgs = ensureArgsSchemaOrThrowHttpError(createBrandAlertSchema, args);

    // Check if the monitor exists and belongs to the user
    const monitor = await prisma.threatMonitor.findUnique({
      where: { id: validatedArgs.monitorId },
    });

    if (!monitor) {
      throw new HttpError(404, 'Threat monitor not found');
    }

    if (monitor.userId !== user.id) {
      throw new HttpError(403, "You don't have permission to create alerts for this monitor");
    }

    // If threatFeedId is provided, check if it exists and belongs to the user
    if (validatedArgs.threatFeedId) {
      const feed = await prisma.threatFeed.findUnique({
        where: { id: validatedArgs.threatFeedId },
      });

      if (!feed) {
        throw new HttpError(404, 'Threat feed not found');
      }

      if (feed.userId !== user.id) {
        throw new HttpError(403, "You don't have permission to use this threat feed");
      }
    }

    // Log the operation
    LoggingService.info({
      message: `Creating brand alert: ${validatedArgs.title}`,
      userId: user.id,
      module: 'phantom',
      category: 'SECURITY',
      metadata: {
        monitorId: validatedArgs.monitorId,
        brandName: validatedArgs.brandName,
        severity: validatedArgs.severity,
      },
    });

    // Create the brand alert
    const brandAlert = await prisma.brandAlert.create({
      data: {
        ...validatedArgs,
        userId: user.id,
      },
    });

    // If the alert is critical or high severity, use the sentient loop to notify
    if (['critical', 'high'].includes(validatedArgs.severity)) {
      await sentientLoop.humanConfirmation({
        title: `High Severity Brand Alert: ${validatedArgs.title}`,
        description: `A ${validatedArgs.severity} severity brand alert has been detected for ${validatedArgs.brandName}. Please review and take appropriate action.`,
        module: 'phantom',
        entityId: brandAlert.id,
        entityType: 'BrandAlert',
        userId: user.id,
        actions: [
          {
            label: 'Investigate',
            value: 'investigate',
            description: 'Mark the alert as under investigation',
          },
          {
            label: 'Dismiss',
            value: 'dismiss',
            description: 'Mark the alert as a false positive',
          },
        ],
      });
    }

    return brandAlert;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error creating brand alert:', error);
    LoggingService.error({
      message: `Error creating brand alert: ${error}`,
      userId: user.id,
      module: 'phantom',
      category: 'SECURITY',
      error,
    });
    throw new HttpError(500, 'Failed to create brand alert');
  }
};

// ==================== Threat Monitoring Dashboard ====================

// Get the threat monitoring dashboard data
export const getThreatMonitoringDashboard = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'threat-monitoring:read' permission
  const user = await requirePermission({
    resource: 'threat-monitoring',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Log the operation
    LoggingService.info({
      message: 'Fetching threat monitoring dashboard',
      userId: user.id,
      module: 'phantom',
      category: 'SECURITY',
    });

    // Get threat feeds
    const threatFeeds = await prisma.threatFeed.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    // Get threat monitors
    const threatMonitors = await prisma.threatMonitor.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    // Get brand alerts
    const brandAlerts = await prisma.brandAlert.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        monitor: true,
        threatFeed: true,
      },
    });

    // Get CVE alerts
    const cveAlerts = await prisma.cVEAlert.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        threatFeed: true,
      },
    });

    // Get phishing vectors
    const phishingVectors = await prisma.phishingVector.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        threatFeed: true,
      },
    });

    // Get sentinel log integrations
    const sentinelLogIntegrations = await prisma.sentinelLogIntegration.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats
    const criticalBrandAlerts = brandAlerts.filter(alert => alert.severity === 'critical').length;
    const highBrandAlerts = brandAlerts.filter(alert => alert.severity === 'high').length;
    const mediumBrandAlerts = brandAlerts.filter(alert => alert.severity === 'medium').length;
    const lowBrandAlerts = brandAlerts.filter(alert => alert.severity === 'low').length;

    const criticalCVEAlerts = cveAlerts.filter(alert => alert.severity === 'critical').length;
    const highCVEAlerts = cveAlerts.filter(alert => alert.severity === 'high').length;
    const mediumCVEAlerts = cveAlerts.filter(alert => alert.severity === 'medium').length;
    const lowCVEAlerts = cveAlerts.filter(alert => alert.severity === 'low').length;

    const criticalPhishingVectors = phishingVectors.filter(vector => vector.severity === 'critical').length;
    const highPhishingVectors = phishingVectors.filter(vector => vector.severity === 'high').length;
    const mediumPhishingVectors = phishingVectors.filter(vector => vector.severity === 'medium').length;
    const lowPhishingVectors = phishingVectors.filter(vector => vector.severity === 'low').length;

    const stats = {
      totalAlerts: brandAlerts.length + cveAlerts.length + phishingVectors.length,
      criticalAlerts: criticalBrandAlerts + criticalCVEAlerts + criticalPhishingVectors,
      highAlerts: highBrandAlerts + highCVEAlerts + highPhishingVectors,
      mediumAlerts: mediumBrandAlerts + mediumCVEAlerts + mediumPhishingVectors,
      lowAlerts: lowBrandAlerts + lowCVEAlerts + lowPhishingVectors,
      activeMonitors: threatMonitors.filter(monitor => monitor.isActive).length,
      activeFeeds: threatFeeds.filter(feed => feed.isActive).length,
    };

    // Apply field-level access control
    const filteredFeeds = await applyFieldAccessToArray(threatFeeds, user, 'threat-feeds', 'read');
    const filteredMonitors = await applyFieldAccessToArray(threatMonitors, user, 'threat-monitors', 'read');
    const filteredBrandAlerts = await applyFieldAccessToArray(brandAlerts, user, 'brand-alerts', 'read');
    const filteredCVEAlerts = await applyFieldAccessToArray(cveAlerts, user, 'cve-alerts', 'read');
    const filteredPhishingVectors = await applyFieldAccessToArray(phishingVectors, user, 'phishing-vectors', 'read');
    const filteredSentinelLogIntegrations = await applyFieldAccessToArray(sentinelLogIntegrations, user, 'sentinel-log-integrations', 'read');

    return {
      threatFeeds: filteredFeeds,
      threatMonitors: filteredMonitors,
      brandAlerts: filteredBrandAlerts,
      cveAlerts: filteredCVEAlerts,
      phishingVectors: filteredPhishingVectors,
      sentinelLogIntegrations: filteredSentinelLogIntegrations,
      stats,
    };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Error fetching threat monitoring dashboard:', error);
    LoggingService.error({
      message: `Error fetching threat monitoring dashboard: ${error}`,
      userId: user.id,
      module: 'phantom',
      category: 'SECURITY',
      error,
    });
    throw new HttpError(500, 'Failed to fetch threat monitoring dashboard');
  }
};

// ==================== Scheduled Jobs ====================

// Refresh all active threat feeds
export const refreshThreatFeedsJob = async () => {
  try {
    // Log the operation
    LoggingService.info({
      message: 'Running scheduled threat feeds refresh job',
      module: 'phantom',
      category: 'SECURITY',
    });

    // Get all active threat feeds
    const activeFeeds = await prisma.threatFeed.findMany({
      where: { isActive: true },
    });

    // Process each feed
    const results = await Promise.allSettled(
      activeFeeds.map(async (feed) => {
        try {
          // Implement the refresh logic based on the feed type
          let refreshResult;
          switch (feed.type) {
            case 'osint':
              refreshResult = await refreshOsintFeed(feed, { id: feed.userId });
              break;
            case 'cve':
              refreshResult = await refreshCveFeed(feed, { id: feed.userId });
              break;
            case 'domain_clone':
              refreshResult = await refreshDomainCloneFeed(feed, { id: feed.userId });
              break;
            case 'phishing':
              refreshResult = await refreshPhishingFeed(feed, { id: feed.userId });
              break;
            case 'external_api':
              refreshResult = await refreshExternalApiFeed(feed, { id: feed.userId });
              break;
            default:
              throw new Error(`Unsupported feed type: ${feed.type}`);
          }

          // Update the lastRefreshed timestamp
          await prisma.threatFeed.update({
            where: { id: feed.id },
            data: { lastRefreshed: new Date() },
          });

          return {
            feedId: feed.id,
            feedName: feed.name,
            feedType: feed.type,
            success: true,
            result: refreshResult,
          };
        } catch (error) {
          console.error(`Error refreshing feed ${feed.id}:`, error);
          LoggingService.error({
            message: `Error refreshing feed ${feed.name} (${feed.id}): ${error}`,
            userId: feed.userId,
            module: 'phantom',
            category: 'SECURITY',
            error,
          });

          return {
            feedId: feed.id,
            feedName: feed.name,
            feedType: feed.type,
            success: false,
            error: error.message,
          };
        }
      })
    );

    // Log the results
    const successCount = results.filter(result => result.status === 'fulfilled' && result.value.success).length;
    const failureCount = results.length - successCount;

    LoggingService.info({
      message: `Completed threat feeds refresh job: ${successCount} succeeded, ${failureCount} failed`,
      module: 'phantom',
      category: 'SECURITY',
      metadata: {
        successCount,
        failureCount,
        totalFeeds: results.length,
      },
    });

    return {
      success: true,
      message: `Refreshed ${successCount} feeds successfully, ${failureCount} failed`,
      results,
    };
  } catch (error) {
    console.error('Error in threat feeds refresh job:', error);
    LoggingService.error({
      message: `Error in threat feeds refresh job: ${error}`,
      module: 'phantom',
      category: 'SECURITY',
      error,
    });

    return {
      success: false,
      message: `Error in threat feeds refresh job: ${error.message}`,
      error: error.message,
    };
  }
};

// Sync Sentinel logs
export const syncSentinelLogsJob = async () => {
  try {
    // Log the operation
    LoggingService.info({
      message: 'Running scheduled Sentinel logs sync job',
      module: 'phantom',
      category: 'SECURITY',
    });

    // Get all active Sentinel log integrations
    const activeIntegrations = await prisma.sentinelLogIntegration.findMany({
      where: { isActive: true },
    });

    // Process each integration
    const results = await Promise.allSettled(
      activeIntegrations.map(async (integration) => {
        try {
          // Implement the sync logic based on the integration type
          let syncResult;
          switch (integration.type) {
            case 'security_alert':
              syncResult = await syncSecurityAlerts(integration);
              break;
            case 'security_scan':
              syncResult = await syncSecurityScans(integration);
              break;
            case 'compliance_check':
              syncResult = await syncComplianceChecks(integration);
              break;
            default:
              throw new Error(`Unsupported integration type: ${integration.type}`);
          }

          // Update the lastSyncedAt timestamp
          await prisma.sentinelLogIntegration.update({
            where: { id: integration.id },
            data: { lastSyncedAt: new Date() },
          });

          return {
            integrationId: integration.id,
            integrationName: integration.name,
            integrationType: integration.type,
            success: true,
            result: syncResult,
          };
        } catch (error) {
          console.error(`Error syncing integration ${integration.id}:`, error);
          LoggingService.error({
            message: `Error syncing integration ${integration.name} (${integration.id}): ${error}`,
            userId: integration.userId,
            module: 'phantom',
            category: 'SECURITY',
            error,
          });

          return {
            integrationId: integration.id,
            integrationName: integration.name,
            integrationType: integration.type,
            success: false,
            error: error.message,
          };
        }
      })
    );

    // Log the results
    const successCount = results.filter(result => result.status === 'fulfilled' && result.value.success).length;
    const failureCount = results.length - successCount;

    LoggingService.info({
      message: `Completed Sentinel logs sync job: ${successCount} succeeded, ${failureCount} failed`,
      module: 'phantom',
      category: 'SECURITY',
      metadata: {
        successCount,
        failureCount,
        totalIntegrations: results.length,
      },
    });

    return {
      success: true,
      message: `Synced ${successCount} integrations successfully, ${failureCount} failed`,
      results,
    };
  } catch (error) {
    console.error('Error in Sentinel logs sync job:', error);
    LoggingService.error({
      message: `Error in Sentinel logs sync job: ${error}`,
      module: 'phantom',
      category: 'SECURITY',
      error,
    });

    return {
      success: false,
      message: `Error in Sentinel logs sync job: ${error.message}`,
      error: error.message,
    };
  }
};

// Helper functions for syncing Sentinel logs
async function syncSecurityAlerts(integration: any) {
  // Implement security alerts sync logic
  // This would typically involve fetching security alerts from Sentinel
  // and creating/updating relevant alerts in the database

  // For now, return a mock result
  return {
    success: true,
    message: 'Security alerts synced successfully',
    newAlerts: 0,
    updatedAlerts: 0,
  };
}

async function syncSecurityScans(integration: any) {
  // Implement security scans sync logic
  // This would typically involve fetching security scans from Sentinel
  // and creating/updating relevant scans in the database

  // For now, return a mock result
  return {
    success: true,
    message: 'Security scans synced successfully',
    newScans: 0,
    updatedScans: 0,
  };
}

async function syncComplianceChecks(integration: any) {
  // Implement compliance checks sync logic
  // This would typically involve fetching compliance checks from Sentinel
  // and creating/updating relevant checks in the database

  // For now, return a mock result
  return {
    success: true,
    message: 'Compliance checks synced successfully',
    newChecks: 0,
    updatedChecks: 0,
  };
};
