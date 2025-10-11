import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { APP_SHORT, TRACKER_CTA } from '@/src/lib/appMeta';

export default function ProjectTracker() {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>{TRACKER_CTA.label} - {APP_SHORT}</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {TRACKER_CTA.label}
            </h1>

            {session && (
              <div className="mb-6">
                <p className="text-lg text-gray-600">
                  Welcome back, <span className="font-semibold text-purple-600">{session.user?.name}</span>!
                </p>
              </div>
            )}

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                🚧 Coming Soon
              </h2>
              <p className="text-gray-700">
                This page will display all your submitted problems and their build plan status.
                We're working on building this feature!
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">📋 Total Submissions</h3>
                <p className="text-3xl font-bold text-purple-600">0</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">⚙️ In Progress</h3>
                <p className="text-3xl font-bold text-blue-600">0</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">✅ Completed</h3>
                <p className="text-3xl font-bold text-green-600">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
