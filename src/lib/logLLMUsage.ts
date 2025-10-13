import LLMUsage from '@/src/models/LLMUsage';
import mongoose from 'mongoose';

interface LogLLMUsageParams {
  route: string;
  model: string;
  ms: number;
  tokensIn?: number;
  tokensOut?: number;
  userId?: string | mongoose.Types.ObjectId;
  problemId?: string | mongoose.Types.ObjectId;
}

/**
 * Log LLM usage to the analytics database
 * Non-blocking - errors are logged but don't throw
 */
export async function logLLMUsage({
  route,
  model,
  ms,
  tokensIn,
  tokensOut,
  userId,
  problemId
}: LogLLMUsageParams): Promise<void> {
  try {
    await LLMUsage.create({
      at: new Date(),
      route,
      model,
      ms,
      tokensIn,
      tokensOut,
      userId: userId ? new mongoose.Types.ObjectId(userId as string) : undefined,
      problemId: problemId ? new mongoose.Types.ObjectId(problemId as string) : undefined
    });
  } catch (error) {
    // Log error but don't throw - analytics should never break the main flow
    console.error('Failed to log LLM usage:', { route, model, error });
  }
}
