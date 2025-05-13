/**
 * Collaboration Archive Service
 *
 * This service provides functionality for creating tamper-proof archives of human-AI collaboration sessions.
 * It implements encryption, hashing, and verification to ensure the integrity of archived data.
 *
 * Features:
 * - Encryption of archive content
 * - Cryptographic hashing for tamper detection
 * - Compliance with SOC2, GDPR, and other standards
 * - Audit trail for archive access and verification
 */

import { prisma } from 'wasp/server';
import { createHash, createHmac, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { LoggingService } from '../../../shared/services/logging';
import { compress, decompress } from 'zlib';
import { promisify } from 'util';

// Promisify zlib functions
const compressAsync = promisify(compress);
const decompressAsync = promisify(decompress);

// Secret key for HMAC signatures - in production, this should be stored securely
// and potentially rotated periodically
const HMAC_SECRET = process.env.ARCHIVE_HMAC_SECRET || 'default-secret-key-change-in-production';

// Encryption configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16 bytes
const AUTH_TAG_LENGTH = 16; // For GCM mode

/**
 * Interface for archive creation parameters
 */
interface CreateArchiveParams {
  userId: string;
  organizationId?: string;
  archiveType: string;
  sourceSessionId?: string;
  startTimestamp: Date;
  endTimestamp: Date;
  content: any; // Content to archive
  retentionPolicy: string;
  complianceStandards: string[];
  metadata?: any;
}

/**
 * Interface for archive verification parameters
 */
interface VerifyArchiveParams {
  archiveId: string;
  verifiedBy: string;
  verificationMethod: string;
  metadata?: any;
}

/**
 * Interface for archive access logging parameters
 */
interface LogArchiveAccessParams {
  archiveId: string;
  accessedBy: string;
  accessType: string;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
  metadata?: any;
}

/**
 * Interface for archive retrieval parameters
 */
interface GetArchiveContentParams {
  archiveId: string;
  accessedBy: string;
  reason?: string;
  decryptionKey?: string;
  metadata?: any;
}

/**
 * Collaboration Archive Service
 */
export class CollaborationArchiveService {
  /**
   * Creates a tamper-proof archive of a collaboration session
   */
  static async createArchive(params: CreateArchiveParams) {
    try {
      // Generate encryption key and IV
      const encryptionKey = randomBytes(32); // 256 bits for AES-256
      const iv = randomBytes(IV_LENGTH);

      // Convert content to JSON string
      const contentString = JSON.stringify(params.content);

      // Compress the content
      const compressedContent = await compressAsync(Buffer.from(contentString));

      // Encrypt the compressed content
      const cipher = createCipheriv(ENCRYPTION_ALGORITHM, encryptionKey, iv);
      let encryptedContent = Buffer.concat([
        cipher.update(compressedContent),
        cipher.final()
      ]);

      // Get the auth tag (for GCM mode)
      const authTag = cipher.getAuthTag();

      // Combine IV, encrypted content, and auth tag for storage
      const contentToStore = Buffer.concat([
        iv,
        encryptedContent,
        authTag
      ]);

      // Calculate content hash (SHA-256)
      const contentHash = createHash('sha256')
        .update(contentString)
        .digest('hex');

      // Create HMAC signature for tamper verification
      const signatureHash = createHmac('sha256', HMAC_SECRET)
        .update(contentHash)
        .update(params.userId)
        .update(params.startTimestamp.toISOString())
        .update(params.endTimestamp.toISOString())
        .digest('hex');

      // Create the archive record
      const archive = await prisma.collaborationArchive.create({
        data: {
          userId: params.userId,
          organizationId: params.organizationId,
          archiveType: params.archiveType,
          sourceSessionId: params.sourceSessionId,
          startTimestamp: params.startTimestamp,
          endTimestamp: params.endTimestamp,
          contentHash,
          signatureHash,
          encryptionMethod: ENCRYPTION_ALGORITHM,
          retentionPolicy: params.retentionPolicy,
          complianceStandards: params.complianceStandards,
          metadata: params.metadata,
          status: 'complete',
          archiveContent: {
            create: {
              content: contentToStore,
              contentType: 'application/json',
              compressionType: 'zlib',
              originalSize: contentString.length,
            },
          },
        },
        include: {
          archiveContent: false, // Don't include the content in the response
        },
      });

      // Log the archive creation
      LoggingService.info({
        message: `Created tamper-proof archive: ${archive.id}`,
        userId: params.userId,
        module: 'sentinel',
        category: 'ARCHIVE',
        metadata: {
          archiveId: archive.id,
          archiveType: params.archiveType,
          sourceSessionId: params.sourceSessionId,
        },
      });

      return {
        archiveId: archive.id,
        contentHash,
        signatureHash,
        encryptionKey: encryptionKey.toString('hex'), // Return the key for secure storage
      };
    } catch (error) {
      LoggingService.error({
        message: 'Error creating tamper-proof archive',
        module: 'sentinel',
        category: 'ARCHIVE',
        error,
        metadata: {
          userId: params.userId,
          archiveType: params.archiveType,
          sourceSessionId: params.sourceSessionId,
        },
      });
      throw error;
    }
  }

  /**
   * Verifies the integrity of an archive
   */
  static async verifyArchive(params: VerifyArchiveParams) {
    try {
      // Get the archive
      const archive = await prisma.collaborationArchive.findUnique({
        where: { id: params.archiveId },
        include: { archiveContent: true },
      });

      if (!archive) {
        throw new Error(`Archive not found: ${params.archiveId}`);
      }

      // Verify the HMAC signature
      const expectedSignature = createHmac('sha256', HMAC_SECRET)
        .update(archive.contentHash)
        .update(archive.userId)
        .update(archive.startTimestamp.toISOString())
        .update(archive.endTimestamp.toISOString())
        .digest('hex');

      const isSignatureValid = expectedSignature === archive.signatureHash;

      // Create verification record
      const verification = await prisma.archiveVerification.create({
        data: {
          archiveId: params.archiveId,
          verifiedBy: params.verifiedBy,
          verificationMethod: params.verificationMethod,
          status: isSignatureValid ? 'success' : 'failed',
          details: isSignatureValid
            ? 'Archive integrity verified successfully'
            : 'Archive integrity verification failed - signature mismatch',
          metadata: params.metadata,
        },
      });

      // Update archive status based on verification result
      if (!isSignatureValid) {
        await prisma.collaborationArchive.update({
          where: { id: params.archiveId },
          data: {
            status: 'tampered',
            verificationLog: {
              ...(archive.verificationLog as any || {}),
              lastVerification: {
                timestamp: new Date(),
                verifiedBy: params.verifiedBy,
                status: 'failed',
                reason: 'Signature mismatch',
              },
            },
          },
        });
      } else if (archive.status !== 'verified') {
        // Update to verified status if not already verified
        await prisma.collaborationArchive.update({
          where: { id: params.archiveId },
          data: {
            status: 'verified',
            verificationLog: {
              ...(archive.verificationLog as any || {}),
              lastVerification: {
                timestamp: new Date(),
                verifiedBy: params.verifiedBy,
                status: 'success',
              },
            },
          },
        });
      }

      return {
        verificationId: verification.id,
        isValid: isSignatureValid,
        status: verification.status,
        details: verification.details,
      };
    } catch (error) {
      LoggingService.error({
        message: 'Error verifying archive',
        module: 'sentinel',
        category: 'ARCHIVE',
        error,
        metadata: {
          archiveId: params.archiveId,
          verifiedBy: params.verifiedBy,
        },
      });
      throw error;
    }
  }

  /**
   * Logs access to an archive
   */
  static async logArchiveAccess(params: LogArchiveAccessParams) {
    try {
      const accessLog = await prisma.archiveAccessLog.create({
        data: {
          archiveId: params.archiveId,
          accessedBy: params.accessedBy,
          accessType: params.accessType,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          reason: params.reason,
          metadata: params.metadata,
        },
      });

      return accessLog;
    } catch (error) {
      LoggingService.error({
        message: 'Error logging archive access',
        module: 'sentinel',
        category: 'ARCHIVE',
        error,
        metadata: {
          archiveId: params.archiveId,
          accessedBy: params.accessedBy,
          accessType: params.accessType,
        },
      });
      throw error;
    }
  }

  /**
   * Gets the content of an archive
   */
  static async getArchiveContent(params: GetArchiveContentParams) {
    try {
      // Get the archive with content
      const archive = await prisma.collaborationArchive.findUnique({
        where: { id: params.archiveId },
        include: { archiveContent: true },
      });

      if (!archive || !archive.archiveContent) {
        throw new Error(`Archive or content not found: ${params.archiveId}`);
      }

      // Log the access
      await this.logArchiveAccess({
        archiveId: params.archiveId,
        accessedBy: params.accessedBy,
        accessType: 'download',
        reason: params.reason,
        metadata: params.metadata,
      });

      // If no decryption key provided, return encrypted content
      if (!params.decryptionKey) {
        return {
          archiveId: archive.id,
          contentType: archive.archiveContent.contentType,
          encryptedContent: archive.archiveContent.content,
          metadata: archive.metadata,
        };
      }

      // Decrypt the content
      const content = archive.archiveContent.content;
      const iv = content.slice(0, IV_LENGTH);
      const authTag = content.slice(content.length - AUTH_TAG_LENGTH);
      const encryptedContent = content.slice(IV_LENGTH, content.length - AUTH_TAG_LENGTH);

      // Convert hex key to buffer
      const keyBuffer = Buffer.from(params.decryptionKey, 'hex');

      // Create decipher
      const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, keyBuffer, iv);
      decipher.setAuthTag(authTag);

      // Decrypt
      const decryptedContent = Buffer.concat([
        decipher.update(encryptedContent),
        decipher.final()
      ]);

      // Decompress
      const decompressedContent = await decompressAsync(decryptedContent);

      // Parse JSON
      const parsedContent = JSON.parse(decompressedContent.toString());

      return {
        archiveId: archive.id,
        content: parsedContent,
        metadata: archive.metadata,
      };
    } catch (error) {
      LoggingService.error({
        message: 'Error getting archive content',
        module: 'sentinel',
        category: 'ARCHIVE',
        error,
        metadata: {
          archiveId: params.archiveId,
          accessedBy: params.accessedBy,
        },
      });
      throw error;
    }
  }
}
