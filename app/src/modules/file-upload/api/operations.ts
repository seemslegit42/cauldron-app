import * as z from 'zod';
import { HttpError } from 'wasp/server';
import { type File } from 'wasp/entities';
import {
  type CreateFile,
  type GetAllFilesByUser,
  type GetDownloadFileSignedURL,
} from 'wasp/server/operations';

import { getUploadFileSignedURLFromS3, getDownloadFileSignedURLFromS3 } from '../utils/s3Utils';
import { ensureArgsSchemaOrThrowHttpError } from '../../../server/validation';
import { ALLOWED_FILE_TYPES } from '../utils/validation';
import { requirePermission } from '../../../api/middleware/rbac';
import { applyFieldAccess } from '../../../api/middleware/fieldAccess';

const createFileInputSchema = z.object({
  fileType: z.enum(ALLOWED_FILE_TYPES),
  fileName: z.string().nonempty(),
});

type CreateFileInput = z.infer<typeof createFileInputSchema>;

export const createFile: CreateFile<
  CreateFileInput,
  {
    s3UploadUrl: string;
    s3UploadFields: Record<string, string>;
  }
> = async (rawArgs, context) => {
  // Apply RBAC middleware - require 'files:create' permission
  const user = await requirePermission({
    resource: 'files',
    action: 'create',
    adminOverride: true,
    auditRejection: true,
  })(context);

  const { fileType, fileName } = ensureArgsSchemaOrThrowHttpError(createFileInputSchema, rawArgs);

  const { s3UploadUrl, s3UploadFields, key } = await getUploadFileSignedURLFromS3({
    fileType,
    fileName,
    userId: user.id,
  });

  await context.entities.File.create({
    data: {
      name: fileName,
      key,
      uploadUrl: s3UploadUrl,
      type: fileType,
      user: { connect: { id: user.id } },
    },
  });

  return {
    s3UploadUrl,
    s3UploadFields,
  };
};

export const getAllFilesByUser: GetAllFilesByUser<void, File[]> = async (_args, context) => {
  // Apply RBAC middleware - require 'files:read' permission
  const user = await requirePermission({
    resource: 'files',
    action: 'read',
    adminOverride: true,
    auditRejection: true,
  })(context);

  // For non-admin users, only return their own files
  const whereClause = user.isAdmin
    ? {}
    : {
        user: {
          id: user.id,
        },
      };

  const files = await context.entities.File.findMany({
    where: whereClause,
    orderBy: {
      createdAt: 'desc',
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

  // Apply field-level access control
  const filteredFiles = [];
  for (const file of files) {
    // If user is not admin and not the owner, apply stricter field visibility
    const action = user.isAdmin || file.user.id === user.id ? 'read' : 'read_limited';
    const filteredFile = await applyFieldAccess(file, user, 'files', action);
    filteredFiles.push(filteredFile);
  }

  return filteredFiles;
};

const getDownloadFileSignedURLInputSchema = z.object({ key: z.string().nonempty() });

type GetDownloadFileSignedURLInput = z.infer<typeof getDownloadFileSignedURLInputSchema>;

export const getDownloadFileSignedURL: GetDownloadFileSignedURL<
  GetDownloadFileSignedURLInput,
  string
> = async (rawArgs, context) => {
  // Apply RBAC middleware - require 'files:download' permission
  const user = await requirePermission({
    resource: 'files',
    action: 'download',
    adminOverride: true,
    auditRejection: true,
  })(context);

  const { key } = ensureArgsSchemaOrThrowHttpError(getDownloadFileSignedURLInputSchema, rawArgs);

  // Check if the file exists and if the user has permission to download it
  const file = await context.entities.File.findFirst({
    where: { key },
    include: { user: { select: { id: true } } },
  });

  if (!file) {
    throw new HttpError(404, 'File not found');
  }

  // If user is not an admin and not the owner, check if they have explicit permission
  if (!user.isAdmin && file.user.id !== user.id) {
    const hasExplicitPermission = await requirePermission({
      resource: 'files',
      action: 'download_any',
      adminOverride: false,
      auditRejection: true,
    })(context).catch(() => false);

    if (!hasExplicitPermission) {
      throw new HttpError(403, 'You do not have permission to download this file');
    }
  }

  return await getDownloadFileSignedURLFromS3({ key });
};
