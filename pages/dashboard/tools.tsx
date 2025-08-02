import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type AiTool = {
  _id: string;
  name: string;
  category: string;
  progress: string;
};

export default function ToolsDashboard() {
  const { data, error, isLoading } = useSWR('/api/ai-tools', fetcher);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tools...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-300 rounded-lg p-4">
          <p className="text-red-700">Error loading tools.</p>
        </div>
      </div>
    );
  }

  const tools: AiTool[] = data?.tools || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">🛠️ AI Tools Dashboard</h1>
          <p className="text-gray-600">Track the progress of submitted AI tool requests</p>
        </div>

        {tools.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tools submitted yet</h3>
            <p className="text-gray-500 mb-6">Submit your first AI tool request to get started!</p>
            <a 
              href="/submit-ai-tool"
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Submit AI Tool Request
            </a>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4">
              {tools.map((tool: AiTool) => (
                <div key={tool._id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-gray-800">{tool.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tool.progress === 'completed' ? 'bg-green-100 text-green-800' :
                      tool.progress === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {tool.progress}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    <span className="font-medium">Category:</span> {tool.category}
                  </p>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Tool Name</th>
                    <th className="px-6 py-4 text-left font-semibold">Category</th>
                    <th className="px-6 py-4 text-left font-semibold">Progress</th>
                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tools.map((tool: AiTool) => (
                    <tr key={tool._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{tool.name}</td>
                      <td className="px-6 py-4 text-gray-600">{tool.category}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          tool.progress === 'completed' ? 'bg-green-100 text-green-800' :
                          tool.progress === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {tool.progress}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-purple-600 hover:text-purple-800 font-medium text-sm">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
