/**
 * OpenAI API Pricing (as of January 2025)
 * All prices are per 1M tokens
 * Source: https://openai.com/api/pricing/
 */

export const MODEL_PRICING = {
  'gpt-4o': {
    input: 2.50,  // $2.50 per 1M input tokens
    output: 10.00  // $10.00 per 1M output tokens
  },
  'gpt-4o-mini': {
    input: 0.15,   // $0.15 per 1M input tokens
    output: 0.60   // $0.60 per 1M output tokens
  },
  'gpt-4-turbo': {
    input: 10.00,  // $10.00 per 1M input tokens
    output: 30.00  // $30.00 per 1M output tokens
  },
  'gpt-4': {
    input: 30.00,  // $30.00 per 1M input tokens
    output: 60.00  // $60.00 per 1M output tokens
  },
  'gpt-3.5-turbo': {
    input: 0.50,   // $0.50 per 1M input tokens
    output: 1.50   // $1.50 per 1M output tokens
  }
} as const;

export type ModelName = keyof typeof MODEL_PRICING;

/**
 * Calculate estimated cost for LLM usage
 * @param model - OpenAI model name
 * @param tokensIn - Input tokens
 * @param tokensOut - Output tokens
 * @returns Cost in USD
 */
export function estimateCost(
  model: string,
  tokensIn: number,
  tokensOut: number
): number {
  const pricing = MODEL_PRICING[model as ModelName];

  if (!pricing) {
    console.warn(`Unknown model for pricing: ${model}`);
    return 0;
  }

  const inputCost = (tokensIn / 1_000_000) * pricing.input;
  const outputCost = (tokensOut / 1_000_000) * pricing.output;

  return inputCost + outputCost;
}

/**
 * Calculate estimated cost for aggregated LLM usage
 * @param usage - Array of usage records with model, tokensIn, tokensOut
 * @returns Total cost in USD
 */
export function estimateTotalCost(
  usage: Array<{
    model: string;
    totalTokensIn: number;
    totalTokensOut: number;
  }>
): number {
  return usage.reduce((total, u) => {
    return total + estimateCost(u.model, u.totalTokensIn, u.totalTokensOut);
  }, 0);
}

/**
 * Format cost as USD string
 * @param cost - Cost in USD
 * @returns Formatted string (e.g., "$1.23")
 */
export function formatCost(cost: number): string {
  if (cost < 0.01 && cost > 0) {
    return '<$0.01';
  }
  return `$${cost.toFixed(2)}`;
}
