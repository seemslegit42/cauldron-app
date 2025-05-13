/**
 * Autogen Studio Service
 *
 * This service provides functions to manage the Autogen Studio server.
 */

import { useQuery, useAction } from 'wasp/client/operations';
import { checkAutogenStudioStatus as checkStatus, startAutogenStudioServer as startServer, stopAutogenStudioServer as stopServer } from 'wasp/client/operations';
import { LoggingService } from '@src/shared/services/logging';

// Default port for the Autogen Studio server
const DEFAULT_PORT = 8081;
const DEFAULT_HOST = 'localhost';
const SERVER_URL = `http://${DEFAULT_HOST}:${DEFAULT_PORT}`;

// Server status check interval in milliseconds
const STATUS_CHECK_INTERVAL = 1000;
const MAX_STATUS_CHECKS = 60; // Maximum number of status checks (60 seconds timeout)

/**
 * Check if the Autogen Studio server is running
 * @returns Promise with server status information
 */
export async function checkAutogenStudioStatus(): Promise<{ running: boolean; url: string | null }> {
  try {
    const result = await checkStatus({});
    return {
      running: result.running,
      url: result.running ? SERVER_URL : null
    };
  } catch (error) {
    LoggingService.error('Error checking Autogen Studio server status', { error });
    return { running: false, url: null };
  }
}

/**
 * Start the Autogen Studio server
 * @returns Promise with the result of starting the server
 */
export async function startAutogenStudioServer(): Promise<{
  success: boolean;
  url: string | null;
  error?: string
}> {
  try {
    // First check if the server is already running
    const status = await checkAutogenStudioStatus();
    if (status.running) {
      return { success: true, url: status.url };
    }

    // Start the server
    const result = await startServer({
      port: DEFAULT_PORT,
      host: DEFAULT_HOST
    });

    if (result.success) {
      // Wait for the server to start
      let checks = 0;
      while (checks < MAX_STATUS_CHECKS) {
        const status = await checkAutogenStudioStatus();
        if (status.running) {
          return { success: true, url: status.url };
        }

        // Wait before checking again
        await new Promise(resolve => setTimeout(resolve, STATUS_CHECK_INTERVAL));
        checks++;
      }

      return {
        success: false,
        url: null,
        error: 'Server started but did not become available within the timeout period'
      };
    } else {
      return {
        success: false,
        url: null,
        error: 'Failed to start Autogen Studio server'
      };
    }
  } catch (error) {
    LoggingService.error('Error starting Autogen Studio server', { error });
    return {
      success: false,
      url: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Stop the Autogen Studio server
 * @returns Promise with the result of stopping the server
 */
export async function stopAutogenStudioServer(): Promise<{
  success: boolean;
  error?: string
}> {
  try {
    const result = await stopServer({});
    return {
      success: result.success,
      error: result.message
    };
  } catch (error) {
    LoggingService.error('Error stopping Autogen Studio server', { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get the URL for the Autogen Studio server
 * @returns The URL for the Autogen Studio server
 */
export function getAutogenStudioUrl(): string {
  return SERVER_URL;
}

/**
 * React hooks for Autogen Studio
 */

/**
 * Hook to check the status of the Autogen Studio server
 */
export function useAutogenStudioStatus() {
  return useQuery(checkStatus, {});
}

/**
 * Hook to start the Autogen Studio server
 */
export function useStartAutogenStudioServer() {
  return useAction(startServer);
}

/**
 * Hook to stop the Autogen Studio server
 */
export function useStopAutogenStudioServer() {
  return useAction(stopServer);
}
