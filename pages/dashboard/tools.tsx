import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type AiTool = {
  _id: string;
  name: string;
  category: string;
  progress: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  description?: string;
  createdAt?: string;
};

export default function ToolsDashboard() {
  const { data, error, isLoading } = useSWR('/api/ai-tools', fetcher);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg md:text-xl">Loading tools...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg text-center mx-4">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Tools</h2>
          <p className="text-gray-600">Unable to load AI tools data. Please try again later.</p>
        </div>
      </div>
    );
  }

  const tools: AiTool[] = data?.tools || [];

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">🚀 AI Tools Dashboard</h1>
          <p className="text-white opacity-90 mb-4">Track the progress of submitted AI tool requests</p>
          <Link href="/">
            <button className="bg-white text-pink-500 px-4 md:px-6 py-2 md:py-3 rounded font-semibold hover:bg-gray-200 transition-colors">
              ← Back to Home
            </button>
          </Link>
        </div>

        {tools.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 text-center mx-auto max-w-2xl">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-700 mb-2">No tools submitted yet</h3>
            <p className="text-gray-500 mb-6">Submit your first AI tool request to get started!</p>
            <Link href="/submit-ai-tool">
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all">
                Submit AI Tool Request
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-4">
              {tools.map((tool: AiTool) => (
                <div key={tool._id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-gray-800 flex-1 mr-2">{tool.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      tool.progress === 'completed' ? 'bg-green-100 text-green-800' :
                      tool.progress === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {tool.progress}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Category:</span> {tool.category}
                    </p>
                    {tool.contactName && (
                      <p className="text-gray-600">
                        <span className="font-medium">Submitter:</span> {tool.contactName}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <Link href={`/project-progress/${tool._id}`}>
                      <button className="w-full bg-purple-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-purple-600 transition-colors">
                        View Progress →
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Tool Name</th>
                      <th className="px-6 py-4 text-left font-semibold">Category</th>
                      <th className="px-6 py-4 text-left font-semibold">Submitter</th>
                      <th className="px-6 py-4 text-left font-semibold">Progress</th>
                      <th className="px-6 py-4 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tools.map((tool: AiTool) => (
                      <tr key={tool._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{tool.name}</td>
                        <td className="px-6 py-4 text-gray-600">{tool.category}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {tool.contactName || 'Anonymous'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            tool.progress === 'completed' ? 'bg-green-100 text-green-800' :
                            tool.progress === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {tool.progress}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/project-progress/${tool._id}`}>
                            <button className="bg-purple-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-purple-600 transition-colors">
                              View Progress
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
