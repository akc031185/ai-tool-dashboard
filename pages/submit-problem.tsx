import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { APP_SHORT, PRIMARY_CTA, TRACKER_CTA } from '@/src/lib/appMeta';
import MermaidRenderer from '@/src/components/MermaidRenderer';

type Step = 'description' | 'triage' | 'questions' | 'outline';

interface TriageResult {
  kind: string[];
  kind_scores: { AI: number; Automation: number; Hybrid: number };
  domains: Array<{ label: string; score: number }>;
  subdomains: Array<{ label: string; score: number }>;
  other_tags: string[];
  needs_more_info: boolean;
  missing_info: string[];
  risk_flags: string[];
  notes: string;
}

interface Question {
  id: string;
  question: string;
  required: boolean;
}

interface Outline {
  summary: string;
  requirements: string[];
  computePlan: {
    estimatedCost: string;
    modelChoice: string;
    apiCalls: string;
    reasoning: string;
  };
  mermaidDiagram: string;
  nextActions: string[];
}

export default function SubmitProblem() {
  const { data: session } = useSession();
  const [step, setStep] = useState<Step>('description');
  const [problemId, setProblemId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [triage, setTriage] = useState<TriageResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [outline, setOutline] = useState<Outline | null>(null);
  const [readiness, setReadiness] = useState({ answeredRequired: 0, totalRequired: 0, percent: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runTriage = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/intake/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawDescription: description, problemId: problemId || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to triage problem');
      }

      setProblemId(data.problemId);
      setTriage(data.triage);
      setStep('triage');

      // Fetch questions
      const questionsRes = await fetch(`/api/intake/questions?problemId=${data.problemId}`);
      const questionsData = await questionsRes.json();

      if (questionsRes.ok) {
        setQuestions(questionsData.questions);
        setStep('questions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const saveAnswers = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/intake/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId, answers, questions }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to save answers');
      }

      setReadiness(data.readiness);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateOutline = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/intake/outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to generate outline');
      }

      setOutline(data.outline);
      setStep('outline');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  return (
    <>
      <Head>
        <title>{`${PRIMARY_CTA.label} - ${APP_SHORT}`}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{PRIMARY_CTA.label}</h1>
            <p className="text-gray-600">Describe your workflow problem and get an AI-powered build plan</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Problem Description */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Describe Your Problem</h2>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your workflow problem in detail. Be specific about what you're trying to accomplish, current challenges, and desired outcomes."
              className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
              disabled={loading}
            />
            <button
              onClick={runTriage}
              disabled={!description.trim() || loading}
              className={`mt-4 px-6 py-3 rounded-lg font-semibold transition ${
                !description.trim() || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {loading ? 'Running Triage...' : 'Run Triage'}
            </button>
          </div>

          {/* Step 2: Triage Results */}
          {triage && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Triage Results</h2>

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Classification:</h3>
                <div className="flex flex-wrap gap-2">
                  {triage.kind.map((k) => (
                    <span key={k} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                      {k} ({Math.round(triage.kind_scores[k as keyof typeof triage.kind_scores] * 100)}%)
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Domains:</h3>
                <div className="flex flex-wrap gap-2">
                  {triage.domains.map((d) => (
                    <span key={d.label} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {d.label} ({Math.round(d.score * 100)}%)
                    </span>
                  ))}
                </div>
              </div>

              {triage.other_tags.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {triage.other_tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {triage.risk_flags.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-red-700 mb-2">Risk Flags:</h3>
                  <ul className="list-disc list-inside text-sm text-red-600">
                    {triage.risk_flags.map((flag, i) => (
                      <li key={i}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {triage.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm text-gray-700">{triage.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Follow-up Questions */}
          {questions.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Follow-up Questions</h2>

              <div className="space-y-4 mb-6">
                {questions.map((q) => (
                  <div key={q.id}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {q.question}
                      {q.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <textarea
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      onBlur={saveAnswers}
                      placeholder="Type your answer here..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                      rows={3}
                    />
                  </div>
                ))}
              </div>

              {readiness.totalRequired > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      Readiness: {readiness.answeredRequired} / {readiness.totalRequired} required questions answered
                    </span>
                    <span className={`text-sm font-bold ${readiness.percent >= 80 ? 'text-green-600' : 'text-gray-600'}`}>
                      {readiness.percent}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        readiness.percent >= 80 ? 'bg-green-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${readiness.percent}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={generateOutline}
                disabled={readiness.percent < 80 || loading}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  readiness.percent < 80 || loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {loading ? 'Generating Outline...' : 'Generate Solution Outline'}
              </button>
            </div>
          )}

          {/* Step 4: Solution Outline */}
          {outline && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Solution Outline</h2>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Summary</h3>
                <p className="text-gray-700">{outline.summary}</p>
              </div>

              <details className="mb-4" open>
                <summary className="text-lg font-semibold text-gray-800 cursor-pointer mb-2">
                  Requirements ({outline.requirements.length})
                </summary>
                <ul className="list-disc list-inside space-y-1 text-gray-700 pl-4">
                  {outline.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </details>

              {outline.computePlan && (
                <details className="mb-4">
                  <summary className="text-lg font-semibold text-gray-800 cursor-pointer mb-2">
                    Compute Plan
                  </summary>
                  <div className="space-y-2 pl-4">
                    <p className="text-sm">
                      <span className="font-semibold">Estimated Cost:</span> {outline.computePlan.estimatedCost}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Model Choice:</span> {outline.computePlan.modelChoice}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">API Calls:</span> {outline.computePlan.apiCalls}
                    </p>
                    <p className="text-sm text-gray-700">{outline.computePlan.reasoning}</p>
                  </div>
                </details>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Workflow Diagram</h3>
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                  <MermaidRenderer code={outline.mermaidDiagram} />
                </div>
              </div>

              <details className="mb-6" open>
                <summary className="text-lg font-semibold text-gray-800 cursor-pointer mb-2">
                  Next Actions ({outline.nextActions.length})
                </summary>
                <ol className="list-decimal list-inside space-y-1 text-gray-700 pl-4">
                  {outline.nextActions.map((action, i) => (
                    <li key={i}>{action}</li>
                  ))}
                </ol>
              </details>

              <div className="flex gap-4">
                <Link
                  href={TRACKER_CTA.href}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  View in Tracker
                </Link>
                <button
                  onClick={() => {
                    setStep('description');
                    setDescription('');
                    setTriage(null);
                    setQuestions([]);
                    setAnswers({});
                    setOutline(null);
                    setProblemId('');
                    setReadiness({ answeredRequired: 0, totalRequired: 0, percent: 0 });
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Submit Another Problem
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
