/**
 * Market Data Service
 * 
 * This service provides functions for fetching, processing, and storing market data
 * from various external sources.
 */

import { prisma } from 'wasp/server';
import { LoggingService } from '@src/shared/services/logging';
import { MarketData, ImpactLevel, ConfidenceLevel } from '../types';
import axios from 'axios';
import { z } from 'zod';

// Schema for market data source configuration
const marketDataSourceSchema = z.object({
  apiKey: z.string().optional(),
  endpoint: z.string().optional(),
  params: z.record(z.string(), z.any()).optional(),
  headers: z.record(z.string(), z.string()).optional(),
  dataPath: z.string().optional(),
  mappings: z.record(z.string(), z.string()).optional(),
});

type MarketDataSourceConfig = z.infer<typeof marketDataSourceSchema>;

/**
 * Fetches market data from all active sources
 */
export async function fetchAllMarketData(userId: string): Promise<MarketData[]> {
  try {
    // Log the operation
    LoggingService.info({
      message: 'Fetching market data from all sources',
      userId,
      module: 'athena',
      category: 'MARKET_DATA',
    });

    // Get all active market data sources
    const sources = await prisma.marketDataSource.findMany({
      where: {
        isActive: true,
      },
    });

    if (sources.length === 0) {
      LoggingService.info({
        message: 'No active market data sources found',
        userId,
        module: 'athena',
        category: 'MARKET_DATA',
      });
      return [];
    }

    // Fetch data from each source
    const allMarketData: MarketData[] = [];
    
    for (const source of sources) {
      try {
        const sourceData = await fetchMarketDataFromSource(source, userId);
        allMarketData.push(...sourceData);
      } catch (error) {
        LoggingService.error({
          message: `Error fetching data from source ${source.name}`,
          userId,
          module: 'athena',
          category: 'MARKET_DATA',
          error: error as Error,
          metadata: {
            sourceId: source.id,
            sourceName: source.name,
            sourceType: source.type,
          },
        });
      }
    }

    return allMarketData;
  } catch (error) {
    console.error('Error fetching all market data:', error);
    LoggingService.error({
      message: 'Error fetching all market data',
      userId,
      module: 'athena',
      category: 'MARKET_DATA',
      error: error as Error,
    });
    return [];
  }
}

/**
 * Fetches market data from a specific source
 */
async function fetchMarketDataFromSource(
  source: any,
  userId: string
): Promise<MarketData[]> {
  try {
    // Parse the source configuration
    const config = marketDataSourceSchema.parse(source.configuration || {});
    
    // Update the last refreshed timestamp
    await prisma.marketDataSource.update({
      where: { id: source.id },
      data: { lastRefreshed: new Date() },
    });

    // Fetch data based on source type
    switch (source.type) {
      case 'financial':
        return await fetchFinancialData(source, config, userId);
      case 'industry':
        return await fetchIndustryData(source, config, userId);
      case 'competitor':
        return await fetchCompetitorData(source, config, userId);
      case 'news':
        return await fetchNewsData(source, config, userId);
      case 'social':
        return await fetchSocialData(source, config, userId);
      case 'api':
        return await fetchApiData(source, config, userId);
      default:
        LoggingService.warn({
          message: `Unknown market data source type: ${source.type}`,
          userId,
          module: 'athena',
          category: 'MARKET_DATA',
          metadata: {
            sourceId: source.id,
            sourceName: source.name,
          },
        });
        return [];
    }
  } catch (error) {
    console.error(`Error fetching data from source ${source.name}:`, error);
    LoggingService.error({
      message: `Error fetching data from source ${source.name}`,
      userId,
      module: 'athena',
      category: 'MARKET_DATA',
      error: error as Error,
      metadata: {
        sourceId: source.id,
        sourceName: source.name,
        sourceType: source.type,
      },
    });
    return [];
  }
}

/**
 * Fetches financial market data
 */
async function fetchFinancialData(
  source: any,
  config: MarketDataSourceConfig,
  userId: string
): Promise<MarketData[]> {
  try {
    // Example: Fetch financial data from Alpha Vantage API
    const apiKey = config.apiKey || process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      throw new Error('API key not found for Alpha Vantage');
    }

    const endpoint = config.endpoint || 'https://www.alphavantage.co/query';
    const params = config.params || {
      function: 'GLOBAL_QUOTE',
      symbol: 'MSFT', // Default to Microsoft
    };

    const response = await axios.get(endpoint, {
      params: {
        ...params,
        apikey: apiKey,
      },
    });

    // Process the response
    const data = response.data;
    const quote = data['Global Quote'];
    
    if (!quote) {
      throw new Error('No quote data found in response');
    }

    // Store the data point
    await prisma.dataPoint.create({
      data: {
        sourceId: source.id,
        name: `${params.symbol}_price`,
        value: parseFloat(quote['05. price']),
        date: new Date(),
        metadata: quote,
      },
    });

    // Create market data object
    const marketData: MarketData = {
      id: `market-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: `${params.symbol} Stock Price`,
      category: 'financial',
      value: parseFloat(quote['05. price']),
      source: 'Alpha Vantage',
      date: new Date(),
      trend: parseFloat(quote['10. change percent'].replace('%', '')),
      impact: ImpactLevel.MEDIUM,
      relevance: ConfidenceLevel.HIGH,
      description: `Current stock price for ${params.symbol}`,
      metadata: {
        symbol: params.symbol,
        volume: quote['06. volume'],
        previousClose: quote['08. previous close'],
        change: quote['09. change'],
      },
    };

    // Save to database
    await prisma.marketData.create({
      data: {
        ...marketData,
        userId,
      },
    });

    return [marketData];
  } catch (error) {
    console.error('Error fetching financial data:', error);
    LoggingService.error({
      message: 'Error fetching financial data',
      userId,
      module: 'athena',
      category: 'MARKET_DATA',
      error: error as Error,
      metadata: {
        sourceId: source.id,
        sourceName: source.name,
      },
    });
    return [];
  }
}

/**
 * Fetches industry market data
 */
async function fetchIndustryData(
  source: any,
  config: MarketDataSourceConfig,
  userId: string
): Promise<MarketData[]> {
  // Implementation for industry data
  // This would typically connect to industry-specific APIs or databases
  
  // For now, return sample data
  const marketData: MarketData = {
    id: `market-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name: 'Industry Growth Rate',
    category: 'industry',
    value: 7.2,
    source: 'Industry Reports',
    date: new Date(),
    trend: 0.5,
    impact: ImpactLevel.MEDIUM,
    relevance: ConfidenceLevel.HIGH,
    description: 'Annual growth rate for the industry sector',
    metadata: {
      region: 'Global',
      segment: 'SaaS',
    },
  };

  // Save to database
  await prisma.marketData.create({
    data: {
      ...marketData,
      userId,
    },
  });

  return [marketData];
}

/**
 * Fetches competitor market data
 */
async function fetchCompetitorData(
  source: any,
  config: MarketDataSourceConfig,
  userId: string
): Promise<MarketData[]> {
  // Implementation for competitor data
  // This would typically connect to competitor intelligence APIs
  
  // For now, return sample data
  const marketData: MarketData = {
    id: `market-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name: 'Competitor Pricing',
    category: 'competitor',
    value: 89,
    source: 'Competitive Analysis',
    date: new Date(),
    trend: -2.1,
    impact: ImpactLevel.HIGH,
    relevance: ConfidenceLevel.MEDIUM,
    description: 'Average competitor pricing for similar products',
    metadata: {
      unit: 'USD/month',
      sample_size: 12,
    },
  };

  // Save to database
  await prisma.marketData.create({
    data: {
      ...marketData,
      userId,
    },
  });

  return [marketData];
}

/**
 * Fetches news market data
 */
async function fetchNewsData(
  source: any,
  config: MarketDataSourceConfig,
  userId: string
): Promise<MarketData[]> {
  // Implementation for news data
  // This would typically connect to news APIs
  
  // For now, return sample data
  const marketData: MarketData = {
    id: `market-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name: 'Industry News Sentiment',
    category: 'news',
    value: 0.65,
    source: 'News API',
    date: new Date(),
    trend: 0.05,
    impact: ImpactLevel.MEDIUM,
    relevance: ConfidenceLevel.MEDIUM,
    description: 'Sentiment analysis of recent industry news (0-1 scale)',
    metadata: {
      articles_analyzed: 50,
      top_keywords: ['innovation', 'growth', 'investment'],
    },
  };

  // Save to database
  await prisma.marketData.create({
    data: {
      ...marketData,
      userId,
    },
  });

  return [marketData];
}

/**
 * Fetches social media market data
 */
async function fetchSocialData(
  source: any,
  config: MarketDataSourceConfig,
  userId: string
): Promise<MarketData[]> {
  // Implementation for social media data
  // This would typically connect to social media APIs
  
  // For now, return sample data
  const marketData: MarketData = {
    id: `market-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name: 'Social Media Engagement',
    category: 'social',
    value: 12500,
    source: 'Social Media API',
    date: new Date(),
    trend: 15.3,
    impact: ImpactLevel.MEDIUM,
    relevance: ConfidenceLevel.MEDIUM,
    description: 'Total engagement across social media platforms',
    metadata: {
      platforms: ['twitter', 'linkedin', 'facebook'],
      engagement_types: ['likes', 'shares', 'comments'],
    },
  };

  // Save to database
  await prisma.marketData.create({
    data: {
      ...marketData,
      userId,
    },
  });

  return [marketData];
}

/**
 * Fetches data from a generic API
 */
async function fetchApiData(
  source: any,
  config: MarketDataSourceConfig,
  userId: string
): Promise<MarketData[]> {
  try {
    if (!config.endpoint) {
      throw new Error('API endpoint not specified');
    }

    // Make the API request
    const response = await axios.get(config.endpoint, {
      params: config.params,
      headers: config.headers,
    });

    // Extract data using the specified path
    let data = response.data;
    if (config.dataPath) {
      const paths = config.dataPath.split('.');
      for (const path of paths) {
        data = data[path];
        if (!data) break;
      }
    }

    if (!data) {
      throw new Error('No data found at specified path');
    }

    // Process the data
    const marketDataItems: MarketData[] = [];
    
    // If data is an array, process each item
    if (Array.isArray(data)) {
      for (const item of data.slice(0, 5)) { // Limit to 5 items
        const marketData = processApiDataItem(item, source, config);
        if (marketData) {
          marketDataItems.push(marketData);
          
          // Save to database
          await prisma.marketData.create({
            data: {
              ...marketData,
              userId,
            },
          });
        }
      }
    } else {
      // Process single item
      const marketData = processApiDataItem(data, source, config);
      if (marketData) {
        marketDataItems.push(marketData);
        
        // Save to database
        await prisma.marketData.create({
          data: {
            ...marketData,
            userId,
          },
        });
      }
    }

    return marketDataItems;
  } catch (error) {
    console.error('Error fetching API data:', error);
    LoggingService.error({
      message: 'Error fetching API data',
      userId,
      module: 'athena',
      category: 'MARKET_DATA',
      error: error as Error,
      metadata: {
        sourceId: source.id,
        sourceName: source.name,
        endpoint: config.endpoint,
      },
    });
    return [];
  }
}

/**
 * Processes a single data item from an API
 */
function processApiDataItem(
  item: any,
  source: any,
  config: MarketDataSourceConfig
): MarketData | null {
  try {
    // Apply mappings if provided
    const mappings = config.mappings || {};
    const name = item[mappings.name || 'name'] || 'API Data';
    const value = parseFloat(item[mappings.value || 'value']) || 0;
    const category = item[mappings.category || 'category'] || 'api';
    const description = item[mappings.description || 'description'] || 'Data from API';
    
    return {
      id: `market-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name,
      category,
      value,
      source: source.name,
      date: new Date(),
      trend: parseFloat(item[mappings.trend || 'trend']) || 0,
      impact: determineImpact(value, item),
      relevance: determineRelevance(item),
      description,
      metadata: item,
    };
  } catch (error) {
    console.error('Error processing API data item:', error);
    return null;
  }
}

/**
 * Determines the impact level of a market data item
 */
function determineImpact(value: number, item: any): ImpactLevel {
  // This is a simplified implementation
  // In a real application, this would use more sophisticated logic
  
  const trend = parseFloat(item.trend || '0');
  const absChange = Math.abs(trend);
  
  if (absChange > 20) return ImpactLevel.CRITICAL;
  if (absChange > 10) return ImpactLevel.HIGH;
  if (absChange > 5) return ImpactLevel.MEDIUM;
  return ImpactLevel.LOW;
}

/**
 * Determines the relevance level of a market data item
 */
function determineRelevance(item: any): ConfidenceLevel {
  // This is a simplified implementation
  // In a real application, this would use more sophisticated logic
  
  const confidence = item.confidence || 0.7;
  
  if (confidence > 0.9) return ConfidenceLevel.VERY_HIGH;
  if (confidence > 0.7) return ConfidenceLevel.HIGH;
  if (confidence > 0.5) return ConfidenceLevel.MEDIUM;
  return ConfidenceLevel.LOW;
}
