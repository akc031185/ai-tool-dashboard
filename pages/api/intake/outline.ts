import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/src/lib/dbConnect';
import Problem from '@/src/models/Problem';
import { callOpenAIJSON } from '@/src/lib/openai';
import { OutlineSchema } from '@/src/lib/schemas';
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

  const { problemId } = req.body;

  if (!problemId || typeof problemId !== 'string' || !mongoose.Types.ObjectId.isValid(problemId)) {
    return res.status(400).json({ message: 'Valid problemId is required' });
  }

  await dbConnect();

  try {
    const userId = (session.user as any).id;

    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    if (problem.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden: Not your problem' });
    }

    if (!problem.triage) {
      return res.status(400).json({ message: 'Problem must be triaged first' });
    }

    if (!problem.followUps || problem.followUps.length === 0) {
      return res.status(400).json({ message: 'Problem must have follow-up questions answered' });
    }

    // Check readiness
    const requiredQuestions = problem.followUps.filter((f: any) => f.required);
    const answeredRequired = requiredQuestions.filter((f: any) => f.answer && f.answer.trim().length > 0);
    const readinessPercent = requiredQuestions.length > 0
      ? Math.round((answeredRequired.length / requiredQuestions.length) * 100)
      : 100;

    if (readinessPercent < 80) {
      return res.status(400).json({
        message: 'At least 80% of required questions must be answered',
        readiness: {
          answeredRequired: answeredRequired.length,
          totalRequired: requiredQuestions.length,
          percent: readinessPercent,
        },
      });
    }

    // Build context for OpenAI
    const context = {
      rawDescription: problem.rawDescription,
      triage: problem.triage,
      followUps: problem.followUps,
    };

    const systemPrompt = `You are a solutions architect for real estate investors. Your job is to create a detailed build plan for workflow automation and AI solutions.

Return ONLY valid JSON (no prose) with this exact structure:
{
  "summary": "2-3 sentence summary of the solution approach",
  "requirements": ["Requirement 1", "Requirement 2", ...],
  "computePlan": {
    "estimatedCost": "e.g., $50-100/month for 1000 requests",
    "modelChoice": "e.g., GPT-4o-mini for classification, GPT-4o for generation",
    "apiCalls": "e.g., 2-3 calls per workflow execution",
    "reasoning": "Brief explanation of cost and model choices"
  },
  "mermaidDiagram": "flowchart TD\\n    A[Start] --> B[Step]\\n    B --> C[End]",
  "nextActions": ["Action 1", "Action 2", ...]
}

Guidelines:
- summary: Clear, concise overview of what will be built
- requirements: List of functional and technical requirements (5-10 items)
- computePlan: Detailed cost analysis if AI is involved, including model choices and API usage estimates
- mermaidDiagram: Valid Mermaid flowchart syntax showing the workflow. Use "flowchart TD" or "flowchart LR" format
- nextActions: Concrete next steps for implementation (3-5 items)

Be specific, practical, and actionable. Focus on real estate investor needs.`;

    const userPrompt = `Problem context:

Original description: ${context.rawDescription}

Triage classification:
- Kind: ${context.triage.kind.join(', ')}
- Domains: ${context.triage.domains.map((d: any) => `${d.label} (${d.score})`).join(', ')}
- Tags: ${context.triage.other_tags.join(', ')}
- Notes: ${context.triage.notes}

Follow-up Q&A:
${context.followUps.map((f: any) => `Q: ${f.question}\nA: ${f.answer || '(not answered)'}`).join('\n\n')}

Create a comprehensive build plan for this solution.`;

    let outlineResult = await callOpenAIJSON({
      model: 'gpt-4o',
      system: systemPrompt,
      user: userPrompt,
      maxTokens: 2000,
      temperature: 0.3,
    });

    // Validate with Zod schema
    let validatedOutline;
    try {
      validatedOutline = OutlineSchema.parse(outlineResult);
    } catch (error) {
      if (error instanceof ZodError) {
        // Retry with fix-to-schema instruction
        console.log('Outline validation failed, retrying with schema fix instruction:', error.errors);

        outlineResult = await callOpenAIJSON({
          model: 'gpt-4o',
          system: systemPrompt + '\n\nIMPORTANT: Your previous response had validation errors. Ensure the JSON strictly matches the schema.',
          user: userPrompt + `\n\nPrevious validation errors: ${JSON.stringify(error.errors)}`,
          maxTokens: 2000,
          temperature: 0.3,
        });

        try {
          validatedOutline = OutlineSchema.parse(outlineResult);
        } catch (retryError) {
          return res.status(422).json({
            ok: false,
            error: 'Invalid outline response from AI',
            details: retryError instanceof ZodError ? retryError.errors : String(retryError)
          });
        }
      } else {
        throw error;
      }
    }

    // Save validated outline to problem
    problem.solutionOutline = JSON.stringify(validatedOutline);
    problem.status = 'in-progress'; // Update status to in-progress
    await problem.save();

    res.status(200).json({
      ok: true,
      problemId: problem._id.toString(),
      outline: validatedOutline,
    });
  } catch (error) {
    console.error('Outline generation error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to generate outline',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
