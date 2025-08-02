import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
          🚀 Welcome to AI Tool Dashboard
        </h1>
        <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
          Submit AI tool requests and track their development progress in our comprehensive dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/submit-ai-tool">
            <button className="w-full sm:w-auto bg-white text-pink-500 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors shadow-lg">
              Submit AI Tool Request
            </button>
          </Link>
          <Link href="/dashboard/tools">
            <button className="w-full sm:w-auto bg-white text-pink-500 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors shadow-lg">
              View AI Tool Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
