/**
 * Temporal Memory Service
 * 
 * Provides advanced temporal querying and recall capabilities for the memory system.
 * Enables natural language time-based queries and comparisons across different time periods.
 */

import { prisma } from '../../../../prisma/client';
import { 
  MemoryEntry, 
  MemoryContentType, 
  TemporalReference,
  TemporalReferenceType,
  TemporalQueryResult,
  MemoryComparison
} from '../types';
import { searchMemories, retrieveMemories } from './memoryManager';
import { trackedGroqInference } from '../../../ai-services/trackedGroqInference';
import { logger } from '../../../shared/logger';

/**
 * Parse a natural language temporal query into structured temporal parameters
 * 
 * @param query Natural language query like "remember when we discussed pricing last month"
 * @param userId User ID for context
 * @returns Structured temporal parameters
 */
export async function parseTemporalQuery(
  query: string,
  userId: string
): Promise<{
  parsedQuery: string;
  timeframe?: string;
  startDate?: Date;
  endDate?: Date;
  temporalReferences?: TemporalReference[];
}> {
  try {
    // Use Groq to parse the temporal aspects of the query
    const prompt = `
      Parse the following query and extract any temporal references. 
      The current date is ${new Date().toISOString().split('T')[0]}.
      
      Query: "${query}"
      
      Extract:
      1. The core query without temporal references
      2. Any specific timeframes mentioned (e.g., "last week", "in April", "during the product launch")
      3. Start and end dates if applicable
      4. The type of temporal reference (absolute, relative, recurring, seasonal, milestone)
      
      Return as JSON with these fields:
      {
        "parsedQuery": "the core query without temporal references",
        "timeframe": "the timeframe description if any",
        "startDate": "YYYY-MM-DD if applicable",
        "endDate": "YYYY-MM-DD if applicable",
        "temporalReferences": [
          {
            "type": "absolute|relative|recurring|seasonal|milestone",
            "value": "the original text reference",
            "startDate": "YYYY-MM-DD if applicable",
            "endDate": "YYYY-MM-DD if applicable"
          }
        ]
      }
    `;

    const response = await trackedGroqInference({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: 'You are a temporal query parser that extracts time-related information from natural language queries.' },
        { role: 'user', content: prompt }
      ],
      userId,
      purpose: 'temporal-query-parsing',
      metadata: {
        queryLength: query.length,
        operation: 'parse-temporal-query',
      },
    });

    if (!response || !response.content) {
      throw new Error('Failed to parse temporal query: No response from AI service');
    }

    // Extract JSON from the response
    const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/) || 
                      response.content.match(/{[\s\S]*?}/);
    
    if (!jsonMatch) {
      throw new Error('Failed to parse temporal query: No valid JSON in response');
    }

    const jsonStr = jsonMatch[0].replace(/```json\n|```/g, '');
    const parsed = JSON.parse(jsonStr);

    // Convert string dates to Date objects
    if (parsed.startDate) {
      parsed.startDate = new Date(parsed.startDate);
    }
    if (parsed.endDate) {
      parsed.endDate = new Date(parsed.endDate);
    }

    // Convert dates in temporal references
    if (parsed.temporalReferences && Array.isArray(parsed.temporalReferences)) {
      parsed.temporalReferences.forEach((ref: any) => {
        if (ref.startDate) {
          ref.startDate = new Date(ref.startDate);
        }
        if (ref.endDate) {
          ref.endDate = new Date(ref.endDate);
        }
      });
    }

    return parsed;
  } catch (error) {
    logger.error('Error parsing temporal query:', { error, query, userId });
    // Return just the original query if parsing fails
    return {
      parsedQuery: query,
    };
  }
}

/**
 * Query memories based on temporal references in natural language
 * 
 * @param query Natural language query with temporal references
 * @param userId User ID
 * @param options Additional query options
 * @returns Memories matching the temporal query
 */
export async function queryMemoriesByTime(
  query: string,
  userId: string,
  options: {
    agentId?: string;
    sessionId?: string;
    contentType?: MemoryContentType;
    limit?: number;
    minImportance?: number;
  } = {}
): Promise<TemporalQueryResult> {
  try {
    // Parse the temporal query
    const parsedQuery = await parseTemporalQuery(query, userId);
    
    // Build date filters based on parsed temporal information
    const dateFilter: any = {};
    if (parsedQuery.startDate) {
      dateFilter.createdAt = {
        ...(dateFilter.createdAt || {}),
        gte: parsedQuery.startDate,
      };
    }
    if (parsedQuery.endDate) {
      dateFilter.createdAt = {
        ...(dateFilter.createdAt || {}),
        lte: parsedQuery.endDate,
      };
    }

    // First try semantic search with the parsed query
    const semanticResults = await searchMemories(
      parsedQuery.parsedQuery,
      userId,
      {
        ...options,
        limit: options.limit || 10,
        similarityThreshold: 0.65, // Lower threshold for temporal queries
      }
    );

    // Then filter by date if temporal references were found
    let filteredResults = semanticResults;
    if (Object.keys(dateFilter).length > 0) {
      const memoryIds = semanticResults.map(memory => memory.id);
      
      // Get memories that match both semantic search and date filters
      const dateFilteredMemories = await prisma.interactionMemory.findMany({
        where: {
          id: { in: memoryIds },
          ...dateFilter,
        },
      });
      
      const dateFilteredIds = new Set(dateFilteredMemories.map(m => m.id));
      filteredResults = semanticResults.filter(memory => dateFilteredIds.has(memory.id));
    }

    // If we have very few results, try a broader search
    if (filteredResults.length < 2 && parsedQuery.timeframe) {
      // Try to find memories with metadata containing the timeframe
      const metadataResults = await prisma.interactionMemory.findMany({
        where: {
          userId,
          ...(options.agentId && { agentId: options.agentId }),
          ...(options.sessionId && { sessionId: options.sessionId }),
          ...(options.contentType && { type: options.contentType }),
          metadata: {
            path: ['$.timeframe', '$.period', '$.date', '$.when'],
            string_contains: parsedQuery.timeframe,
          },
        },
        orderBy: [
          { importance: 'desc' },
          { createdAt: 'desc' },
        ],
        take: options.limit || 10,
      });
      
      // Merge with filtered results
      const existingIds = new Set(filteredResults.map(m => m.id));
      for (const memory of metadataResults) {
        if (!existingIds.has(memory.id)) {
          filteredResults.push({
            id: memory.id,
            content: memory.content,
            context: memory.metadata?.context || memory.type,
            contentType: memory.type as MemoryContentType,
            similarity: 0.7, // Default similarity for metadata matches
            createdAt: memory.createdAt,
          });
        }
      }
    }

    // Map to MemoryEntry format
    const memories = await Promise.all(filteredResults.map(async (result) => {
      const memory = await prisma.interactionMemory.findUnique({
        where: { id: result.id },
      });
      
      if (!memory) return null;
      
      return {
        id: memory.id,
        userId: memory.userId,
        agentId: memory.agentId,
        sessionId: memory.sessionId || undefined,
        type: memory.type.includes('SHORT_TERM') ? 'SHORT_TERM' : 'LONG_TERM',
        contentType: memory.type as MemoryContentType,
        context: memory.metadata?.context || '',
        content: memory.content,
        importance: memory.importance,
        expiresAt: memory.expiresAt || undefined,
        metadata: {
          ...memory.metadata,
          similarity: result.similarity,
        },
        createdAt: memory.createdAt,
        updatedAt: memory.updatedAt,
      } as MemoryEntry;
    }));

    // Filter out nulls
    const validMemories = memories.filter(Boolean) as MemoryEntry[];

    // Generate a summary if we have results
    let summary = undefined;
    if (validMemories.length > 0) {
      summary = await generateTemporalSummary(validMemories, parsedQuery.timeframe || '', userId);
    }

    return {
      memories: validMemories,
      timeframe: {
        description: parsedQuery.timeframe || 'specified time period',
        startDate: parsedQuery.startDate,
        endDate: parsedQuery.endDate,
      },
      summary,
    };
  } catch (error) {
    logger.error('Error querying memories by time:', { error, query, userId });
    return {
      memories: [],
      timeframe: {
        description: 'unknown time period',
      },
    };
  }
}

/**
 * Compare memories across different time periods
 * 
 * @param userId User ID
 * @param period1 Description of first time period
 * @param period2 Description of second time period
 * @param options Additional query options
 * @returns Comparison of memories between the two periods
 */
export async function compareMemoriesAcrossPeriods(
  userId: string,
  period1: string,
  period2: string,
  options: {
    agentId?: string;
    contentType?: MemoryContentType;
    context?: string;
    limit?: number;
  } = {}
): Promise<MemoryComparison> {
  try {
    // Parse the two periods
    const parsed1 = await parseTemporalQuery(`memories from ${period1}`, userId);
    const parsed2 = await parseTemporalQuery(`memories from ${period2}`, userId);

    // Ensure we have date ranges for both periods
    if (!parsed1.startDate || !parsed1.endDate || !parsed2.startDate || !parsed2.endDate) {
      throw new Error('Could not determine date ranges for comparison');
    }

    // Query memories for each period
    const memories1 = await prisma.interactionMemory.findMany({
      where: {
        userId,
        ...(options.agentId && { agentId: options.agentId }),
        ...(options.contentType && { type: options.contentType }),
        ...(options.context && { metadata: { path: ['context'], equals: options.context } }),
        createdAt: {
          gte: parsed1.startDate,
          lte: parsed1.endDate,
        },
      },
      orderBy: [
        { importance: 'desc' },
        { createdAt: 'desc' },
      ],
      take: options.limit || 20,
    });

    const memories2 = await prisma.interactionMemory.findMany({
      where: {
        userId,
        ...(options.agentId && { agentId: options.agentId }),
        ...(options.contentType && { type: options.contentType }),
        ...(options.context && { metadata: { path: ['context'], equals: options.context } }),
        createdAt: {
          gte: parsed2.startDate,
          lte: parsed2.endDate,
        },
      },
      orderBy: [
        { importance: 'desc' },
        { createdAt: 'desc' },
      ],
      take: options.limit || 20,
    });

    // Map to MemoryEntry format
    const mappedMemories1 = memories1.map(memory => ({
      id: memory.id,
      userId: memory.userId,
      agentId: memory.agentId,
      sessionId: memory.sessionId || undefined,
      type: memory.type.includes('SHORT_TERM') ? 'SHORT_TERM' : 'LONG_TERM',
      contentType: memory.type as MemoryContentType,
      context: memory.metadata?.context || '',
      content: memory.content,
      importance: memory.importance,
      expiresAt: memory.expiresAt || undefined,
      metadata: memory.metadata || {},
      createdAt: memory.createdAt,
      updatedAt: memory.updatedAt,
    } as MemoryEntry));

    const mappedMemories2 = memories2.map(memory => ({
      id: memory.id,
      userId: memory.userId,
      agentId: memory.agentId,
      sessionId: memory.sessionId || undefined,
      type: memory.type.includes('SHORT_TERM') ? 'SHORT_TERM' : 'LONG_TERM',
      contentType: memory.type as MemoryContentType,
      context: memory.metadata?.context || '',
      content: memory.content,
      importance: memory.importance,
      expiresAt: memory.expiresAt || undefined,
      metadata: memory.metadata || {},
      createdAt: memory.createdAt,
      updatedAt: memory.updatedAt,
    } as MemoryEntry));

    // Generate summaries for each period
    const summary1 = await generateTemporalSummary(mappedMemories1, period1, userId);
    const summary2 = await generateTemporalSummary(mappedMemories2, period2, userId);

    // Generate comparison analysis
    const { differences, similarities } = await compareTimePeriods(
      mappedMemories1,
      mappedMemories2,
      period1,
      period2,
      userId
    );

    return {
      period1: {
        description: period1,
        startDate: parsed1.startDate,
        endDate: parsed1.endDate,
        memories: mappedMemories1,
        summary: summary1,
      },
      period2: {
        description: period2,
        startDate: parsed2.startDate,
        endDate: parsed2.endDate,
        memories: mappedMemories2,
        summary: summary2,
      },
      differences,
      similarities,
    };
  } catch (error) {
    logger.error('Error comparing memories across periods:', { error, userId, period1, period2 });
    throw new Error(`Failed to compare memories: ${error.message}`);
  }
}

/**
 * Generate a summary of memories for a specific time period
 * 
 * @param memories Array of memories to summarize
 * @param timeframe Description of the time period
 * @param userId User ID for tracking
 * @returns Summary text
 */
async function generateTemporalSummary(
  memories: MemoryEntry[],
  timeframe: string,
  userId: string
): Promise<string> {
  try {
    if (memories.length === 0) {
      return `No memories found for ${timeframe}.`;
    }

    // Prepare memory content for summarization
    const memoryTexts = memories.map(memory => {
      const content = typeof memory.content === 'string' 
        ? memory.content 
        : JSON.stringify(memory.content);
      
      return `- ${memory.contentType} (${new Date(memory.createdAt!).toLocaleDateString()}): ${content.substring(0, 200)}${content.length > 200 ? '...' : ''}`;
    }).join('\n');

    // Use Groq to generate a summary
    const prompt = `
      Summarize the following memories from ${timeframe}:
      
      ${memoryTexts}
      
      Provide a concise summary that captures the key points, decisions, and patterns from this time period.
    `;

    const response = await trackedGroqInference({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: 'You are a memory summarization assistant that creates concise, accurate summaries of past interactions and events.' },
        { role: 'user', content: prompt }
      ],
      userId,
      purpose: 'temporal-memory-summarization',
      metadata: {
        memoryCount: memories.length,
        timeframe,
        operation: 'generate-temporal-summary',
      },
    });

    if (!response || !response.content) {
      throw new Error('Failed to generate summary: No response from AI service');
    }

    return response.content.trim();
  } catch (error) {
    logger.error('Error generating temporal summary:', { error, memoryCount: memories.length, timeframe, userId });
    return `Summary unavailable for ${timeframe}.`;
  }
}

/**
 * Compare two sets of memories from different time periods
 * 
 * @param memories1 Memories from first period
 * @param memories2 Memories from second period
 * @param period1 Description of first period
 * @param period2 Description of second period
 * @param userId User ID for tracking
 * @returns Differences and similarities between the periods
 */
async function compareTimePeriods(
  memories1: MemoryEntry[],
  memories2: MemoryEntry[],
  period1: string,
  period2: string,
  userId: string
): Promise<{ differences: string[]; similarities: string[] }> {
  try {
    // Prepare memory content for comparison
    const prepareMemoriesText = (memories: MemoryEntry[]) => {
      return memories.map(memory => {
        const content = typeof memory.content === 'string' 
          ? memory.content 
          : JSON.stringify(memory.content);
        
        return `- ${memory.contentType} (${new Date(memory.createdAt!).toLocaleDateString()}): ${content.substring(0, 150)}${content.length > 150 ? '...' : ''}`;
      }).join('\n');
    };

    const memories1Text = prepareMemoriesText(memories1);
    const memories2Text = prepareMemoriesText(memories2);

    // Use Groq to generate a comparison
    const prompt = `
      Compare the following sets of memories from two different time periods:
      
      PERIOD 1 (${period1}):
      ${memories1Text || "No memories found."}
      
      PERIOD 2 (${period2}):
      ${memories2Text || "No memories found."}
      
      Identify key differences and similarities between these two time periods.
      Format your response as JSON with two arrays:
      {
        "differences": ["difference 1", "difference 2", ...],
        "similarities": ["similarity 1", "similarity 2", ...]
      }
    `;

    const response = await trackedGroqInference({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: 'You are a memory analysis assistant that compares memories across different time periods to identify patterns, changes, and consistencies.' },
        { role: 'user', content: prompt }
      ],
      userId,
      purpose: 'temporal-memory-comparison',
      metadata: {
        period1MemoryCount: memories1.length,
        period2MemoryCount: memories2.length,
        operation: 'compare-time-periods',
      },
    });

    if (!response || !response.content) {
      throw new Error('Failed to compare time periods: No response from AI service');
    }

    // Extract JSON from the response
    const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/) || 
                      response.content.match(/{[\s\S]*?}/);
    
    if (!jsonMatch) {
      // If no JSON found, create a simple response
      return {
        differences: ['Analysis could not identify specific differences.'],
        similarities: ['Analysis could not identify specific similarities.'],
      };
    }

    const jsonStr = jsonMatch[0].replace(/```json\n|```/g, '');
    const parsed = JSON.parse(jsonStr);

    return {
      differences: Array.isArray(parsed.differences) ? parsed.differences : [],
      similarities: Array.isArray(parsed.similarities) ? parsed.similarities : [],
    };
  } catch (error) {
    logger.error('Error comparing time periods:', { 
      error, 
      period1, 
      period2, 
      memories1Count: memories1.length, 
      memories2Count: memories2.length,
      userId 
    });
    
    return {
      differences: ['Error analyzing differences between time periods.'],
      similarities: ['Error analyzing similarities between time periods.'],
    };
  }
}

/**
 * Extract temporal references from text and store them with a memory
 * 
 * @param text Text to analyze for temporal references
 * @param userId User ID for tracking
 * @returns Array of temporal references
 */
export async function extractTemporalReferences(
  text: string,
  userId: string
): Promise<TemporalReference[]> {
  try {
    // Use Groq to extract temporal references
    const prompt = `
      Extract all temporal references from the following text.
      The current date is ${new Date().toISOString().split('T')[0]}.
      
      Text: "${text}"
      
      For each temporal reference, identify:
      1. The type (absolute, relative, recurring, seasonal, milestone)
      2. The original text
      3. Start and end dates if applicable
      4. Recurrence pattern if applicable
      5. Milestone name if applicable
      
      Return as JSON array:
      [
        {
          "type": "absolute|relative|recurring|seasonal|milestone",
          "value": "the original text reference",
          "startDate": "YYYY-MM-DD if applicable",
          "endDate": "YYYY-MM-DD if applicable",
          "recurrencePattern": "pattern if applicable",
          "milestone": "name if applicable"
        }
      ]
    `;

    const response = await trackedGroqInference({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: 'You are a temporal reference extraction assistant that identifies time-related information in text.' },
        { role: 'user', content: prompt }
      ],
      userId,
      purpose: 'temporal-reference-extraction',
      metadata: {
        textLength: text.length,
        operation: 'extract-temporal-references',
      },
    });

    if (!response || !response.content) {
      return [];
    }

    // Extract JSON from the response
    const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/) || 
                      response.content.match(/\[([\s\S]*?)\]/);
    
    if (!jsonMatch) {
      return [];
    }

    const jsonStr = jsonMatch[0].replace(/```json\n|```/g, '');
    let parsed: any[] = [];
    
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      logger.error('Error parsing temporal references JSON:', { error: e, jsonStr });
      return [];
    }

    // Convert string dates to Date objects
    return parsed.map(ref => ({
      type: ref.type as TemporalReferenceType,
      value: ref.value,
      startDate: ref.startDate ? new Date(ref.startDate) : undefined,
      endDate: ref.endDate ? new Date(ref.endDate) : undefined,
      recurrencePattern: ref.recurrencePattern,
      milestone: ref.milestone,
    }));
  } catch (error) {
    logger.error('Error extracting temporal references:', { error, text, userId });
    return [];
  }
}