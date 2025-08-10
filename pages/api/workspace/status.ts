import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/src/lib/dbConnect';
import User from '@/src/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    // Get session (simplified version without full NextAuth config)
    const userId = req.query.userId as string;
    
    // For now, we'll get the user ID from query param
    // In production, you'd get this from the session
    if (!userId && !req.headers.authorization) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let user;
    if (userId) {
      user = await User.findById(userId);
    } else {
      // Try to get from session in the future
      return res.status(401).json({ message: 'User ID required' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if workspace exists
    if (!user.workspace?.isActive) {
      return res.status(200).json({
        success: true,
        workspace: null,
        message: 'No active workspace found'
      });
    }

    // Return workspace details
    const workspaceData = {
      n8nWorkflow: {
        id: user.workspace.n8nWorkflowId,
        name: `${user.name}'s AI Tool Workflow`,
        url: user.workspace.n8nWorkflowUrl,
        webhookUrl: `https://n8n-instance.com/webhook/ai-tool/${user._id}`,
        active: user.workspace.isActive
      },
      aiAgent: {
        id: user.workspace.aiAgentId,
        name: user.workspace.aiAgentName,
        type: 'ai_tool_specialist',
        capabilities: [
          'ai_tool_analysis',
          'requirement_processing', 
          'technical_specification',
          'development_planning',
          'progress_tracking'
        ],
        isActive: user.workspace.isActive
      },
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        loginCount: user.loginCount
      }
    };

    res.status(200).json({
      success: true,
      workspace: workspaceData
    });

  } catch (error) {
    console.error('Workspace status error:', error);
    res.status(500).json({ message: 'Failed to get workspace status' });
  }
}