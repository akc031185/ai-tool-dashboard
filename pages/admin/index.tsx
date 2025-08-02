import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface AiTool {
  _id: string
  name: string
  category: string
  description: string
  progress: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  createdAt: string
}

export default function AdminPanel() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tools, setTools] = useState<AiTool[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [clearingAll, setClearingAll] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user?.role !== 'admin') {
      router.push('/auth/login')
      return
    }

    fetchTools()
  }, [session, status, router])

  const fetchTools = async () => {
    try {
      const response = await fetch('/api/ai-tools')
      const data = await response.json()
      if (data.success) {
        setTools(data.tools)
      }
    } catch (error) {
      console.error('Error fetching tools:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteTool = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/ai-tools/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setTools(tools.filter(tool => tool._id !== id))
      } else {
        alert('Failed to delete submission')
      }
    } catch (error) {
      console.error('Error deleting tool:', error)
      alert('Error deleting submission')
    } finally {
      setDeleting(null)
    }
  }

  const clearAllSubmissions = async () => {
    if (!confirm('Are you sure you want to delete ALL submissions? This action cannot be undone.')) return

    setClearingAll(true)
    try {
      const response = await fetch('/api/ai-tools', {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setTools([])
        alert(`Successfully deleted ${data.deletedCount} submissions`)
      } else {
        alert('Failed to clear submissions')
      }
    } catch (error) {
      console.error('Error clearing submissions:', error)
      alert('Error clearing submissions')
    } finally {
      setClearingAll(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">🔧 Admin Panel</h1>
              <p className="text-gray-600 mt-1">Manage AI tool submissions</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard/tools">
                <button className="bg-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-600 transition-colors">
                  View Public Dashboard
                </button>
              </Link>
              <button
                onClick={clearAllSubmissions}
                disabled={clearingAll || tools.length === 0}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {clearingAll ? 'Clearing...' : 'Clear All Submissions'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📊</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{tools.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">⏳</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Draft Status</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tools.filter(tool => tool.progress === 'Draft').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📝</div>
              <div>
                <p className="text-sm font-medium text-gray-600">With Contact Info</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tools.filter(tool => tool.contactEmail).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">All Submissions</h2>
          </div>

          {tools.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No submissions yet</h3>
              <p className="text-gray-500">Submissions will appear here once users submit AI tool requests.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tool Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tools.map((tool) => (
                    <tr key={tool._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{tool.name}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {tool.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {tool.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{tool.contactName || 'Anonymous'}</div>
                          {tool.contactEmail && (
                            <div className="text-gray-500">{tool.contactEmail}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {tool.progress}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tool.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link href={`/project-progress/${tool._id}`}>
                            <button className="text-indigo-600 hover:text-indigo-900">
                              View
                            </button>
                          </Link>
                          <button
                            onClick={() => deleteTool(tool._id)}
                            disabled={deleting === tool._id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {deleting === tool._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}