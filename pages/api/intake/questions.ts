import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/src/lib/dbConnect';
import Problem from '@/src/models/Problem';
import mongoose from 'mongoose';

// Deterministic question generation based on triage
function generateQuestions(triage: any): Array<{ id: string; question: string; required: boolean }> {
  const questions: Array<{ id: string; question: string; required: boolean }> = [];
  const { kind, domains, subdomains, needs_more_info, missing_info } = triage;

  // Base questions for all problems
  questions.push({
    id: 'q_volume',
    question: 'What is the expected volume or frequency of this workflow? (e.g., daily, weekly, monthly, per transaction)',
    required: true,
  });

  questions.push({
    id: 'q_current_process',
    question: 'How do you currently handle this process? (e.g., manual, spreadsheet, existing software)',
    required: true,
  });

  // AI-specific questions
  if (kind.includes('AI')) {
    questions.push({
      id: 'q_ai_decision_criteria',
      question: 'What criteria or factors should the AI consider when making decisions?',
      required: true,
    });

    questions.push({
      id: 'q_ai_training_data',
      question: 'Do you have existing data or examples that can be used to train or guide the AI?',
      required: false,
    });
  }

  // Automation-specific questions
  if (kind.includes('Automation')) {
    questions.push({
      id: 'q_automation_triggers',
      question: 'What event or condition should trigger this automation?',
      required: true,
    });

    questions.push({
      id: 'q_automation_integrations',
      question: 'Which systems or tools need to be integrated? (e.g., CRM, email, database, APIs)',
      required: true,
    });
  }

  // Domain-specific questions
  const domainLabels = domains.map((d: any) => d.label.toLowerCase());

  if (domainLabels.some((d: string) => d.includes('property') || d.includes('management'))) {
    questions.push({
      id: 'q_property_count',
      question: 'How many properties or units does this affect?',
      required: false,
    });
  }

  if (domainLabels.some((d: string) => d.includes('lead') || d.includes('marketing'))) {
    questions.push({
      id: 'q_lead_sources',
      question: 'What are your primary lead sources? (e.g., website, referrals, ads)',
      required: false,
    });
  }

  if (domainLabels.some((d: string) => d.includes('document') || d.includes('data'))) {
    questions.push({
      id: 'q_document_types',
      question: 'What types of documents or data are involved? (e.g., leases, invoices, reports)',
      required: true,
    });

    questions.push({
      id: 'q_data_format',
      question: 'In what format is the data currently stored? (e.g., PDF, Excel, database, paper)',
      required: false,
    });
  }

  if (domainLabels.some((d: string) => d.includes('financial') || d.includes('accounting'))) {
    questions.push({
      id: 'q_financial_systems',
      question: 'What accounting or financial software do you currently use?',
      required: false,
    });
  }

  if (domainLabels.some((d: string) => d.includes('communication') || d.includes('tenant'))) {
    questions.push({
      id: 'q_communication_channels',
      question: 'What communication channels do you use? (e.g., email, SMS, phone, portal)',
      required: false,
    });
  }

  // Add missing_info as required questions
  if (needs_more_info && missing_info && missing_info.length > 0) {
    missing_info.forEach((info: string, index: number) => {
      questions.push({
        id: `q_missing_${index}`,
        question: info,
        required: true,
      });
    });
  }

  // Add a catch-all question
  questions.push({
    id: 'q_additional_context',
    question: 'Is there any additional context, constraints, or requirements we should know about?',
    required: false,
  });

  return questions;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { problemId } = req.query;

  if (!problemId || typeof problemId !== 'string' || !mongoose.Types.ObjectId.isValid(problemId)) {
    return res.status(400).json({ message: 'Valid problemId query parameter is required' });
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

    const questions = generateQuestions(problem.triage);

    res.status(200).json({
      ok: true,
      questions,
    });
  } catch (error) {
    console.error('Questions generation error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to generate questions',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
