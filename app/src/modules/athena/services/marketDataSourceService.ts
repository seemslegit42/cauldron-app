/**
 * Market Data Source Service
 * 
 * This service provides functions for managing market data sources.
 */

import { prisma } from 'wasp/server';
import { LoggingService } from '@src/shared/services/logging';
import { z } from 'zod';
import { HttpError } from 'wasp/server';

// Schema for creating a market data source
const createMarketDataSourceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['financial', 'industry', 'competitor', 'news', 'social', 'api']),
  url: z.string().url().optional(),
  apiKey: z.string().optional(),
  refreshInterval: z.number().int().min(5).default(60), // in minutes
  configuration: z.record(z.any()).optional(),
});

// Schema for updating a market data source
const updateMarketDataSourceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  type: z.enum(['financial', 'industry', 'competitor', 'news', 'social', 'api']).optional(),
  url: z.string().url().optional(),
  apiKey: z.string().optional(),
  refreshInterval: z.number().int().min(5).optional(),
  isActive: z.boolean().optional(),
  configuration: z.record(z.any()).optional(),
});

/**
 * Creates a new market data source
 */
export async function createMarketDataSource(args: unknown): Promise<any> {
  try {
    const validatedArgs = createMarketDataSourceSchema.parse(args);
    
    // Create the market data source
    const marketDataSource = await prisma.marketDataSource.create({
      data: {
        name: validatedArgs.name,
        description: validatedArgs.description,
        type: validatedArgs.type,
        url: validatedArgs.url,
        apiKey: validatedArgs.apiKey,
        refreshInterval: validatedArgs.refreshInterval,
        configuration: validatedArgs.configuration || {},
      },
    });
    
    // Log the operation
    LoggingService.info({
      message: `Created market data source: ${marketDataSource.name}`,
      module: 'athena',
      category: 'MARKET_DATA_SOURCE',
      metadata: {
        sourceId: marketDataSource.id,
        sourceName: marketDataSource.name,
        sourceType: marketDataSource.type,
      },
    });
    
    return marketDataSource;
  } catch (error) {
    console.error('Error creating market data source:', error);
    LoggingService.error({
      message: 'Error creating market data source',
      module: 'athena',
      category: 'MARKET_DATA_SOURCE',
      error: error as Error,
    });
    
    if (error instanceof z.ZodError) {
      throw new HttpError(400, 'Invalid market data source data: ' + error.message);
    }
    
    throw new HttpError(500, 'Failed to create market data source');
  }
}

/**
 * Updates an existing market data source
 */
export async function updateMarketDataSource(args: unknown): Promise<any> {
  try {
    const validatedArgs = updateMarketDataSourceSchema.parse(args);
    
    // Check if the market data source exists
    const existingSource = await prisma.marketDataSource.findUnique({
      where: { id: validatedArgs.id },
    });
    
    if (!existingSource) {
      throw new HttpError(404, 'Market data source not found');
    }
    
    // Update the market data source
    const marketDataSource = await prisma.marketDataSource.update({
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
    
    // Log the operation
    LoggingService.info({
      message: `Updated market data source: ${marketDataSource.name}`,
      module: 'athena',
      category: 'MARKET_DATA_SOURCE',
      metadata: {
        sourceId: marketDataSource.id,
        sourceName: marketDataSource.name,
        sourceType: marketDataSource.type,
      },
    });
    
    return marketDataSource;
  } catch (error) {
    console.error('Error updating market data source:', error);
    LoggingService.error({
      message: 'Error updating market data source',
      module: 'athena',
      category: 'MARKET_DATA_SOURCE',
      error: error as Error,
    });
    
    if (error instanceof z.ZodError) {
      throw new HttpError(400, 'Invalid market data source data: ' + error.message);
    }
    
    throw new HttpError(500, 'Failed to update market data source');
  }
}

/**
 * Deletes a market data source
 */
export async function deleteMarketDataSource(args: { id: string }): Promise<any> {
  try {
    // Check if the market data source exists
    const existingSource = await prisma.marketDataSource.findUnique({
      where: { id: args.id },
    });
    
    if (!existingSource) {
      throw new HttpError(404, 'Market data source not found');
    }
    
    // Delete all data points associated with this source
    await prisma.dataPoint.deleteMany({
      where: { sourceId: args.id },
    });
    
    // Delete the market data source
    await prisma.marketDataSource.delete({
      where: { id: args.id },
    });
    
    // Log the operation
    LoggingService.info({
      message: `Deleted market data source: ${existingSource.name}`,
      module: 'athena',
      category: 'MARKET_DATA_SOURCE',
      metadata: {
        sourceId: existingSource.id,
        sourceName: existingSource.name,
        sourceType: existingSource.type,
      },
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting market data source:', error);
    LoggingService.error({
      message: 'Error deleting market data source',
      module: 'athena',
      category: 'MARKET_DATA_SOURCE',
      error: error as Error,
    });
    
    throw new HttpError(500, 'Failed to delete market data source');
  }
}

/**
 * Gets all market data sources
 */
export async function getMarketDataSources(): Promise<any[]> {
  try {
    const sources = await prisma.marketDataSource.findMany({
      orderBy: { name: 'asc' },
    });
    
    return sources;
  } catch (error) {
    console.error('Error getting market data sources:', error);
    LoggingService.error({
      message: 'Error getting market data sources',
      module: 'athena',
      category: 'MARKET_DATA_SOURCE',
      error: error as Error,
    });
    
    throw new HttpError(500, 'Failed to get market data sources');
  }
}

/**
 * Gets a market data source by ID
 */
export async function getMarketDataSourceById(args: { id: string }): Promise<any> {
  try {
    const source = await prisma.marketDataSource.findUnique({
      where: { id: args.id },
      include: {
        dataPoints: {
          orderBy: { date: 'desc' },
          take: 100,
        },
      },
    });
    
    if (!source) {
      throw new HttpError(404, 'Market data source not found');
    }
    
    return source;
  } catch (error) {
    console.error('Error getting market data source:', error);
    LoggingService.error({
      message: 'Error getting market data source',
      module: 'athena',
      category: 'MARKET_DATA_SOURCE',
      error: error as Error,
    });
    
    throw new HttpError(500, 'Failed to get market data source');
  }
}

/**
 * Refreshes data from a market data source
 */
export async function refreshMarketDataSource(args: { id: string, userId: string }): Promise<any> {
  try {
    // Check if the market data source exists
    const source = await prisma.marketDataSource.findUnique({
      where: { id: args.id },
    });
    
    if (!source) {
      throw new HttpError(404, 'Market data source not found');
    }
    
    // Import the market data service dynamically to avoid circular dependencies
    const { fetchMarketDataFromSource } = await import('./marketDataService');
    
    // Fetch data from the source
    const marketData = await fetchMarketDataFromSource(source, args.userId);
    
    // Log the operation
    LoggingService.info({
      message: `Refreshed market data source: ${source.name}`,
      userId: args.userId,
      module: 'athena',
      category: 'MARKET_DATA_SOURCE',
      metadata: {
        sourceId: source.id,
        sourceName: source.name,
        sourceType: source.type,
        dataCount: marketData.length,
      },
    });
    
    return { success: true, dataCount: marketData.length };
  } catch (error) {
    console.error('Error refreshing market data source:', error);
    LoggingService.error({
      message: 'Error refreshing market data source',
      userId: args.userId,
      module: 'athena',
      category: 'MARKET_DATA_SOURCE',
      error: error as Error,
    });
    
    throw new HttpError(500, 'Failed to refresh market data source');
  }
}
