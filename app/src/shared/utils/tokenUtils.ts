/**
 * Token Utilities
 * 
 * This module provides utilities for estimating token counts for LLM operations.
 */

/**
 * Estimate the number of tokens in a string
 * This is a simple approximation - for production use, consider using a proper tokenizer
 * like GPT Tokenizer or TikToken
 * 
 * @param text The text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  
  // Simple approximation: 1 token ≈ 4 characters for English text
  // This is a rough estimate and will vary by model and language
  return Math.ceil(text.length / 4);
}

/**
 * Estimate the cost of a completion based on token count and model
 * 
 * @param promptTokens Number of tokens in the prompt
 * @param completionTokens Number of tokens in the completion
 * @param model The model used
 * @returns Estimated cost in USD
 */
export function estimateCompletionCost(
  promptTokens: number,
  completionTokens: number,
  model: string
): number {
  // Pricing per 1M tokens (as of July 2024)
  // These rates should be updated as pricing changes
  const pricingPerMillion: Record<string, { input: number; output: number }> = {
    // Groq models
    'llama3-8b-8192': { input: 0.15, output: 0.15 },
    'llama3-70b-8192': { input: 0.7, output: 0.9 },
    'mixtral-8x7b-32768': { input: 0.6, output: 0.6 },
    'gemma-7b-it': { input: 0.15, output: 0.15 },
    
    // OpenAI models
    'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
    'gpt-4o': { input: 5.0, output: 15.0 },
    
    // Anthropic models
    'claude-3-opus': { input: 15.0, output: 75.0 },
    'claude-3-sonnet': { input: 3.0, output: 15.0 },
    'claude-3-haiku': { input: 0.25, output: 1.25 },
    
    // Default fallback
    'default': { input: 1.0, output: 1.0 },
  };
  
  // Get pricing for the model or use default
  const pricing = pricingPerMillion[model] || pricingPerMillion.default;
  
  // Calculate cost
  const promptCost = (promptTokens / 1_000_000) * pricing.input;
  const completionCost = (completionTokens / 1_000_000) * pricing.output;
  
  return promptCost + completionCost;
}

/**
 * Format a cost value as a currency string
 * 
 * @param cost The cost value
 * @param currency The currency code (default: 'USD')
 * @returns Formatted currency string
 */
export function formatCost(cost: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
  }).format(cost);
}

/**
 * Calculate the total tokens used in a session
 * 
 * @param promptTokens Total prompt tokens
 * @param completionTokens Total completion tokens
 * @returns Total tokens
 */
export function calculateTotalTokens(
  promptTokens: number,
  completionTokens: number
): number {
  return promptTokens + completionTokens;
}
