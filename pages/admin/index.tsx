import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { APP_SHORT } from '@/src/lib/appMeta';

interface Problem {
  _id: string;
  rawDescription: string;
  status: 'draft' | 'in-progress' | 'complete';
  triage?: {
    kind: string[];
    domains: Array<{ label: string; score: number }>;
  };
  solutionOutline?: string;
  userId: {
    _id: string;
    email: string;
    name: string;
  };
  assigneeId?: {
    _id: string;
    email: string;
    name: string;
  };
  adminLocked?: boolean;
  rfis?: Array<{
    _id: string;
    question: string;
    answer?: string;
    status: 'open' | 'answered' | 'closed';
    priority?: 'low' | 'normal' | 'high';
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export default function AdminConsole() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [selectedRfiProblem, setSelectedRfiProblem] = useState<Problem | null>(null);

  // Filters
  const [kindFilter, setKindFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [outlineFilter, setOutlineFilter] = useState('all');

  // Edit triage drawer
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [editKind, setEditKind] = useState<string[]>([]);
  const [editDomains, setEditDomains] = useState('');
  const [editSubdomains, setEditSubdomains] = useState('');
  const [editTags, setEditTags] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin');
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    if (sessionStatus !== 'authenticated') return;
    fetchProblems();
    fetchUsers();
  }, [sessionStatus, kindFilter, domainFilter, statusFilter, outlineFilter]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (kindFilter !== 'all') params.append('kind', kindFilter);
      if (domainFilter !== 'all') params.append('domain', domainFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (outlineFilter !== 'all') params.append('hasOutline', outlineFilter);

      const res = await fetch(`/api/admin/problems?${params.toString()}`);

      if (res.status === 403) {
        setError('Access denied: Admin privileges required');
        setTimeout(() => router.push('/'), 2000);
        return;
      }

      if (!res.ok) throw new Error('Failed to fetch problems');

      const data = await res.json();
      setProblems(data.problems || []);
      setDomains(data.domains || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch problems');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleEditTriage = (problem: Problem) => {
    setEditingProblem(problem);
    setEditKind(problem.triage?.kind || []);
    setEditDomains(problem.triage?.domains?.map(d => `${d.label}:${d.score}`).join(', ') || '');
    setEditSubdomains('');
    setEditTags('');
  };

  const saveTriage = async () => {
    if (!editingProblem) return;
    setSaving(true);

    try {
      const domains = editDomains.split(',').map(d => {
        const parts = d.trim().split(':');
        return { label: parts[0], score: parts[1] ? parseFloat(parts[1]) : 0.5 };
      }).filter(d => d.label);

      const subdomains = editSubdomains.split(',').map(d => {
        const parts = d.trim().split(':');
        return { label: parts[0], score: parts[1] ? parseFloat(parts[1]) : 0.5 };
      }).filter(d => d.label);

      const other_tags = editTags.split(',').map(t => t.trim()).filter(Boolean);

      const triageData = {
        kind: editKind,
        kind_scores: {
          AI: editKind.includes('AI') ? 0.8 : 0.0,
          Automation: editKind.includes('Automation') ? 0.8 : 0.0,
          Hybrid: editKind.includes('Hybrid') ? 0.8 : 0.0
        },
        domains,
        subdomains,
        other_tags,
        needs_more_info: false,
        missing_info: [],
        risk_flags: [],
        notes: 'Admin edited'
      };

      const res = await fetch(`/api/admin/problems/${editingProblem._id}/triage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triage: triageData })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to save triage');
      }

      setToast('Triage updated successfully');
      setTimeout(() => setToast(''), 3000);
      setEditingProblem(null);
      fetchProblems();
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to save triage');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (problemId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/problems/${problemId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update status');
      }

      setToast('Status updated successfully');
      setTimeout(() => setToast(''), 3000);
      fetchProblems();
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to update status');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleAssigneeChange = async (problemId: string, assigneeId: string | null) => {
    try {
      const res = await fetch(`/api/admin/problems/${problemId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigneeId })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update assignee');
      }

      setToast('Assignee updated successfully');
      setTimeout(() => setToast(''), 3000);
      fetchProblems();
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to update assignee');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleLockToggle = async (problemId: string, currentLocked: boolean) => {
    try {
      const res = await fetch(`/api/admin/problems/${problemId}/lock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminLocked: !currentLocked })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to toggle lock');
      }

      setToast(currentLocked ? 'Problem unlocked' : 'Problem locked');
      setTimeout(() => setToast(''), 3000);
      fetchProblems();
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to toggle lock');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const toggleKind = (kind: string) => {
    if (editKind.includes(kind)) {
      setEditKind(editKind.filter(k => k !== kind));
    } else {
      setEditKind([...editKind, kind]);
    }
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin console...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{`Admin Console - ${APP_SHORT}`}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50 pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Console</h1>
            <p className="text-gray-600">
              Manage and moderate all problems • Logged in as{' '}
              <span className="font-semibold text-purple-600">{session?.user?.email}</span>
            </p>
          </div>

          {toast && <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">{toast}</div>}
          {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kind</label>
                <select value={kindFilter} onChange={(e) => setKindFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                  <option value="all">All</option>
                  <option value="AI">AI</option>
                  <option value="Automation">Automation</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
                <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                  <option value="all">All</option>
                  {domains.map(d => (<option key={d} value={d}>{d}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                  <option value="all">All</option>
                  <option value="draft">Draft</option>
                  <option value="in-progress">In Progress</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Has Outline</label>
                <select value={outlineFilter} onChange={(e) => setOutlineFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                  <option value="all">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RFIs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {problems.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No problems found</td></tr>
                ) : (
                  problems.map((problem) => (
                    <tr key={problem._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(problem.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{problem.userId.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          value={problem.assigneeId?._id || ''}
                          onChange={(e) => handleAssigneeChange(problem._id, e.target.value || null)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                          <option value="">Unassigned</option>
                          {users.map(user => (
                            <option key={user._id} value={user._id}>{user.email}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {problem.adminLocked && <span className="mr-2" title="Locked">🔒</span>}
                        {problem.rawDescription}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          value={problem.status}
                          onChange={(e) => handleStatusChange(problem._id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-purple-500 outline-none ${
                            problem.status === 'complete' ? 'bg-green-100 text-green-700' :
                            problem.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <option value="draft">draft</option>
                          <option value="in-progress">in-progress</option>
                          <option value="complete">complete</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {problem.rfis && problem.rfis.length > 0 ? (
                          <button
                            onClick={() => setSelectedRfiProblem(problem)}
                            className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium hover:bg-orange-200"
                          >
                            {problem.rfis.length} RFI{problem.rfis.length > 1 ? 's' : ''}
                          </button>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Link href={`/problems/${problem._id}`} className="text-purple-600 hover:text-purple-700 font-medium">Open</Link>
                          <button
                            onClick={() => handleLockToggle(problem._id, problem.adminLocked || false)}
                            className={`font-medium ${problem.adminLocked ? 'text-red-600 hover:text-red-700' : 'text-orange-600 hover:text-orange-700'}`}
                          >
                            {problem.adminLocked ? 'Unlock' : 'Lock'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingProblem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Triage</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kind</label>
                <div className="flex gap-3">
                  {['AI', 'Automation', 'Hybrid'].map(kind => (
                    <button key={kind} onClick={() => toggleKind(kind)} className={`px-4 py-2 rounded-lg font-medium ${editKind.includes(kind) ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{kind}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Domains (label:score, ...)</label>
                <input type="text" value={editDomains} onChange={(e) => setEditDomains(e.target.value)} placeholder="Property Management:0.9" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subdomains (label:score, ...)</label>
                <input type="text" value={editSubdomains} onChange={(e) => setEditSubdomains(e.target.value)} placeholder="Tenant Screening:0.8" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                <input type="text" value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="NLP, Classification" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setEditingProblem(null)} disabled={saving} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={saveTriage} disabled={saving} className={`px-4 py-2 rounded-lg font-semibold ${saving ? 'bg-gray-300 text-gray-500' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedRfiProblem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">RFIs for Problem</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedRfiProblem.rawDescription}</p>
              </div>
              <button onClick={() => setSelectedRfiProblem(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {selectedRfiProblem.rfis && selectedRfiProblem.rfis.length > 0 ? (
                selectedRfiProblem.rfis.map(rfi => (
                  <div key={rfi._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            rfi.status === 'closed' ? 'bg-gray-100 text-gray-700' :
                            rfi.status === 'answered' ? 'bg-green-100 text-green-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {rfi.status}
                          </span>
                          {rfi.priority && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              rfi.priority === 'high' ? 'bg-red-100 text-red-700' :
                              rfi.priority === 'low' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {rfi.priority}
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-gray-900">{rfi.question}</p>
                        {rfi.answer && (
                          <div className="mt-2 pl-4 border-l-2 border-gray-200">
                            <p className="text-sm text-gray-700">{rfi.answer}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Created: {new Date(rfi.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No RFIs found</p>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button onClick={() => setSelectedRfiProblem(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
