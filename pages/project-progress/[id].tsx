import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

type ProjectDetails = {
  _id: string;
  name: string;
  category: string;
  description: string;
  progress: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
};

type ProjectStatus = {
  phase: string;
  status: 'completed' | 'in-progress' | 'pending';
  description: string;
  date?: string;
};

export default function ProjectProgress() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sample project statuses - in a real app, this would come from the database
  const projectStatuses: ProjectStatus[] = [
    {
      phase: 'Project Submitted',
      status: 'completed',
      description: 'Project request has been successfully submitted and received',
      date: project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : ''
    },
    {
      phase: 'Initial Review',
      status: 'completed',
      description: 'Project has been reviewed by our team and categorized using AI',
      date: project?.createdAt ? new Date(new Date(project.createdAt).getTime() + 24 * 60 * 60 * 1000).toLocaleDateString() : ''
    },
    {
      phase: 'Requirements Analysis',
      status: 'in-progress',
      description: 'Detailed analysis of requirements and technical feasibility',
    },
    {
      phase: 'Development Planning',
      status: 'pending',
      description: 'Creating development roadmap and timeline',
    },
    {
      phase: 'Prototype Development',
      status: 'pending',
      description: 'Building initial prototype and MVP',
    },
    {
      phase: 'Testing & Refinement',
      status: 'pending',
      description: 'Quality assurance and feature refinement',
    },
    {
      phase: 'Deployment',
      status: 'pending',
      description: 'Final deployment and delivery to client',
    }
  ];

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai-tools');
      
      if (!response.ok) {
        throw new Error('Failed to fetch project details');
      }

      const data = await response.json();
      const foundProject = data.tools.find((tool: ProjectDetails) => tool._id === id);
      
      if (!foundProject) {
        throw new Error('Project not found');
      }

      setProject(foundProject);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in-progress':
        return '🔄';
      case 'pending':
        return '⏳';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
        <div className="text-white text-xl flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
          Loading project details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Project Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/dashboard/tools">
            <button className="bg-purple-500 text-white px-6 py-3 rounded font-semibold hover:bg-purple-600">
              ← Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/dashboard/tools">
            <button className="bg-white text-purple-600 px-4 py-2 rounded font-semibold hover:bg-gray-100 transition-colors">
              ← Back to Dashboard
            </button>
          </Link>
        </div>

        {/* Project Header */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <div className="border-b pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 Project Progress</h1>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-purple-600">{project.name}</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {project.progress}
              </span>
            </div>
          </div>

          {/* Project Details Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Project Info */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Project Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Project Name</label>
                  <p className="text-lg text-gray-800">{project.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-lg text-gray-800">{project.category}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-700 leading-relaxed">{project.description}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Submitted On</label>
                  <p className="text-lg text-gray-800">
                    {new Date(project.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Submitter Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Submitter Details</h2>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-lg text-gray-800">{project.contactName || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-lg text-gray-800">{project.contactEmail || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-lg text-gray-800">{project.contactPhone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🚀 Development Progress</h2>
          
          <div className="space-y-4">
            {projectStatuses.map((status, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg border-l-4 border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="text-2xl">{getStatusIcon(status.status)}</div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{status.phase}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status.status)}`}>
                      {status.status.charAt(0).toUpperCase() + status.status.slice(1).replace('-', ' ')}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-2">{status.description}</p>
                  
                  {status.date && (
                    <p className="text-sm text-gray-500">📅 {status.date}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Summary */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">📈 Overall Progress</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full" style={{ width: '30%' }}></div>
              </div>
              <span className="text-sm font-medium text-gray-600">30% Complete</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Your project is currently in the Requirements Analysis phase. We'll update you as progress continues.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}