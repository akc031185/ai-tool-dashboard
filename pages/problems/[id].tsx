import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { APP_SHORT, TRACKER_CTA } from '@/src/lib/appMeta';
import MermaidRenderer from '@/src/components/MermaidRenderer';

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
  answer?: string;
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

interface RFI {
  _id: string;
  createdAt: string;
  createdBy: {
    _id: string;
    email: string;
  };
  question: string;
  answer?: string;
  answeredAt?: string;
  dueAt?: string;
  priority?: 'low' | 'normal' | 'high';
  status: 'open' | 'answered' | 'closed';
}

interface Activity {
  _id: string;
  at: string;
  by: {
    _id: string;
    email: string;
  };
  type: string;
  note?: string;
  meta?: Record<string, any>;
}

interface Problem {
  _id: string;
  rawDescription: string;
  status: 'draft' | 'in-progress' | 'complete';
  triage?: TriageResult;
  followUps?: Question[];
  solutionOutline?: string;
  userId: {
    _id: string;
    email: string;
  };
  assigneeId?: {
    _id: string;
    email: string;
  };
  adminLocked?: boolean;
  rfis?: RFI[];
  activity?: Activity[];
  createdAt: string;
  updatedAt: string;
}

export default function ProblemDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [outline, setOutline] = useState<Outline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copyToast, setCopyToast] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchProblem = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/problems/${id}`);

        if (!res.ok) {
          throw new Error('Problem not found');
        }

        const data = await res.json();
        setProblem(data.problem);

        if (data.problem.solutionOutline) {
          setOutline(JSON.parse(data.problem.solutionOutline));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load problem');
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

  const copyToClipboard = async (data: any, label: string) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopyToast(`${label} copied!`);
      setTimeout(() => setCopyToast(''), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setCopyToast('Failed to copy');
      setTimeout(() => setCopyToast(''), 3000);
    }
  };

  const downloadPDF = async () => {
    if (!outline) {
      setCopyToast('Generate outline first');
      setTimeout(() => setCopyToast(''), 3000);
      return;
    }

    setPdfLoading(true);

    try {
      const res = await fetch('/api/export/outline-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: id }),
      });

      if (!res.ok) {
        throw new Error('PDF export failed');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `build-plan-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('PDF download error:', err);
      setCopyToast('PDF export failed. Please try again.');
      setTimeout(() => setCopyToast(''), 3000);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/problems/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete problem');
      }

      setCopyToast('Problem deleted successfully');
      setTimeout(() => {
        router.push(TRACKER_CTA.href);
      }, 1000);
    } catch (err) {
      console.error('Delete error:', err);
      setCopyToast('Failed to delete problem. Please try again.');
      setTimeout(() => setCopyToast(''), 3000);
    } finally {
      setDeleteLoading(false);
      setShowDeleteDialog(false);
      setDeleteConfirmText('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <>
        <Head>
          <title>{`Problem Not Found - ${APP_SHORT}`}</title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Problem Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href={TRACKER_CTA.href}
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Back to Tracker
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`Build Plan - ${APP_SHORT}`}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="mb-6 flex items-center justify-between">
            <Link
              href={TRACKER_CTA.href}
              className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
            >
              ← Back to Tracker
            </Link>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              problem.status === 'complete' ? 'bg-green-100 text-green-700' :
              problem.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {problem.status.charAt(0).toUpperCase() + problem.status.slice(1).replace('-', ' ')}
            </span>
          </div>

          {copyToast && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
              {copyToast}
            </div>
          )}

          {/* Problem Description */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Build Plan</h1>
            <p className="text-gray-700 leading-relaxed">{problem.rawDescription}</p>
          </div>

          {/* Triage Results */}
          {problem.triage && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Triage Results</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => copyToClipboard(problem.triage, 'Triage JSON')}
                    className="text-sm text-gray-600 hover:text-purple-600 underline transition"
                  >
                    Copy Triage JSON
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm('Re-run triage? This will update the classification.')) return;
                      try {
                        const res = await fetch('/api/intake/triage', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            problemId: id,
                            rawDescription: problem.rawDescription,
                          }),
                        });
                        if (res.ok) {
                          setCopyToast('Triage updated successfully');
                          setTimeout(() => router.reload(), 1500);
                        } else {
                          throw new Error('Failed to re-run triage');
                        }
                      } catch (err) {
                        setCopyToast('Failed to re-run triage');
                        setTimeout(() => setCopyToast(''), 3000);
                      }
                    }}
                    className="text-sm px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                  >
                    Re-run Triage
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Classification:</h3>
                <div className="flex flex-wrap gap-2">
                  {problem.triage.kind.map((k) => (
                    <span key={k} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                      {k} ({Math.round(problem.triage!.kind_scores[k as keyof typeof problem.triage.kind_scores] * 100)}%)
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Domains:</h3>
                <div className="flex flex-wrap gap-2">
                  {problem.triage.domains.map((d) => (
                    <span key={d.label} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {d.label} ({Math.round(d.score * 100)}%)
                    </span>
                  ))}
                </div>
              </div>

              {problem.triage.other_tags.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {problem.triage.other_tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {problem.triage.risk_flags.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-red-700 mb-2">Risk Flags:</h3>
                  <ul className="list-disc list-inside text-sm text-red-600">
                    {problem.triage.risk_flags.map((flag, i) => (
                      <li key={i}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {problem.triage.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm text-gray-700">{problem.triage.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Follow-up Q&A */}
          {problem.followUps && problem.followUps.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Follow-up Questions & Answers</h2>
              <div className="space-y-4">
                {problem.followUps.map((q, index) => (
                  <div key={q.id || index} className="border-l-4 border-purple-500 pl-4">
                    <p className="font-semibold text-gray-900 mb-2">
                      {q.question}
                      {q.required && <span className="text-red-500 ml-1">*</span>}
                    </p>
                    <p className="text-gray-700">{q.answer || <em className="text-gray-400">Not answered</em>}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Solution Outline */}
          {outline && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Solution Outline</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => copyToClipboard(outline, 'Outline JSON')}
                    className="text-sm text-gray-600 hover:text-purple-600 underline transition"
                  >
                    Copy Outline JSON
                  </button>
                  <button
                    onClick={downloadPDF}
                    disabled={pdfLoading}
                    className={`text-sm px-3 py-1 rounded transition ${
                      pdfLoading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {pdfLoading ? 'Downloading...' : 'Download PDF'}
                  </button>
                </div>
              </div>

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
            </div>
          )}

          {/* Danger Zone */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-red-900 mb-2">Danger Zone</h2>
            <p className="text-sm text-red-700 mb-4">
              Once you delete this problem, there is no going back. Please be certain.
            </p>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Delete Problem
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Problem?</h3>
            <p className="text-gray-700 mb-4">
              This action cannot be undone. This will permanently delete your problem and all associated data.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Please type <span className="font-mono font-bold">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none mb-6"
              placeholder="Type DELETE to confirm"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmText('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  deleteConfirmText === 'DELETE' && !deleteLoading
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Problem'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
