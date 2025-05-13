/**
 * Alert Queries
 * 
 * This file contains queries for retrieving alert rules and alerts.
 */

import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { requireAdmin } from '../../api/middleware/auth';

/**
 * Get alert rules
 */
export const getAlertRules = async (
  args: {
    enabled?: boolean;
    type?: string;
    logType?: string;
    severity?: string;
    createdBy?: string;
  },
  context: any
) => {
  // Check if user is authenticated and has permission
  requireAdmin(context);

  try {
    const where: any = {};

    // Apply filters
    if (args.enabled !== undefined) {
      where.enabled = args.enabled;
    }

    if (args.type) {
      where.type = args.type;
    }

    if (args.logType) {
      where.logType = args.logType;
    }

    if (args.severity) {
      where.severity = args.severity;
    }

    if (args.createdBy) {
      where.createdBy = args.createdBy;
    }

    // Get alert rules
    const rules = await prisma.alertRule.findMany({
      where,
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return rules;
  } catch (error) {
    console.error('Error getting alert rules:', error);
    throw new HttpError(500, 'Failed to get alert rules');
  }
};

/**
 * Get alerts
 */
export const getAlerts = async (
  args: {
    status?: string;
    severity?: string;
    ruleId?: string;
    acknowledgedBy?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  },
  context: any
) => {
  // Check if user is authenticated and has permission
  requireAdmin(context);

  try {
    const where: any = {};

    // Apply filters
    if (args.status) {
      where.status = args.status;
    }

    if (args.severity) {
      where.severity = args.severity;
    }

    if (args.ruleId) {
      where.ruleId = args.ruleId;
    }

    if (args.acknowledgedBy) {
      where.acknowledgedBy = args.acknowledgedBy;
    }

    if (args.startDate) {
      where.createdAt = {
        gte: new Date(args.startDate),
      };
    }

    if (args.endDate) {
      where.createdAt = {
        ...(where.createdAt || {}),
        lte: new Date(args.endDate),
      };
    }

    // Get alerts
    const alerts = await prisma.alert.findMany({
      where,
      orderBy: {
        lastOccurrence: 'desc',
      },
      take: args.limit || 100,
      include: {
        rule: {
          select: {
            id: true,
            name: true,
            type: true,
            logType: true,
          },
        },
        acknowledgedByUser: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return alerts;
  } catch (error) {
    console.error('Error getting alerts:', error);
    throw new HttpError(500, 'Failed to get alerts');
  }
};

/**
 * Get alert by ID
 */
export const getAlertById = async (
  args: {
    id: string;
  },
  context: any
) => {
  // Check if user is authenticated and has permission
  requireAdmin(context);

  try {
    const alert = await prisma.alert.findUnique({
      where: {
        id: args.id,
      },
      include: {
        rule: {
          select: {
            id: true,
            name: true,
            type: true,
            logType: true,
            conditions: true,
          },
        },
        acknowledgedByUser: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!alert) {
      throw new HttpError(404, 'Alert not found');
    }

    return alert;
  } catch (error) {
    console.error('Error getting alert by ID:', error);
    throw new HttpError(500, 'Failed to get alert');
  }
};
