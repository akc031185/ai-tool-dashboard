import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface WorkspaceData {
  n8nWorkflow?: {
    id: string
    name: string
    url: string
    webhookUrl: string
    active: boolean
  }
  aiAgent?: {
    id: string
    name: string
    type: string
    capabilities: string[]
    isActive: boolean
  }
  user?: {
    id: string
    name: string
    email: string
    loginCount: number
  }
}

export default function UserWorkspace() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/login')
      return
    }

    fetchWorkspace()
  }, [session, status, router])

  const fetchWorkspace = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/workspace/status?userId=${session.user.id}`)
      const data = await response.json()
      
      if (data.success) {
        setWorkspace(data.workspace)
      }
    } catch (error) {
      console.error('Error fetching workspace:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateWorkspace = async () => {
    if (!session?.user?.id) return

    setGenerating(true)
    try {
      const response = await fetch('/api/workspace/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setWorkspace(data.workspace)
      } else {
        alert('Failed to generate workspace: ' + data.message)
      }
    } catch (error) {
      console.error('Error generating workspace:', error)
      alert('Error generating workspace')
    } finally {
      setGenerating(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading workspace...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">🚀 Your AI Workspace</h1>
              <p className="text-gray-600 mt-1">Manage your N8N workflows and AI agents</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard/tools">
                <button className="bg-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-600 transition-colors">
                  View Tools Dashboard
                </button>
              </Link>
              {!workspace?.n8nWorkflow && (
                <button
                  onClick={generateWorkspace}
                  disabled={generating}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {generating ? 'Generating...' : 'Generate Workspace'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">👤</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Welcome</p>
                <p className="text-xl font-bold text-gray-900">{session.user.name}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📧</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-lg font-semibold text-gray-900">{session.user.email}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🔢</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Login Count</p>
                <p className="text-xl font-bold text-gray-900">{workspace?.user?.loginCount || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Status */}
        {!workspace?.n8nWorkflow ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🏗️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Workspace Not Generated</h2>
            <p className="text-gray-600 mb-6">
              Generate your personal N8N workflow and AI agent to start automating AI tool requests.
            </p>
            <button
              onClick={generateWorkspace}
              disabled={generating}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {generating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating Workspace...
                </div>
              ) : (
                'Generate My Workspace'
              )}
            </button>
          </div>
        ) : workspace?.n8nWorkflow && workspace?.aiAgent ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* N8N Workflow */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="text-2xl mr-3">⚡</span>
                  N8N Workflow
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Workflow Name</label>
                    <p className="text-lg font-semibold text-gray-900">{workspace.n8nWorkflow.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Workflow ID</label>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded">{workspace.n8nWorkflow.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Webhook URL</label>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs font-mono bg-gray-100 p-2 rounded flex-1 truncate">
                        {workspace.n8nWorkflow.webhookUrl}
                      </p>
                      <button
                        onClick={() => workspace.n8nWorkflow?.webhookUrl && navigator.clipboard.writeText(workspace.n8nWorkflow.webhookUrl)}
                        className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded text-xs"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${workspace.n8nWorkflow.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-sm font-medium">
                        {workspace.n8nWorkflow.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <a
                    href={workspace.n8nWorkflow.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors inline-flex items-center justify-center"
                  >
                    Open in N8N
                    <span className="ml-2">↗</span>
                  </a>
                </div>
              </div>
            </div>

            {/* AI Agent */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="text-2xl mr-3">🤖</span>
                  AI Agent
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Agent Name</label>
                    <p className="text-lg font-semibold text-gray-900">{workspace.aiAgent.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Agent ID</label>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded">{workspace.aiAgent.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Type</label>
                    <p className="text-sm font-semibold text-gray-700">{workspace.aiAgent.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Capabilities</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {workspace.aiAgent.capabilities.map((capability, index) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                        >
                          {capability.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${workspace.aiAgent.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-sm font-medium">
                        {workspace.aiAgent.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <button className="w-full bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors">
                    Chat with Agent
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Instructions */}
        {workspace?.n8nWorkflow && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">🔧 How to Use Your Workspace</h3>
            <div className="space-y-3 text-blue-800">
              <p>
                <strong>1. Webhook Integration:</strong> Use the webhook URL to send AI tool requests directly to your N8N workflow.
              </p>
              <p>
                <strong>2. AI Agent:</strong> Your personal AI agent will process requests and provide intelligent responses.
              </p>
              <p>
                <strong>3. Automation:</strong> The workflow automatically handles notifications and response formatting.
              </p>
              <p>
                <strong>4. Monitoring:</strong> Track all activities through the N8N interface and your dashboard.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}