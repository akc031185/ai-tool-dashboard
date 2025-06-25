// /pages/index.js

import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to the AI Tool Dashboard</h1>
        <p className="text-lg mb-6">Submit new AI tool requests or track progress on existing projects.</p>

        <div className="space-x-4">
          <a href="/submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Submit New Request
          </a>
          <a href="/dashboard" className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
            View Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
