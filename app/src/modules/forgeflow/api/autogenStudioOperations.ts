/**
 * Autogen Studio API Operations
 * 
 * This file provides API operations for managing the Autogen Studio server.
 */

import { HttpError } from 'wasp/server';
import { z } from 'zod';
import { ensureArgsSchemaOrThrowHttpError } from '@src/server/validation';
import { LoggingService } from '@src/shared/services/logging';
import { requirePermission } from '@src/api/middleware/rbac';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Store the server process
let autogenStudioProcess: ChildProcess | null = null;

// Schema for start server request
const startServerArgsSchema = z.object({
  port: z.number().optional().default(8081),
  host: z.string().optional().default('127.0.0.1'),
});

/**
 * Start the Autogen Studio server
 */
export const startAutogenStudioServer = async (args: any, context: any) => {
  // Ensure user has permission to start the server
  requirePermission(context.user, 'forgeflow:manage');

  // Validate arguments
  const { port, host } = ensureArgsSchemaOrThrowHttpError(startServerArgsSchema, args);

  try {
    // Check if server is already running
    if (autogenStudioProcess !== null) {
      return {
        success: true,
        message: 'Autogen Studio server is already running',
        url: `http://${host}:${port}`
      };
    }

    // Get the path to the Autogen Studio directory
    const moduleDir = path.resolve(process.cwd(), 'src/modules/forgeflow/autogen/autogen-studio');
    
    // Check if the directory exists
    if (!fs.existsSync(moduleDir)) {
      throw new HttpError(500, 'Autogen Studio directory not found');
    }

    // Create app directory if it doesn't exist
    const appDir = path.resolve(moduleDir, '.autogenstudio');
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir, { recursive: true });
    }

    // Start the Autogen Studio server
    LoggingService.info('Starting Autogen Studio server', { port, host, moduleDir });
    
    // Use Python to start the server
    autogenStudioProcess = spawn('python', [
      '-m',
      'autogenstudio',
      'ui',
      '--host',
      host,
      '--port',
      port.toString(),
      '--appdir',
      appDir
    ], {
      cwd: moduleDir,
      env: {
        ...process.env,
        PYTHONPATH: moduleDir
      }
    });

    // Log stdout and stderr
    autogenStudioProcess.stdout?.on('data', (data) => {
      LoggingService.debug(`Autogen Studio stdout: ${data}`);
    });

    autogenStudioProcess.stderr?.on('data', (data) => {
      LoggingService.debug(`Autogen Studio stderr: ${data}`);
    });

    // Handle process exit
    autogenStudioProcess.on('close', (code) => {
      LoggingService.info(`Autogen Studio server exited with code ${code}`);
      autogenStudioProcess = null;
    });

    return {
      success: true,
      message: 'Autogen Studio server started',
      url: `http://${host}:${port}`
    };
  } catch (error) {
    LoggingService.error('Error starting Autogen Studio server', { error });
    throw new HttpError(500, `Failed to start Autogen Studio server: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Stop the Autogen Studio server
 */
export const stopAutogenStudioServer = async (_args: any, context: any) => {
  // Ensure user has permission to stop the server
  requirePermission(context.user, 'forgeflow:manage');

  try {
    // Check if server is running
    if (autogenStudioProcess === null) {
      return {
        success: true,
        message: 'Autogen Studio server is not running'
      };
    }

    // Kill the server process
    LoggingService.info('Stopping Autogen Studio server');
    autogenStudioProcess.kill();
    autogenStudioProcess = null;

    return {
      success: true,
      message: 'Autogen Studio server stopped'
    };
  } catch (error) {
    LoggingService.error('Error stopping Autogen Studio server', { error });
    throw new HttpError(500, `Failed to stop Autogen Studio server: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Check the status of the Autogen Studio server
 */
export const checkAutogenStudioStatus = async (_args: any, context: any) => {
  // Ensure user has permission to check server status
  requirePermission(context.user, 'forgeflow:view');

  return {
    running: autogenStudioProcess !== null,
    message: autogenStudioProcess !== null 
      ? 'Autogen Studio server is running' 
      : 'Autogen Studio server is not running'
  };
};
