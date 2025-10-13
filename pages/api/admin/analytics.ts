import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/src/lib/authz';
import dbConnect from '@/src/lib/dbConnect';
import DailyAnalytics from '@/src/models/DailyAnalytics';
import Event from '@/src/models/Event';
import LLMUsage from '@/src/models/LLMUsage';
import Problem from '@/src/models/Problem';
import { estimateTotalCost } from '@/src/lib/pricing';

/**
 * Admin Analytics API
 * Returns aggregated analytics data for the admin dashboard
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Require admin authentication
    await requireAdmin(req, res);

    await dbConnect();

    const { days = 7 } = req.query;
    const daysNum = parseInt(days as string, 10);

    // Calculate date range
    const endDate = new Date();
    endDate.setUTCHours(0, 0, 0, 0);

    const startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - daysNum);

    // Fetch daily analytics
    const dailyAnalytics = await DailyAnalytics.find({
      date: { $gte: startDate, $lt: endDate }
    })
      .sort({ date: -1 })
      .lean();

    // Calculate summary metrics
    let totalProblems = 0;
    let totalEvents = 0;
    let totalLLMCalls = 0;
    let totalTokensIn = 0;
    let totalTokensOut = 0;

    dailyAnalytics.forEach((day: any) => {
      totalProblems += day.problems.created || 0;
      totalEvents += day.events.reduce((sum: number, e: any) => sum + e.count, 0);
      day.llmUsage.forEach((usage: any) => {
        totalLLMCalls += usage.totalCalls;
        totalTokensIn += usage.totalTokensIn;
        totalTokensOut += usage.totalTokensOut;
      });
    });

    // Aggregate LLM usage by model across all days
    const llmByModel = dailyAnalytics.reduce((acc: any, day: any) => {
      day.llmUsage.forEach((usage: any) => {
        if (!acc[usage.model]) {
          acc[usage.model] = {
            model: usage.model,
            totalTokensIn: 0,
            totalTokensOut: 0,
            totalCalls: 0
          };
        }
        acc[usage.model].totalTokensIn += usage.totalTokensIn;
        acc[usage.model].totalTokensOut += usage.totalTokensOut;
        acc[usage.model].totalCalls += usage.totalCalls;
      });
      return acc;
    }, {} as Record<string, { model: string; totalTokensIn: number; totalTokensOut: number; totalCalls: number }>);

    const llmByModelArray = Object.values(llmByModel);

    // Calculate estimated cost
    const estimatedCost = estimateTotalCost(llmByModelArray);

    // Aggregate top domains across all days
    const domainCounts = dailyAnalytics.reduce((acc: any, day: any) => {
      day.topDomains.forEach((d: any) => {
        acc[d.domain] = (acc[d.domain] || 0) + d.count;
      });
      return acc;
    }, {} as Record<string, number>);

    const topDomains = Object.entries(domainCounts)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Fetch real-time data (today's data not yet aggregated)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todayEvents = await Event.countDocuments({ at: { $gte: today } });
    const todayProblems = await Problem.countDocuments({ createdAt: { $gte: today } });
    const todayLLMCalls = await LLMUsage.countDocuments({ at: { $gte: today } });

    // Prepare time series data for charts
    const timeSeries = dailyAnalytics.reverse().map((day: any) => ({
      date: day.date.toISOString().split('T')[0],
      problems: day.problems.created,
      events: day.events.reduce((sum: number, e: any) => sum + e.count, 0),
      llmCalls: day.llmUsage.reduce((sum: number, u: any) => sum + u.totalCalls, 0),
      tokensIn: day.llmUsage.reduce((sum: number, u: any) => sum + u.totalTokensIn, 0),
      tokensOut: day.llmUsage.reduce((sum: number, u: any) => sum + u.totalTokensOut, 0)
    }));

    return res.status(200).json({
      ok: true,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        days: daysNum
      },
      summary: {
        totalProblems,
        totalEvents,
        totalLLMCalls,
        totalTokensIn,
        totalTokensOut,
        estimatedCost,
        todayEvents,
        todayProblems,
        todayLLMCalls
      },
      timeSeries,
      llmByModel: llmByModelArray,
      topDomains
    });
  } catch (error) {
    // Error already sent by requireAdmin
    if (res.headersSent) {
      return;
    }

    console.error('Analytics API error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to fetch analytics',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
