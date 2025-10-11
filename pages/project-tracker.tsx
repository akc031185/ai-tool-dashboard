import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import useSWR, { mutate } from 'swr';
import { APP_SHORT, TRACKER_CTA, PRIMARY_CTA } from '@/src/lib/appMeta';

type ProblemStatus = 'draft' | 'in-progress' | 'complete';

interface Problem {
  _id: string;
  rawDescription: string;
  status: ProblemStatus;
  triage?: {
    kind: 'AI' | 'Automation' | 'Hybrid';
    domains: string[];
  };
  followUps?: Array<{ question: string; answer?: string }>;
  solutionOutline?: string;
  updatedAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProjectTracker() {
  const { data: session } = useSession();
  const [view, setView] = useState<'kanban' | 'timeline'>('kanban');
  const [filter, setFilter] = useState<'all' | ProblemStatus>('all');
  const [search, setSearch] = useState('');

  const { data, error } = useSWR<{ success: boolean; problems: Problem[] }>(
    '/api/problems/list',
    fetcher
  );

  const problems = data?.problems || [];

  // Filter and search
  const filteredProblems = problems.filter((p) => {
    const matchesFilter = filter === 'all' || p.status === filter;
    const matchesSearch = search === '' || p.rawDescription.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const updateStatus = async (problemId: string, newStatus: ProblemStatus) => {
    try {
      const res = await fetch(`/api/problems/${problemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        mutate('/api/problems/list');
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const ProblemCard = ({ problem }: { problem: Problem }) => (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-md transition">
      <p className="text-sm text-gray-800 mb-3 line-clamp-3">{problem.rawDescription}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {problem.triage?.kind && (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
            {problem.triage.kind}
          </span>
        )}
        {problem.triage?.domains && problem.triage.domains[0] && (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
            {problem.triage.domains[0]}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>{getRelativeTime(problem.updatedAt)}</span>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={problem.status}
          onChange={(e) => updateStatus(problem._id, e.target.value as ProblemStatus)}
          className="text-xs border border-gray-300 rounded px-2 py-1 flex-1"
        >
          <option value="draft">Draft</option>
          <option value="in-progress">In Progress</option>
          <option value="complete">Complete</option>
        </select>

        <Link
          href={`/problems/${problem._id}`}
          className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition"
        >
          Open
        </Link>
      </div>
    </div>
  );

  const TimelineView = ({ problem }: { problem: Problem }) => {
    const milestones = [
      { label: 'Submitted', reached: true },
      { label: 'Triaged', reached: !!problem.triage },
      {
        label: 'Q&A 50%',
        reached: problem.followUps && problem.followUps.length >= 3,
      },
      { label: 'Outline Generated', reached: !!problem.solutionOutline },
      { label: 'Implementation Started', reached: problem.status === 'in-progress' || problem.status === 'complete' },
      { label: 'Complete', reached: problem.status === 'complete' },
    ];

    const currentStepIndex = milestones.findIndex((m) => !m.reached);

    return (
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-4">
        <h3 className="font-semibold text-gray-900 mb-4 line-clamp-2">{problem.rawDescription}</h3>

        <div className="space-y-4">
          {milestones.map((milestone, index) => {
            const isActive = index === currentStepIndex;
            const isComplete = milestone.reached;

            return (
              <div key={index} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isComplete
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {isComplete ? '✓' : index + 1}
                  </div>
                  {index < milestones.length - 1 && (
                    <div className={`w-0.5 h-8 ${isComplete ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>

                <div className="flex-1 pt-1">
                  <p
                    className={`text-sm font-medium ${
                      isComplete ? 'text-green-700' : isActive ? 'text-purple-700' : 'text-gray-500'
                    }`}
                  >
                    {milestone.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link
            href={`/problems/${problem._id}`}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            View Details →
          </Link>
        </div>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>{`${TRACKER_CTA.label} - ${APP_SHORT}`}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{TRACKER_CTA.label}</h1>
            {session && (
              <p className="text-gray-600">
                Welcome back, <span className="font-semibold text-purple-600">{session.user?.name}</span>
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              {/* Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {(['all', 'draft', 'in-progress', 'complete'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      filter === f
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Search problems..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setView('kanban')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  view === 'kanban'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 Kanban
              </button>
              <button
                onClick={() => setView('timeline')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  view === 'timeline'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📈 Timeline
              </button>
            </div>
          </div>

          {/* Content */}
          {filteredProblems.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">No problems yet</h2>
              <p className="text-gray-600 mb-6">Start by submitting your first problem to track</p>
              <Link
                href={PRIMARY_CTA.href}
                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                {PRIMARY_CTA.label}
              </Link>
            </div>
          ) : view === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Draft Column */}
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                  Draft ({filteredProblems.filter((p) => p.status === 'draft').length})
                </h2>
                <div className="space-y-3">
                  {filteredProblems
                    .filter((p) => p.status === 'draft')
                    .map((p) => (
                      <ProblemCard key={p._id} problem={p} />
                    ))}
                </div>
              </div>

              {/* In Progress Column */}
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  In Progress ({filteredProblems.filter((p) => p.status === 'in-progress').length})
                </h2>
                <div className="space-y-3">
                  {filteredProblems
                    .filter((p) => p.status === 'in-progress')
                    .map((p) => (
                      <ProblemCard key={p._id} problem={p} />
                    ))}
                </div>
              </div>

              {/* Complete Column */}
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  Complete ({filteredProblems.filter((p) => p.status === 'complete').length})
                </h2>
                <div className="space-y-3">
                  {filteredProblems
                    .filter((p) => p.status === 'complete')
                    .map((p) => (
                      <ProblemCard key={p._id} problem={p} />
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredProblems.map((p) => (
                <TimelineView key={p._id} problem={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
