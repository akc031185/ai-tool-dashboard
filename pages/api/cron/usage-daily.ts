import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/src/lib/dbConnect';
import Event from '@/src/models/Event';
import LLMUsage from '@/src/models/LLMUsage';
import Problem from '@/src/models/Problem';
import DailyAnalytics from '@/src/models/DailyAnalytics';

/**
 * Daily aggregation cron job for analytics
 * Runs daily at midnight UTC (configured in vercel.json)
 *
 * Aggregates:
 * - Event counts by type
 * - LLM usage by route and model
 * - Problem status counts
 * - Top domains
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify this is a cron request (Vercel sets this header)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await dbConnect();

    // Calculate yesterday's date range (UTC)
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    yesterday.setUTCHours(0, 0, 0, 0);

    const today = new Date(yesterday);
    today.setUTCDate(today.getUTCDate() + 1);

    console.log(`[Cron] Aggregating analytics for ${yesterday.toISOString().split('T')[0]}`);

    // Check if we already have analytics for this date
    const existing = await DailyAnalytics.findOne({ date: yesterday });
    if (existing) {
      console.log('[Cron] Analytics already exist for this date, skipping');
      return res.status(200).json({ ok: true, message: 'Already aggregated' });
    }

    // 1. Aggregate Events
    const eventAggregation = await Event.aggregate([
      {
        $match: {
          at: { $gte: yesterday, $lt: today }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const events = eventAggregation.map(e => ({
      type: e._id,
      count: e.count
    }));

    // 2. Aggregate LLM Usage
    const llmAggregation = await LLMUsage.aggregate([
      {
        $match: {
          at: { $gte: yesterday, $lt: today }
        }
      },
      {
        $group: {
          _id: { route: '$route', model: '$model' },
          totalCalls: { $sum: 1 },
          totalTokensIn: { $sum: '$tokensIn' },
          totalTokensOut: { $sum: '$tokensOut' },
          totalMs: { $sum: '$ms' },
          avgMs: { $avg: '$ms' }
        }
      }
    ]);

    const llmUsage = llmAggregation.map(l => ({
      route: l._id.route,
      model: l._id.model,
      totalCalls: l.totalCalls,
      totalTokensIn: l.totalTokensIn || 0,
      totalTokensOut: l.totalTokensOut || 0,
      totalMs: l.totalMs,
      avgMs: Math.round(l.avgMs)
    }));

    // 3. Aggregate Problem Status
    const problemStats = await Problem.aggregate([
      {
        $match: {
          createdAt: { $gte: yesterday, $lt: today }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const problems = {
      created: problemStats.reduce((sum, p) => sum + p.count, 0),
      submitted: problemStats.find(p => p._id === 'submitted')?.count || 0,
      inProgress: problemStats.find(p => p._id === 'in-progress')?.count || 0,
      completed: problemStats.find(p => p._id === 'completed')?.count || 0
    };

    // 4. Aggregate Top Domains
    const domainAggregation = await Problem.aggregate([
      {
        $match: {
          createdAt: { $gte: yesterday, $lt: today },
          'triage.domains': { $exists: true }
        }
      },
      {
        $unwind: '$triage.domains'
      },
      {
        $group: {
          _id: '$triage.domains.label',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    const topDomains = domainAggregation.map(d => ({
      domain: d._id,
      count: d.count
    }));

    // Save aggregated data
    await DailyAnalytics.create({
      date: yesterday,
      events,
      llmUsage,
      problems,
      topDomains
    });

    console.log('[Cron] Successfully aggregated analytics', {
      date: yesterday.toISOString().split('T')[0],
      eventTypes: events.length,
      llmRoutes: llmUsage.length,
      problemsCreated: problems.created,
      topDomains: topDomains.length
    });

    return res.status(200).json({
      ok: true,
      date: yesterday.toISOString().split('T')[0],
      summary: {
        events: events.length,
        llmUsage: llmUsage.length,
        problems: problems.created,
        domains: topDomains.length
      }
    });
  } catch (error) {
    console.error('[Cron] Failed to aggregate analytics:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to aggregate analytics',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
