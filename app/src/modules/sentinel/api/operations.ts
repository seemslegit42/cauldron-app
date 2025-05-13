import { HttpError } from 'wasp/server';
import { prisma } from 'wasp/server';
import { z } from 'zod';
import { LoggingService } from '@src/shared/services/logging';
import { ensureArgsSchemaOrThrowHttpError } from '@src/server/validation';
import { requirePermission } from '@src/api/middleware/rbac';
import { applyFieldVisibility } from '@src/api/middleware/fieldAccess';

// Validation schemas
const securityAlertSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  source: z.enum(['scan', 'monitor', 'ai', 'manual', 'integration']),
  status: z.enum(['new', 'acknowledged', 'resolved', 'false_positive']),
  metadata: z.any().optional(),
});

const securityMetricSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  value: z.number(),
  previousValue: z.number().optional(),
  target: z.number().optional(),
  unit: z.string().optional(),
  category: z.enum(['posture', 'threats', 'compliance', 'response']),
  metadata: z.any().optional(),
});

const securityRecommendationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  category: z.enum(['configuration', 'patch', 'policy', 'training', 'monitoring']),
  impact: z.enum(['high', 'medium', 'low']),
  effort: z.enum(['high', 'medium', 'low']),
  metadata: z.any().optional(),
});

const securityScanSchema = z.object({
  type: z.enum(['vulnerability', 'compliance', 'configuration', 'threat', 'full']),
  metadata: z.any().optional(),
});

const acknowledgeAlertSchema = z.object({
  alertId: z.string(),
});

// Get security alerts
export const getSecurityAlerts = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'security-alerts:read' permission
  const user = await requirePermission({
    resource: 'security-alerts',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
    fieldVisibility: { resource: 'security-alerts', action: 'read' },
  })(context);

  try {
    // Log the operation
    LoggingService.info({
      message: `Fetching security alerts for user ${context.user.id}`,
      userId: context.user.id,
      module: 'sentinel',
      category: 'SECURITY',
    });

    // Get security alerts from the database
    const alerts = await prisma.securityAlert.findMany({
      where: { userId: context.user.id },
      orderBy: { createdAt: 'desc' },
    });

    // If no alerts exist, create some sample alerts
    if (alerts.length === 0) {
      const sampleAlerts = [
        {
          userId: context.user.id,
          title: 'Unusual Login Activity Detected',
          description: 'Multiple failed login attempts from IP 192.168.1.1',
          severity: 'medium',
          source: 'monitor',
          status: 'new',
          metadata: { ip: '192.168.1.1', attempts: 5, location: 'Unknown' },
        },
        {
          userId: context.user.id,
          title: 'Critical Vulnerability in Dependencies',
          description: 'CVE-2023-1234 affects one of your dependencies',
          severity: 'high',
          source: 'scan',
          status: 'new',
          metadata: { package: 'example-package', version: '1.2.3', cve: 'CVE-2023-1234' },
        },
        {
          userId: context.user.id,
          title: 'API Rate Limit Exceeded',
          description: 'Your application exceeded the API rate limit',
          severity: 'low',
          source: 'monitor',
          status: 'new',
          metadata: { endpoint: '/api/data', count: 1000, limit: 500 },
        },
      ];

      await prisma.securityAlert.createMany({
        data: sampleAlerts,
      });

      return await prisma.securityAlert.findMany({
        where: { userId: context.user.id },
        orderBy: { createdAt: 'desc' },
      });
    }

    return alerts;
  } catch (error) {
    console.error('Error fetching security alerts:', error);
    LoggingService.error({
      message: `Error fetching security alerts: ${error}`,
      userId: context.user.id,
      module: 'sentinel',
      category: 'SECURITY',
      error,
    });
    throw new HttpError(500, 'Failed to fetch security alerts');
  }
};

// Get security metrics
export const getSecurityMetrics = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'security-metrics:read' permission
  const user = await requirePermission({
    resource: 'security-metrics',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
    fieldVisibility: { resource: 'security-metrics', action: 'read' },
  })(context);

  try {
    // Log the operation
    LoggingService.info({
      message: `Fetching security metrics for user ${user.id}`,
      userId: user.id,
      module: 'sentinel',
      category: 'SECURITY',
    });

    // Get security metrics from the database
    const metrics = await prisma.securityMetric.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    // If no metrics exist, create some sample metrics
    if (metrics.length === 0) {
      const sampleMetrics = [
        {
          userId: context.user.id,
          name: 'security_score',
          value: 78,
          previousValue: 72,
          target: 90,
          unit: '%',
          category: 'posture',
          metadata: { trend: 'improving', lastUpdated: new Date().toISOString() },
        },
        {
          userId: context.user.id,
          name: 'vulnerabilities',
          value: 7,
          previousValue: 12,
          target: 0,
          unit: 'count',
          category: 'threats',
          metadata: { critical: 1, high: 2, medium: 3, low: 1 },
        },
        {
          userId: context.user.id,
          name: 'threats_blocked',
          value: 142,
          previousValue: 98,
          unit: 'count',
          category: 'threats',
          metadata: { lastWeek: 44 },
        },
        {
          userId: context.user.id,
          name: 'compliance_score',
          value: 85,
          previousValue: 85,
          target: 100,
          unit: '%',
          category: 'compliance',
          metadata: { standards: { GDPR: 92, 'PCI-DSS': 78 } },
        },
      ];

      await prisma.securityMetric.createMany({
        data: sampleMetrics,
      });

      return await prisma.securityMetric.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Apply field-level access control
    const filteredMetrics = applyFieldVisibility(metrics, 'security-metrics', 'read');
    return filteredMetrics;
  } catch (error) {
    console.error('Error fetching security metrics:', error);
    LoggingService.error({
      message: `Error fetching security metrics: ${error}`,
      userId: user.id,
      module: 'sentinel',
      category: 'SECURITY',
      error,
    });
    throw new HttpError(500, 'Failed to fetch security metrics');
  }
};

// Get security recommendations
export const getSecurityRecommendations = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'security-recommendations:read' permission
  const user = await requirePermission({
    resource: 'security-recommendations',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
    fieldVisibility: { resource: 'security-recommendations', action: 'read' },
  })(context);

  try {
    // Log the operation
    LoggingService.info({
      message: `Fetching security recommendations for user ${user.id}`,
      userId: user.id,
      module: 'sentinel',
      category: 'SECURITY',
    });

    // Get security recommendations from the database
    const recommendations = await prisma.securityRecommendation.findMany({
      where: { userId: user.id },
      orderBy: [
        { priority: 'asc' }, // critical first, then high, medium, low
        { createdAt: 'desc' },
      ],
    });

    // If no recommendations exist, create some sample recommendations
    if (recommendations.length === 0) {
      const sampleRecommendations = [
        {
          userId: context.user.id,
          title: 'Enable Multi-Factor Authentication',
          description: 'Enable MFA for all admin accounts to improve security posture.',
          priority: 'high',
          status: 'open',
          category: 'configuration',
          impact: 'high',
          effort: 'low',
          metadata: { relatedAlerts: [], estimatedTime: '30 minutes' },
        },
        {
          userId: context.user.id,
          title: 'Update OpenSSL to version 3.0.8',
          description: 'Update OpenSSL to patch CVE-2023-0286 vulnerability.',
          priority: 'critical',
          status: 'open',
          category: 'patch',
          impact: 'high',
          effort: 'medium',
          metadata: { relatedAlerts: ['alert-id-123'], cve: 'CVE-2023-0286' },
        },
        {
          userId: context.user.id,
          title: 'Review and update security incident response plan',
          description: 'Your incident response plan has not been updated in over 6 months.',
          priority: 'medium',
          status: 'open',
          category: 'policy',
          impact: 'medium',
          effort: 'medium',
          metadata: { lastUpdated: '2023-10-15', nextReview: '2024-04-15' },
        },
      ];

      await prisma.securityRecommendation.createMany({
        data: sampleRecommendations,
      });

      return await prisma.securityRecommendation.findMany({
        where: { userId: context.user.id },
        orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
      });
    }

    // Apply field-level access control
    const filteredRecommendations = applyFieldVisibility(
      recommendations,
      'security-recommendations',
      'read'
    );
    return filteredRecommendations;
  } catch (error) {
    console.error('Error fetching security recommendations:', error);
    LoggingService.error({
      message: `Error fetching security recommendations: ${error}`,
      userId: user.id,
      module: 'sentinel',
      category: 'SECURITY',
      error,
    });
    throw new HttpError(500, 'Failed to fetch security recommendations');
  }
};

// Get security scans
export const getSecurityScans = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'security-scans:read' permission
  const user = await requirePermission({
    resource: 'security-scans',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
    fieldVisibility: { resource: 'security-scans', action: 'read' },
  })(context);

  try {
    // Log the operation
    LoggingService.info({
      message: `Fetching security scans for user ${user.id}`,
      userId: user.id,
      module: 'sentinel',
      category: 'SECURITY',
    });

    // Get security scans from the database
    const scans = await prisma.securityScan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        alerts: true,
        complianceChecks: true,
      },
    });

    // If no scans exist, create a sample scan
    if (scans.length === 0) {
      const sampleScan = await prisma.securityScan.create({
        data: {
          userId: user.id,
          type: 'full',
          status: 'completed',
          startedAt: new Date(Date.now() - 3600000), // 1 hour ago
          completedAt: new Date(Date.now() - 3540000), // 59 minutes ago
          summary: 'Initial security scan completed',
          score: 78,
          results: {
            vulnerabilities: 7,
            complianceIssues: 3,
            configurationIssues: 2,
            threatDetections: 0,
          },
          metadata: { duration: '20 minutes', scanEngine: 'Sentinel v1.0' },
        },
      });

      // Create some sample alerts related to the scan
      await prisma.securityAlert.createMany({
        data: [
          {
            userId: user.id,
            title: 'Outdated Node.js Version',
            description: 'Your Node.js version is outdated and contains known vulnerabilities.',
            severity: 'medium',
            source: 'scan',
            status: 'new',
            scanId: sampleScan.id,
            metadata: { currentVersion: '14.15.0', recommendedVersion: '18.16.0' },
          },
          {
            userId: user.id,
            title: 'Insecure CORS Configuration',
            description: 'Your CORS configuration allows requests from any origin.',
            severity: 'high',
            source: 'scan',
            status: 'new',
            scanId: sampleScan.id,
            metadata: { currentConfig: '*', recommendation: 'Restrict to specific domains' },
          },
        ],
      });

      // Create some sample compliance checks related to the scan
      await prisma.complianceCheck.createMany({
        data: [
          {
            userId: context.user.id,
            standard: 'GDPR',
            control: 'Article 32',
            status: 'non_compliant',
            description: 'Implement appropriate technical measures to ensure data security',
            evidence: 'Missing encryption for data at rest',
            scanId: sampleScan.id,
          },
          {
            userId: context.user.id,
            standard: 'PCI-DSS',
            control: '6.5.10',
            status: 'non_compliant',
            description: 'Protect against injection flaws, particularly SQL injection',
            evidence: 'Potential SQL injection vulnerability found in /api/users endpoint',
            scanId: sampleScan.id,
          },
          {
            userId: context.user.id,
            standard: 'SOC2',
            control: 'CC6.1',
            status: 'compliant',
            description: 'Restrict logical access to authorized users',
            evidence: 'Proper authentication and authorization controls in place',
            scanId: sampleScan.id,
          },
        ],
      });

      return await prisma.securityScan.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          alerts: true,
          complianceChecks: true,
        },
      });
    }

    // Apply field-level access control
    const filteredScans = applyFieldVisibility(scans, 'security-scans', 'read');
    return filteredScans;
  } catch (error) {
    console.error('Error fetching security scans:', error);
    LoggingService.error({
      message: `Error fetching security scans: ${error}`,
      userId: user.id,
      module: 'sentinel',
      category: 'SECURITY',
      error,
    });
    throw new HttpError(500, 'Failed to fetch security scans');
  }
};

// Run a security scan
export const runSecurityScan = async (args: any, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in to run a security scan');
  }

  try {
    // Validate arguments
    const validatedArgs = ensureArgsSchemaOrThrowHttpError(securityScanSchema, args);

    // Log the operation
    LoggingService.info({
      message: `Running security scan of type ${validatedArgs.type} for user ${context.user.id}`,
      userId: context.user.id,
      module: 'sentinel',
      category: 'SECURITY',
      metadata: { scanType: validatedArgs.type },
    });

    // Create a new security scan
    const scan = await prisma.securityScan.create({
      data: {
        userId: context.user.id,
        type: validatedArgs.type,
        status: 'running',
        metadata: validatedArgs.metadata,
      },
    });

    // In a real implementation, this would trigger an actual security scan
    // For now, we'll simulate a scan with a delay and then update the scan with results
    setTimeout(async () => {
      try {
        // Generate random results based on scan type
        const results = generateScanResults(validatedArgs.type);

        // Update the scan with results
        await prisma.securityScan.update({
          where: { id: scan.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
            results,
            summary: `${validatedArgs.type.charAt(0).toUpperCase() + validatedArgs.type.slice(1)} scan completed successfully`,
            score: results.score,
          },
        });

        // Create alerts based on scan results
        if (results.alerts && results.alerts.length > 0) {
          await prisma.securityAlert.createMany({
            data: results.alerts.map((alert: any) => ({
              userId: context.user.id,
              title: alert.title,
              description: alert.description,
              severity: alert.severity,
              source: 'scan',
              status: 'new',
              scanId: scan.id,
              metadata: alert.metadata,
            })),
          });
        }

        // Create compliance checks based on scan results
        if (results.complianceChecks && results.complianceChecks.length > 0) {
          await prisma.complianceCheck.createMany({
            data: results.complianceChecks.map((check: any) => ({
              userId: context.user.id,
              standard: check.standard,
              control: check.control,
              status: check.status,
              description: check.description,
              evidence: check.evidence,
              scanId: scan.id,
            })),
          });
        }

        // Log successful completion
        LoggingService.info({
          message: `Security scan ${scan.id} completed successfully`,
          userId: user.id,
          module: 'sentinel',
          category: 'SECURITY',
          metadata: { scanId: scan.id, scanType: validatedArgs.type, score: results.score },
        });
      } catch (error) {
        // Update the scan with error status
        await prisma.securityScan.update({
          where: { id: scan.id },
          data: {
            status: 'failed',
            completedAt: new Date(),
            summary: `Scan failed: ${error}`,
          },
        });

        // Log error
        LoggingService.error({
          message: `Security scan ${scan.id} failed: ${error}`,
          userId: user.id,
          module: 'sentinel',
          category: 'SECURITY',
          error,
          metadata: { scanId: scan.id, scanType: validatedArgs.type },
        });
      }
    }, 5000); // Simulate a 5-second scan

    return scan;
  } catch (error) {
    console.error('Error running security scan:', error);
    LoggingService.error({
      message: `Error running security scan: ${error}`,
      userId: context.user.id,
      module: 'sentinel',
      category: 'SECURITY',
      error,
    });
    throw new HttpError(500, 'Failed to run security scan');
  }
};

// Acknowledge a security alert
export const acknowledgeAlert = async (args: any, context: any) => {
  // Apply RBAC middleware - require 'security-alerts:acknowledge' permission
  const user = await requirePermission({
    resource: 'security-alerts',
    action: 'acknowledge',
    adminOverride: true,
    auditRejection: true,
  })(context);

  try {
    // Validate arguments
    const validatedArgs = ensureArgsSchemaOrThrowHttpError(acknowledgeAlertSchema, args);

    // Log the operation
    LoggingService.info({
      message: `Acknowledging security alert ${validatedArgs.alertId}`,
      userId: user.id,
      module: 'sentinel',
      category: 'SECURITY',
      metadata: { alertId: validatedArgs.alertId },
    });

    // Find the alert
    const alert = await prisma.securityAlert.findUnique({
      where: { id: validatedArgs.alertId },
    });

    // Check if the alert exists and belongs to the user
    if (!alert) {
      throw new HttpError(404, 'Alert not found');
    }

    if (alert.userId !== user.id) {
      throw new HttpError(403, "You don't have permission to acknowledge this alert");
    }

    // Update the alert
    const updatedAlert = await prisma.securityAlert.update({
      where: { id: validatedArgs.alertId },
      data: {
        status: 'acknowledged',
        acknowledgedAt: new Date(),
      },
    });

    return updatedAlert;
  } catch (error) {
    console.error('Error acknowledging security alert:', error);
    LoggingService.error({
      message: `Error acknowledging security alert: ${error}`,
      userId: user.id,
      module: 'sentinel',
      category: 'SECURITY',
      error,
    });
    throw new HttpError(500, 'Failed to acknowledge security alert');
  }
};

// Helper function to generate scan results
function generateScanResults(scanType: string) {
  const score = Math.floor(Math.random() * 30) + 70; // Random score between 70-100

  let results: any = {
    score,
    timestamp: new Date().toISOString(),
    alerts: [],
    complianceChecks: [],
  };

  // Add type-specific results
  switch (scanType) {
    case 'vulnerability':
      results.vulnerabilities = Math.floor(Math.random() * 10);
      results.criticalVulnerabilities = Math.floor(Math.random() * 2);
      results.highVulnerabilities = Math.floor(Math.random() * 3);
      results.mediumVulnerabilities = Math.floor(Math.random() * 5);
      results.lowVulnerabilities = Math.floor(Math.random() * 5);

      // Add some sample alerts
      if (results.criticalVulnerabilities > 0) {
        results.alerts.push({
          title: 'Critical SQL Injection Vulnerability',
          description: 'A critical SQL injection vulnerability was found in the login form.',
          severity: 'critical',
          metadata: { location: '/api/auth/login', cve: 'CVE-2023-5678' },
        });
      }

      if (results.highVulnerabilities > 0) {
        results.alerts.push({
          title: 'Cross-Site Scripting (XSS) Vulnerability',
          description: 'An XSS vulnerability was found in the comment section.',
          severity: 'high',
          metadata: { location: '/api/comments', cve: 'CVE-2023-9876' },
        });
      }
      break;

    case 'compliance':
      results.standardsChecked = ['GDPR', 'PCI-DSS', 'SOC2', 'ISO27001'];
      results.compliantControls = Math.floor(Math.random() * 20) + 80; // 80-100
      results.nonCompliantControls = Math.floor(Math.random() * 10);
      results.partiallyCompliantControls = Math.floor(Math.random() * 5);

      // Add some sample compliance checks
      results.complianceChecks = [
        {
          standard: 'GDPR',
          control: 'Article 32',
          status: Math.random() > 0.7 ? 'non_compliant' : 'compliant',
          description: 'Implement appropriate technical measures to ensure data security',
          evidence:
            Math.random() > 0.7
              ? 'Missing encryption for data at rest'
              : 'Encryption properly implemented',
        },
        {
          standard: 'PCI-DSS',
          control: '6.5.10',
          status: Math.random() > 0.6 ? 'non_compliant' : 'compliant',
          description: 'Protect against injection flaws, particularly SQL injection',
          evidence:
            Math.random() > 0.6
              ? 'Potential SQL injection vulnerability found'
              : 'No SQL injection vulnerabilities found',
        },
        {
          standard: 'SOC2',
          control: 'CC6.1',
          status: Math.random() > 0.2 ? 'compliant' : 'non_compliant',
          description: 'Restrict logical access to authorized users',
          evidence:
            Math.random() > 0.2
              ? 'Proper authentication and authorization controls in place'
              : 'Weak authentication controls found',
        },
      ];
      break;

    case 'configuration':
      results.configurationIssues = Math.floor(Math.random() * 8);
      results.criticalMisconfigurations = Math.floor(Math.random() * 2);
      results.highMisconfigurations = Math.floor(Math.random() * 3);
      results.mediumMisconfigurations = Math.floor(Math.random() * 3);

      // Add some sample alerts
      if (results.criticalMisconfigurations > 0) {
        results.alerts.push({
          title: 'Insecure CORS Configuration',
          description: 'Your CORS configuration allows requests from any origin.',
          severity: 'critical',
          metadata: { currentConfig: '*', recommendation: 'Restrict to specific domains' },
        });
      }

      if (results.highMisconfigurations > 0) {
        results.alerts.push({
          title: 'Missing Content Security Policy',
          description: 'Your application does not have a Content Security Policy configured.',
          severity: 'high',
          metadata: { recommendation: 'Implement a strict CSP header' },
        });
      }
      break;

    case 'threat':
      results.threatDetections = Math.floor(Math.random() * 5);
      results.suspiciousActivities = Math.floor(Math.random() * 10);
      results.maliciousIPs = Math.floor(Math.random() * 3);

      // Add some sample alerts
      if (results.threatDetections > 0) {
        results.alerts.push({
          title: 'Suspicious Login Attempts',
          description: 'Multiple failed login attempts detected from unusual locations.',
          severity: 'high',
          metadata: {
            attempts: 12,
            locations: ['Unknown', 'Russia', 'China'],
            timeframe: '24 hours',
          },
        });
      }
      break;

    case 'full':
      // Combine all scan types
      results = {
        ...results,
        vulnerabilities: Math.floor(Math.random() * 10),
        configurationIssues: Math.floor(Math.random() * 8),
        complianceIssues: Math.floor(Math.random() * 10),
        threatDetections: Math.floor(Math.random() * 5),
      };

      // Add sample alerts and compliance checks
      results.alerts = [
        {
          title: 'Outdated Node.js Version',
          description: 'Your Node.js version is outdated and contains known vulnerabilities.',
          severity: 'medium',
          metadata: { currentVersion: '14.15.0', recommendedVersion: '18.16.0' },
        },
        {
          title: 'Insecure CORS Configuration',
          description: 'Your CORS configuration allows requests from any origin.',
          severity: 'high',
          metadata: { currentConfig: '*', recommendation: 'Restrict to specific domains' },
        },
      ];

      results.complianceChecks = [
        {
          standard: 'GDPR',
          control: 'Article 32',
          status: 'non_compliant',
          description: 'Implement appropriate technical measures to ensure data security',
          evidence: 'Missing encryption for data at rest',
        },
        {
          standard: 'PCI-DSS',
          control: '6.5.10',
          status: 'non_compliant',
          description: 'Protect against injection flaws, particularly SQL injection',
          evidence: 'Potential SQL injection vulnerability found in /api/users endpoint',
        },
        {
          standard: 'SOC2',
          control: 'CC6.1',
          status: 'compliant',
          description: 'Restrict logical access to authorized users',
          evidence: 'Proper authentication and authorization controls in place',
        },
      ];
      break;
  }

  return results;
}
