import Event from '@/src/models/Event';
import mongoose from 'mongoose';

export type EventType =
  | 'triage.run'
  | 'triage.ok'
  | 'triage.fail'
  | 'answers.save'
  | 'outline.run'
  | 'outline.ok'
  | 'outline.fail'
  | 'pdf.download'
  | 'rfi.create'
  | 'rfi.answer'
  | 'rfi.close'
  | 'status.change';

interface LogEventParams {
  type: EventType;
  userId?: string | mongoose.Types.ObjectId;
  problemId?: string | mongoose.Types.ObjectId;
  meta?: Record<string, any>;
}

/**
 * Log an event to the analytics database
 * Non-blocking - errors are logged but don't throw
 */
export async function logEvent({ type, userId, problemId, meta }: LogEventParams): Promise<void> {
  try {
    await Event.create({
      at: new Date(),
      type,
      userId: userId ? new mongoose.Types.ObjectId(userId as string) : undefined,
      problemId: problemId ? new mongoose.Types.ObjectId(problemId as string) : undefined,
      meta
    });
  } catch (error) {
    // Log error but don't throw - analytics should never break the main flow
    console.error('Failed to log event:', { type, error });
  }
}
