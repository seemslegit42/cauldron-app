/**
 * Log Archiving Service
 * 
 * This service provides functionality to archive logs to different storage providers
 * before they are deleted from the database. It supports local file storage,
 * AWS S3, and Azure Blob Storage.
 */

import * as fs from 'fs';
import * as path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { BlobServiceClient } from '@azure/storage-blob';
import { prisma } from 'wasp/server';
import { LoggingService } from './logging';

// Storage providers
export type StorageProvider = 'local' | 's3' | 'azure';

// Configuration for storage providers
interface StorageConfig {
  local: {
    directory: string;
  };
  s3: {
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  azure: {
    connectionString: string;
    containerName: string;
  };
}

// Default configuration
const defaultConfig: StorageConfig = {
  local: {
    directory: process.env.LOG_ARCHIVE_DIRECTORY || path.join(process.cwd(), 'log-archives'),
  },
  s3: {
    region: process.env.AWS_S3_REGION || '',
    bucket: process.env.AWS_S3_LOGS_BUCKET || process.env.AWS_S3_FILES_BUCKET || '',
    accessKeyId: process.env.AWS_S3_IAM_ACCESS_KEY || '',
    secretAccessKey: process.env.AWS_S3_IAM_SECRET_KEY || '',
  },
  azure: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
    containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || 'log-archives',
  },
};

/**
 * Log Archiving Service
 */
export class LogArchivingService {
  private static config: StorageConfig = defaultConfig;

  /**
   * Configure the archiving service
   */
  static configure(config: Partial<StorageConfig>) {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Archive system logs
   */
  static async archiveSystemLogs(
    startDate: Date,
    endDate: Date,
    provider: StorageProvider = 'local'
  ): Promise<string> {
    try {
      // Fetch logs to archive
      const logs = await prisma.systemLog.findMany({
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      if (logs.length === 0) {
        return 'No logs to archive';
      }

      // Create archive filename
      const archiveId = `system-logs-${startDate.toISOString().split('T')[0]}-to-${
        endDate.toISOString().split('T')[0]
      }`;
      const filename = `${archiveId}.json`;

      // Archive logs
      const archiveUrl = await this.archiveData(logs, filename, provider);

      // Log the archiving operation
      await LoggingService.logSystemEvent({
        message: `Archived ${logs.length} system logs to ${provider}`,
        level: 'INFO',
        category: 'DATA_ACCESS',
        source: 'log-archiving',
        tags: ['archive', 'system-logs', provider],
        metadata: {
          startDate,
          endDate,
          count: logs.length,
          archiveUrl,
          provider,
        },
      });

      return archiveUrl;
    } catch (error) {
      console.error('Error archiving system logs:', error);
      throw error;
    }
  }

  /**
   * Archive agent logs
   */
  static async archiveAgentLogs(
    startDate: Date,
    endDate: Date,
    provider: StorageProvider = 'local'
  ): Promise<string> {
    try {
      // Fetch logs to archive
      const logs = await prisma.agentLog.findMany({
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      if (logs.length === 0) {
        return 'No logs to archive';
      }

      // Create archive filename
      const archiveId = `agent-logs-${startDate.toISOString().split('T')[0]}-to-${
        endDate.toISOString().split('T')[0]
      }`;
      const filename = `${archiveId}.json`;

      // Archive logs
      const archiveUrl = await this.archiveData(logs, filename, provider);

      // Log the archiving operation
      await LoggingService.logSystemEvent({
        message: `Archived ${logs.length} agent logs to ${provider}`,
        level: 'INFO',
        category: 'DATA_ACCESS',
        source: 'log-archiving',
        tags: ['archive', 'agent-logs', provider],
        metadata: {
          startDate,
          endDate,
          count: logs.length,
          archiveUrl,
          provider,
        },
      });

      return archiveUrl;
    } catch (error) {
      console.error('Error archiving agent logs:', error);
      throw error;
    }
  }

  /**
   * Archive API interactions
   */
  static async archiveApiInteractions(
    startDate: Date,
    endDate: Date,
    provider: StorageProvider = 'local'
  ): Promise<string> {
    try {
      // Fetch logs to archive
      const logs = await prisma.apiInteraction.findMany({
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      if (logs.length === 0) {
        return 'No logs to archive';
      }

      // Create archive filename
      const archiveId = `api-interactions-${startDate.toISOString().split('T')[0]}-to-${
        endDate.toISOString().split('T')[0]
      }`;
      const filename = `${archiveId}.json`;

      // Archive logs
      const archiveUrl = await this.archiveData(logs, filename, provider);

      // Log the archiving operation
      await LoggingService.logSystemEvent({
        message: `Archived ${logs.length} API interactions to ${provider}`,
        level: 'INFO',
        category: 'DATA_ACCESS',
        source: 'log-archiving',
        tags: ['archive', 'api-interactions', provider],
        metadata: {
          startDate,
          endDate,
          count: logs.length,
          archiveUrl,
          provider,
        },
      });

      return archiveUrl;
    } catch (error) {
      console.error('Error archiving API interactions:', error);
      throw error;
    }
  }

  /**
   * Archive human approvals
   */
  static async archiveHumanApprovals(
    startDate: Date,
    endDate: Date,
    provider: StorageProvider = 'local'
  ): Promise<string> {
    try {
      // Fetch logs to archive
      const logs = await prisma.humanApproval.findMany({
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      if (logs.length === 0) {
        return 'No logs to archive';
      }

      // Create archive filename
      const archiveId = `human-approvals-${startDate.toISOString().split('T')[0]}-to-${
        endDate.toISOString().split('T')[0]
      }`;
      const filename = `${archiveId}.json`;

      // Archive logs
      const archiveUrl = await this.archiveData(logs, filename, provider);

      // Log the archiving operation
      await LoggingService.logSystemEvent({
        message: `Archived ${logs.length} human approvals to ${provider}`,
        level: 'INFO',
        category: 'DATA_ACCESS',
        source: 'log-archiving',
        tags: ['archive', 'human-approvals', provider],
        metadata: {
          startDate,
          endDate,
          count: logs.length,
          archiveUrl,
          provider,
        },
      });

      return archiveUrl;
    } catch (error) {
      console.error('Error archiving human approvals:', error);
      throw error;
    }
  }

  /**
   * Archive data to the specified provider
   */
  private static async archiveData(
    data: any[],
    filename: string,
    provider: StorageProvider
  ): Promise<string> {
    const jsonData = JSON.stringify(data, null, 2);

    switch (provider) {
      case 'local':
        return this.archiveToLocalFile(jsonData, filename);
      case 's3':
        return this.archiveToS3(jsonData, filename);
      case 'azure':
        return this.archiveToAzure(jsonData, filename);
      default:
        throw new Error(`Unsupported storage provider: ${provider}`);
    }
  }

  /**
   * Archive data to a local file
   */
  private static async archiveToLocalFile(data: string, filename: string): Promise<string> {
    const directory = this.config.local.directory;

    // Create directory if it doesn't exist
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    const filePath = path.join(directory, filename);
    fs.writeFileSync(filePath, data);

    return `file://${filePath}`;
  }

  /**
   * Archive data to AWS S3
   */
  private static async archiveToS3(data: string, filename: string): Promise<string> {
    const { region, bucket, accessKeyId, secretAccessKey } = this.config.s3;

    if (!region || !bucket || !accessKeyId || !secretAccessKey) {
      throw new Error('S3 configuration is incomplete');
    }

    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const key = `log-archives/${filename}`;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: data,
      ContentType: 'application/json',
    });

    await s3Client.send(command);

    return `s3://${bucket}/${key}`;
  }

  /**
   * Archive data to Azure Blob Storage
   */
  private static async archiveToAzure(data: string, filename: string): Promise<string> {
    const { connectionString, containerName } = this.config.azure;

    if (!connectionString) {
      throw new Error('Azure Blob Storage connection string is not configured');
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Create container if it doesn't exist
    await containerClient.createIfNotExists();

    const blobName = `log-archives/${filename}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.upload(data, data.length);

    return `azure://${containerName}/${blobName}`;
  }
}
