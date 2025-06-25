import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white text-center">
      <div>
        <h1 className="text-4xl font-bold mb-6">🚀 Welcome to AI Tool Dashboard</h1>
        <div className="space-x-4">
          <Link href="/submit-ai-tool">
            <button className="bg-white text-pink-500 px-6 py-3 rounded font-semibold hover:bg-gray-200">
              Submit AI Tool Request
            </button>
          </Link>
          <Link href="/dashboard/tools">
            <button className="bg-white text-pink-500 px-6 py-3 rounded font-semibold hover:bg-gray-200">
              View AI Tool Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
