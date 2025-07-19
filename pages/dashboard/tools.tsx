import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type AiTool = {
  _id: string;
  name: string;
  category: string;
  progress: string;
};

export default function ToolsDashboard() {
  const { data, error, isLoading } = useSWR('/api/ai-tools', fetcher);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <div className="text-white text-xl">Loading...</div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <div className="text-white text-xl">Error loading tools.</div>
    </div>
  );

  const tools: AiTool[] = data.tools;

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🚀 AI Tools Dashboard</h1>
          <Link href="/">
            <button className="bg-white text-pink-500 px-6 py-3 rounded font-semibold hover:bg-gray-200">
              ← Back to Home
            </button>
          </Link>
        </div>

        {/* Tools Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Name</th>
                <th className="px-6 py-4 text-left font-semibold">Category</th>
                <th className="px-6 py-4 text-left font-semibold">Progress</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((tool: AiTool) => (
                <tr key={tool._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{tool.name}</td>
                  <td className="px-6 py-4 text-gray-600">{tool.category}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {tool.progress}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {tools.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No AI tools submitted yet.</p>
              <Link href="/submit-ai-tool">
                <button className="mt-4 bg-pink-500 text-white px-6 py-3 rounded font-semibold hover:bg-pink-600">
                  Submit First Tool
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
