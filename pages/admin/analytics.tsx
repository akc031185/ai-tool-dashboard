import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { APP_SHORT } from '@/src/lib/appMeta';
import { formatCost } from '@/src/lib/pricing';

interface AnalyticsData {
  ok: boolean;
  dateRange: {
    start: string;
    end: string;
    days: number;
  };
  summary: {
    totalProblems: number;
    totalEvents: number;
    totalLLMCalls: number;
    totalTokensIn: number;
    totalTokensOut: number;
    estimatedCost: number;
    todayEvents: number;
    todayProblems: number;
    todayLLMCalls: number;
  };
  timeSeries: Array<{
    date: string;
    problems: number;
    events: number;
    llmCalls: number;
    tokensIn: number;
    tokensOut: number;
  }>;
  llmByModel: Array<{
    model: string;
    totalTokensIn: number;
    totalTokensOut: number;
    totalCalls: number;
  }>;
  topDomains: Array<{
    domain: string;
    count: number;
  }>;
}

export default function Analytics() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(7);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin/analytics');
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    if (sessionStatus !== 'authenticated') return;
    fetchAnalytics();
  }, [sessionStatus, days]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch(`/api/admin/analytics?days=${days}`);

      if (res.status === 403) {
        setError('Access denied: Admin privileges required');
        setTimeout(() => router.push('/'), 2000);
        return;
      }

      if (!res.ok) throw new Error('Failed to fetch analytics');

      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{`Analytics - ${APP_SHORT}`}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50 pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
                <p className="text-gray-600">
                  Usage metrics and cost estimates • Logged in as{' '}
                  <span className="font-semibold text-purple-600">{session?.user?.email}</span>
                </p>
              </div>
              <Link
                href="/admin"
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                ← Back to Admin
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {data && (
            <>
              {/* Date Range Selector */}
              <div className="mb-6 bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">Time Range:</label>
                  <div className="flex gap-2">
                    {[7, 14, 30].map(d => (
                      <button
                        key={d}
                        onClick={() => setDays(d)}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          days === d
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {d} Days
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-auto">
                    {data.dateRange.start} to {data.dateRange.end}
                  </span>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Problems Created</h3>
                    <span className="text-2xl">📋</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{data.summary.totalProblems}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Today: {data.summary.todayProblems}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Total Events</h3>
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{data.summary.totalEvents}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Today: {data.summary.todayEvents}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">LLM API Calls</h3>
                    <span className="text-2xl">🤖</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{data.summary.totalLLMCalls}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Today: {data.summary.todayLLMCalls}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Estimated Cost</h3>
                    <span className="text-2xl">💰</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCost(data.summary.estimatedCost)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Last {days} days
                  </p>
                </div>
              </div>

              {/* Token Usage Card */}
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Token Usage</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Tokens</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(data.summary.totalTokensIn + data.summary.totalTokensOut).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Input Tokens</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {data.summary.totalTokensIn.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Output Tokens</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {data.summary.totalTokensOut.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Problems per Day Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Problems per Day</h2>
                  <div className="space-y-2">
                    {data.timeSeries.map((day, idx) => {
                      const maxProblems = Math.max(...data.timeSeries.map(d => d.problems), 1);
                      const width = (day.problems / maxProblems) * 100;
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-20">
                            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                            <div
                              className="bg-purple-600 h-full rounded-full flex items-center justify-end pr-2"
                              style={{ width: `${Math.max(width, 5)}%` }}
                            >
                              {day.problems > 0 && (
                                <span className="text-xs text-white font-medium">{day.problems}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tokens per Day Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Tokens per Day</h2>
                  <div className="space-y-2">
                    {data.timeSeries.map((day, idx) => {
                      const maxTokens = Math.max(...data.timeSeries.map(d => d.tokensIn + d.tokensOut), 1);
                      const totalTokens = day.tokensIn + day.tokensOut;
                      const width = (totalTokens / maxTokens) * 100;
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-20">
                            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full flex items-center justify-end pr-2"
                              style={{ width: `${Math.max(width, 5)}%` }}
                            >
                              {totalTokens > 0 && (
                                <span className="text-xs text-white font-medium">
                                  {(totalTokens / 1000).toFixed(1)}k
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tables Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LLM Usage by Model */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">LLM Usage by Model</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calls</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tokens</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.llmByModel.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                              No LLM usage data
                            </td>
                          </tr>
                        ) : (
                          data.llmByModel.map((model, idx) => (
                            <tr key={idx}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {model.model}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {model.totalCalls}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                <div className="flex flex-col">
                                  <span className="text-blue-600">
                                    ↓ {(model.totalTokensIn / 1000).toFixed(1)}k
                                  </span>
                                  <span className="text-purple-600">
                                    ↑ {(model.totalTokensOut / 1000).toFixed(1)}k
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Domains */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Top Domains</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domain</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.topDomains.length === 0 ? (
                          <tr>
                            <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                              No domain data
                            </td>
                          </tr>
                        ) : (
                          data.topDomains.map((domain, idx) => (
                            <tr key={idx}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {domain.domain}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {domain.count}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
