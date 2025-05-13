import { trackedGroqInference } from './trackedGroqInference';
import { aiResponseCache } from './aiResponseCache';
import { logger } from '../shared/logger';

export interface SentimentAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number; // -1 to 1 scale
  emotionalTones: string[]; // e.g., ["excited", "satisfied", "confused", "frustrated"]
  confidence: number; // 0 to 1 scale
  keyPhrases: string[];
  metadata: {
    fatigue?: boolean;
    confusion?: boolean;
    trust?: number; // 0 to 1 scale
    urgency?: number; // 0 to 1 scale
    technicalDetail?: number; // 0 to 1 scale
  };
}

/**
 * Analyzes the sentiment of a text using Groq's LLM capabilities
 * @param text The text to analyze for sentiment
 * @param context Optional context about where the text came from (e.g., "feedback", "approval", "comment")
 * @returns A structured sentiment analysis result
 */
export async function analyzeSentiment(
  text: string,
  context: string = 'feedback'
): Promise<SentimentAnalysisResult> {
  if (!text || text.trim().length === 0) {
    return {
      sentiment: 'neutral',
      score: 0,
      emotionalTones: [],
      confidence: 0,
      keyPhrases: [],
      metadata: {}
    };
  }

  // Create a cache key based on the text and context
  const cacheKey = `sentiment:${Buffer.from(text).toString('base64')}:${context}`;
  
  // Check if we have a cached result
  const cachedResult = await aiResponseCache.get(cacheKey);
  if (cachedResult) {
    return JSON.parse(cachedResult);
  }

  try {
    // Prepare the prompt for sentiment analysis
    const prompt = `
You are an expert sentiment analysis system. Analyze the following ${context} text and provide a detailed sentiment analysis.

Text to analyze: "${text}"

Provide your analysis in the following JSON format:
{
  "sentiment": "positive" | "negative" | "neutral",
  "score": <number between -1 and 1>,
  "emotionalTones": [<array of emotional tones detected>],
  "confidence": <number between 0 and 1>,
  "keyPhrases": [<key phrases that indicate sentiment>],
  "metadata": {
    "fatigue": <boolean - does the text show signs of user fatigue?>,
    "confusion": <boolean - does the text show signs of confusion?>,
    "trust": <number between 0 and 1 - level of trust expressed>,
    "urgency": <number between 0 and 1 - level of urgency expressed>,
    "technicalDetail": <number between 0 and 1 - level of technical detail>
  }
}

Only respond with the JSON object, no other text.
`;

    // Call Groq with the prompt
    const response = await trackedGroqInference({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-70b-8192',
      temperature: 0.1,
      max_tokens: 1000,
      top_p: 0.9,
      metadata: {
        purpose: 'sentiment_analysis',
        source: context,
        text_length: text.length
      }
    });

    // Parse the response
    const content = response.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Failed to parse sentiment analysis result');
    }
    
    const result = JSON.parse(jsonMatch[0]) as SentimentAnalysisResult;
    
    // Cache the result for future use (expires in 24 hours)
    await aiResponseCache.set(cacheKey, JSON.stringify(result), 60 * 60 * 24);
    
    return result;
  } catch (error) {
    logger.error('Sentiment analysis failed', { error, textLength: text.length, context });
    
    // Return a fallback neutral sentiment
    return {
      sentiment: 'neutral',
      score: 0,
      emotionalTones: [],
      confidence: 0.5,
      keyPhrases: [],
      metadata: {}
    };
  }
}

/**
 * Analyzes a batch of texts for sentiment
 * @param texts Array of text items to analyze
 * @param context Optional context about where the texts came from
 * @returns Array of sentiment analysis results
 */
export async function analyzeSentimentBatch(
  texts: string[],
  context: string = 'feedback'
): Promise<SentimentAnalysisResult[]> {
  const results: SentimentAnalysisResult[] = [];
  
  // Process in batches of 5 to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchPromises = batch.map(text => analyzeSentiment(text, context));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Aggregates sentiment results from multiple analyses to identify trends
 * @param results Array of sentiment analysis results
 * @returns Aggregated sentiment metrics
 */
export function aggregateSentimentResults(results: SentimentAnalysisResult[]) {
  if (!results.length) return null;
  
  const sentimentCounts = {
    positive: 0,
    negative: 0,
    neutral: 0
  };
  
  let totalScore = 0;
  let totalConfidence = 0;
  const allEmotionalTones: Record<string, number> = {};
  const allKeyPhrases: Record<string, number> = {};
  let fatigueCount = 0;
  let confusionCount = 0;
  let totalTrust = 0;
  let totalUrgency = 0;
  let totalTechnicalDetail = 0;
  
  // Process each result
  results.forEach(result => {
    // Count sentiments
    sentimentCounts[result.sentiment]++;
    
    // Sum scores and confidence
    totalScore += result.score;
    totalConfidence += result.confidence;
    
    // Count emotional tones
    result.emotionalTones.forEach(tone => {
      allEmotionalTones[tone] = (allEmotionalTones[tone] || 0) + 1;
    });
    
    // Count key phrases
    result.keyPhrases.forEach(phrase => {
      allKeyPhrases[phrase] = (allKeyPhrases[phrase] || 0) + 1;
    });
    
    // Count metadata indicators
    if (result.metadata.fatigue) fatigueCount++;
    if (result.metadata.confusion) confusionCount++;
    if (result.metadata.trust) totalTrust += result.metadata.trust;
    if (result.metadata.urgency) totalUrgency += result.metadata.urgency;
    if (result.metadata.technicalDetail) totalTechnicalDetail += result.metadata.technicalDetail;
  });
  
  // Calculate averages
  const avgScore = totalScore / results.length;
  const avgConfidence = totalConfidence / results.length;
  const avgTrust = totalTrust / results.length;
  const avgUrgency = totalUrgency / results.length;
  const avgTechnicalDetail = totalTechnicalDetail / results.length;
  
  // Get top emotional tones
  const topEmotionalTones = Object.entries(allEmotionalTones)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tone]) => tone);
  
  // Get top key phrases
  const topKeyPhrases = Object.entries(allKeyPhrases)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([phrase]) => phrase);
  
  // Calculate dominant sentiment
  let dominantSentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (sentimentCounts.positive > sentimentCounts.negative && 
      sentimentCounts.positive > sentimentCounts.neutral) {
    dominantSentiment = 'positive';
  } else if (sentimentCounts.negative > sentimentCounts.positive && 
             sentimentCounts.negative > sentimentCounts.neutral) {
    dominantSentiment = 'negative';
  }
  
  return {
    dominantSentiment,
    sentimentDistribution: {
      positive: sentimentCounts.positive / results.length,
      negative: sentimentCounts.negative / results.length,
      neutral: sentimentCounts.neutral / results.length
    },
    averageScore: avgScore,
    averageConfidence: avgConfidence,
    topEmotionalTones,
    topKeyPhrases,
    fatiguePercentage: fatigueCount / results.length,
    confusionPercentage: confusionCount / results.length,
    averageTrust: avgTrust,
    averageUrgency: avgUrgency,
    averageTechnicalDetail: avgTechnicalDetail,
    sampleSize: results.length
  };
}