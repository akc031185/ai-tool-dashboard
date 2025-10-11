import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { APP_SHORT, PRIMARY_CTA } from '@/src/lib/appMeta';

export default function SubmitProblem() {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>{PRIMARY_CTA.label} - {APP_SHORT}</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {PRIMARY_CTA.label}
            </h1>

            {session && (
              <div className="mb-6">
                <p className="text-lg text-gray-600">
                  Welcome, <span className="font-semibold text-purple-600">{session.user?.name}</span>!
                </p>
              </div>
            )}

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                🚧 Coming Soon
              </h2>
              <p className="text-gray-700">
                This page will allow you to describe your real estate workflow problems.
                Our AI will triage whether it needs automation or AI, and generate a build plan for you!
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Description
                </label>
                <textarea
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
                  placeholder="Describe your workflow problem here... (Coming soon)"
                  disabled
                />
              </div>

              <button
                disabled
                className="w-full bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg cursor-not-allowed"
              >
                Submit Problem (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
