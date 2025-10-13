import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/src/lib/dbConnect';
import Problem from '@/src/models/Problem';
import { callOpenAIJSON } from '@/src/lib/openai';
import { TriageSchema } from '@/src/lib/schemas';
import { rateLimit } from '@/src/lib/rateLimit';
import { logEvent } from '@/src/lib/logEvent';
import mongoose from 'mongoose';
import { ZodError } from 'zod';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Rate limiting
  const ip = (req.headers['x-forwarded-for']?.toString().split(',')[0] ?? req.socket.remoteAddress ?? 'unknown') as string;
  if (!rateLimit(`triage:${ip}`, { windowMs: 60_000, max: 10 })) {
    return res.status(429).json({ ok: false, error: 'Too many triage requests. Try again soon.' });
  }

  const { problemId, rawDescription } = req.body;

  if (!rawDescription || typeof rawDescription !== 'string' || rawDescription.trim().length === 0) {
    return res.status(400).json({ message: 'rawDescription is required' });
  }

  if (problemId && !mongoose.Types.ObjectId.isValid(problemId)) {
    return res.status(400).json({ message: 'Invalid problemId' });
  }

  await dbConnect();

  try {
    const userId = (session.user as any).id;

    // Find or create problem
    let problem;
    if (problemId) {
      problem = await Problem.findById(problemId);
      if (!problem) {
        return res.status(404).json({ message: 'Problem not found' });
      }
      if (problem.userId.toString() !== userId) {
        return res.status(403).json({ message: 'Forbidden: Not your problem' });
      }
    } else {
      // Create new problem
      problem = new Problem({
        userId,
        rawDescription: rawDescription.trim(),
        status: 'draft',
      });
      await problem.save();
    }

    // Log triage.run event
    await logEvent({
      type: 'triage.run',
      userId,
      problemId: problem._id.toString(),
      meta: { rawDescriptionLength: rawDescription.trim().length }
    });

    // Call OpenAI for triage
    const systemPrompt = `You are a solutions architect for real estate investors. Your job is to triage workflow problems and classify them.

Return ONLY valid JSON (no prose) with this exact structure:
{
  "kind": ["AI", "Automation", "Hybrid"],
  "kind_scores": { "AI": 0.0-1.0, "Automation": 0.0-1.0, "Hybrid": 0.0-1.0 },
  "domains": [{ "label": "string", "score": 0.0-1.0 }],
  "subdomains": [{ "label": "string", "score": 0.0-1.0 }],
  "other_tags": ["tag1", "tag2"],
  "needs_more_info": true/false,
  "missing_info": ["What is missing?"],
  "risk_flags": ["Any concerns?"],
  "notes": "Brief analysis"
}

Classification guidelines:
- kind: Can be multi-label. Include "AI" if it needs intelligence/reasoning, "Automation" if it's rule-based workflow, "Hybrid" if it's both.
- kind_scores: Confidence scores for each kind (sum doesn't need to be 1.0)
- domains: Top 2-3 relevant domains (e.g., "Property Management", "Lead Generation", "Data Analysis", "Document Processing")
- subdomains: Top 2-3 subdomains within those domains
- other_tags: Any other relevant tags
- needs_more_info: true if the problem is too vague or missing critical details
- missing_info: List of specific questions to ask if needs_more_info is true
- risk_flags: Any potential issues (e.g., "Requires third-party API", "Complex integration", "High data volume")
- notes: Brief 1-2 sentence summary of your analysis

Be specific and practical. Focus on what would help build a solution.`;

    const userPrompt = `Problem description:\n\n${rawDescription.trim()}`;

    let triageResponse = await callOpenAIJSON({
      model: 'gpt-4o-mini',
      system: systemPrompt,
      user: userPrompt,
      maxTokens: 600,
      temperature: 0.2,
    });

    // Log telemetry
    console.log('[LLM Triage]', {
      problemId: problem._id.toString(),
      model: triageResponse.telemetry.model,
      tokens: triageResponse.telemetry.totalTokens,
      promptTokens: triageResponse.telemetry.promptTokens,
      completionTokens: triageResponse.telemetry.completionTokens,
      latencyMs: triageResponse.telemetry.latencyMs,
      retried: triageResponse.telemetry.retried,
    });

    // Validate with Zod schema
    let validatedTriage;
    try {
      validatedTriage = TriageSchema.parse(triageResponse.data);
    } catch (error) {
      if (error instanceof ZodError) {
        // Retry with fix-to-schema instruction
        console.log('Triage validation failed, retrying with schema fix instruction:', error.errors);

        triageResponse = await callOpenAIJSON({
          model: 'gpt-4o-mini',
          system: systemPrompt + '\n\nIMPORTANT: Your previous response had validation errors. Ensure the JSON strictly matches the schema.',
          user: userPrompt + `\n\nPrevious validation errors: ${JSON.stringify(error.errors)}`,
          maxTokens: 600,
          temperature: 0.2,
        });

        // Log retry telemetry
        console.log('[LLM Triage Retry]', {
          problemId: problem._id.toString(),
          model: triageResponse.telemetry.model,
          tokens: triageResponse.telemetry.totalTokens,
          latencyMs: triageResponse.telemetry.latencyMs,
        });

        try {
          validatedTriage = TriageSchema.parse(triageResponse.data);
        } catch (retryError) {
          return res.status(422).json({
            ok: false,
            error: 'Invalid triage response from AI',
            details: retryError instanceof ZodError ? retryError.errors : String(retryError)
          });
        }
      } else {
        throw error;
      }
    }

    // Save validated triage to problem
    problem.triage = validatedTriage;

    await problem.save();

    // Log triage.ok event
    await logEvent({
      type: 'triage.ok',
      userId,
      problemId: problem._id.toString(),
      meta: {
        kind: validatedTriage.kind,
        domains: validatedTriage.domains.map((d: any) => d.label),
        needsMoreInfo: validatedTriage.needs_more_info
      }
    });

    res.status(200).json({
      ok: true,
      problemId: problem._id.toString(),
      triage: problem.triage,
    });
  } catch (error) {
    console.error('Triage error:', error);

    // Log triage.fail event
    const userId = (session?.user as any)?.id;
    if (userId && problemId) {
      await logEvent({
        type: 'triage.fail',
        userId,
        problemId,
        meta: { error: error instanceof Error ? error.message : String(error) }
      });
    }

    res.status(500).json({
      ok: false,
      error: 'Failed to triage problem',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
