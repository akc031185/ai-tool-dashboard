import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/src/lib/dbConnect';
import Problem from '@/src/models/Problem';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { problemId, answers, questions } = req.body;

  if (!problemId || typeof problemId !== 'string' || !mongoose.Types.ObjectId.isValid(problemId)) {
    return res.status(400).json({ message: 'Valid problemId is required' });
  }

  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ message: 'answers object is required' });
  }

  if (!questions || !Array.isArray(questions)) {
    return res.status(400).json({ message: 'questions array is required' });
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

    // Build followUps array from questions and answers
    const followUps = questions.map((q: any) => ({
      id: q.id,
      question: q.question,
      answer: answers[q.id] || '',
      required: q.required || false,
    }));

    problem.followUps = followUps;
    await problem.save();

    // Calculate readiness stats
    const requiredQuestions = followUps.filter((f: any) => f.required);
    const answeredRequired = requiredQuestions.filter((f: any) => f.answer && f.answer.trim().length > 0);
    const readinessPercent = requiredQuestions.length > 0
      ? Math.round((answeredRequired.length / requiredQuestions.length) * 100)
      : 100;

    res.status(200).json({
      ok: true,
      problemId: problem._id.toString(),
      followUps: problem.followUps,
      readiness: {
        answeredRequired: answeredRequired.length,
        totalRequired: requiredQuestions.length,
        percent: readinessPercent,
        canGenerateOutline: readinessPercent >= 80,
      },
    });
  } catch (error) {
    console.error('Answers save error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to save answers',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
