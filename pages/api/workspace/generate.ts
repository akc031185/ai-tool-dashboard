import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

interface N8NWorkflow {
  id: string;
  name: string;
  nodes: Array<{
    id: string;
    name: string;
    type: string;
    typeVersion: number;
    position: [number, number];
    parameters: Record<string, any>;
  }>;
  connections: Record<string, any>;
  active: boolean;
  settings: Record<string, any>;
}

// Generate a basic N8N workflow template for the user
function generateN8NWorkflow(userId: string, userName: string): N8NWorkflow {
  const workflowId = `workflow_${userId}_${Date.now()}`;
  
  return {
    id: workflowId,
    name: `${userName}'s AI Tool Workflow`,
    nodes: [
      {
        id: 'trigger',
        name: 'Webhook Trigger',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: [100, 200],
        parameters: {
          httpMethod: 'POST',
          path: `ai-tool/${userId}`,
          responseMode: 'responseNode'
        }
      },
      {
        id: 'process',
        name: 'Process AI Request',
        type: 'n8n-nodes-base.function',
        typeVersion: 1,
        position: [300, 200],
        parameters: {
          functionCode: `
// Process incoming AI tool request
const requestData = items[0].json;

// Extract request details
const toolName = requestData.toolName || 'Unnamed Tool';
const description = requestData.description || '';
const userEmail = requestData.userEmail || '';

// Create response
const response = {
  success: true,
  message: 'AI tool request processed successfully',
  toolName: toolName,
  status: 'processing',
  assignedAgent: '${userName}_AI_Agent',
  timestamp: new Date().toISOString(),
  requestId: \`req_\${Date.now()}\`
};

return [{ json: response }];
`
        }
      },
      {
        id: 'notify',
        name: 'Send Notification',
        type: 'n8n-nodes-base.emailSend',
        typeVersion: 2,
        position: [500, 200],
        parameters: {
          fromEmail: 'noreply@aitoolsdashboard.com',
          toEmail: '={{ $json.userEmail }}',
          subject: 'AI Tool Request Confirmation - {{ $json.toolName }}',
          emailFormat: 'html',
          message: `
            <h2>AI Tool Request Received</h2>
            <p>Dear User,</p>
            <p>Your AI tool request has been successfully processed:</p>
            <ul>
              <li><strong>Tool Name:</strong> {{ $json.toolName }}</li>
              <li><strong>Status:</strong> {{ $json.status }}</li>
              <li><strong>Assigned Agent:</strong> {{ $json.assignedAgent }}</li>
              <li><strong>Request ID:</strong> {{ $json.requestId }}</li>
            </ul>
            <p>Our AI agent will begin working on your request shortly.</p>
            <p>Best regards,<br>AI Tools Dashboard Team</p>
          `
        }
      },
      {
        id: 'response',
        name: 'Send Response',
        type: 'n8n-nodes-base.respondToWebhook',
        typeVersion: 1,
        position: [700, 200],
        parameters: {
          respondWith: 'json',
          responseBody: '={{ $json }}'
        }
      }
    ],
    connections: {
      'Webhook Trigger': {
        main: [
          [
            {
              node: 'Process AI Request',
              type: 'main',
              index: 0
            }
          ]
        ]
      },
      'Process AI Request': {
        main: [
          [
            {
              node: 'Send Notification',
              type: 'main',
              index: 0
            },
            {
              node: 'Send Response',
              type: 'main',
              index: 0
            }
          ]
        ]
      }
    },
    active: true,
    settings: {
      saveDataErrorExecution: 'all',
      saveDataSuccessExecution: 'all',
      saveManualExecutions: true,
      callerPolicy: 'workflowsFromSameOwner'
    }
  };
}

// Generate AI agent configuration
function generateAIAgent(userId: string, userName: string) {
  const agentId = `agent_${userId}_${Date.now()}`;
  
  return {
    id: agentId,
    name: `${userName}_AI_Agent`,
    type: 'ai_tool_specialist',
    capabilities: [
      'ai_tool_analysis',
      'requirement_processing',
      'technical_specification',
      'development_planning',
      'progress_tracking'
    ],
    configuration: {
      model: 'claude-3-haiku-20240307',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: `You are an AI Tool Development Specialist assigned to ${userName}. 
Your role is to analyze AI tool requests, break them down into technical requirements, 
create development plans, and track progress. Always be helpful, detailed, and professional.

Key responsibilities:
1. Analyze incoming AI tool requests
2. Break down requirements into actionable tasks
3. Provide technical guidance and specifications
4. Track development progress
5. Communicate updates clearly

Your responses should be structured, actionable, and tailored to the user's technical level.`,
      tools: [
        'web_search',
        'code_analysis',
        'project_planning',
        'technical_documentation'
      ]
    },
    workspace: {
      userId: userId,
      workflowIntegration: true,
      dataAccess: ['user_submissions', 'project_history'],
      outputFormats: ['json', 'markdown', 'html']
    },
    isActive: true,
    createdAt: new Date().toISOString()
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  await dbConnect();

  try {
    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if workspace already exists
    if (user.workspace?.isActive) {
      return res.status(200).json({
        message: 'Workspace already exists',
        workspace: user.workspace,
        existing: true
      });
    }

    // Generate N8N workflow
    const n8nWorkflow = generateN8NWorkflow(userId, user.name);
    
    // Generate AI agent
    const aiAgent = generateAIAgent(userId, user.name);

    // Simulate N8N API call (replace with actual N8N API integration)
    const n8nWorkflowUrl = `https://n8n-instance.com/workflow/${n8nWorkflow.id}`;

    // Update user with workspace information
    await User.findByIdAndUpdate(userId, {
      workspace: {
        n8nWorkflowId: n8nWorkflow.id,
        n8nWorkflowUrl: n8nWorkflowUrl,
        aiAgentId: aiAgent.id,
        aiAgentName: aiAgent.name,
        isActive: true
      },
      $inc: { loginCount: 1 },
      lastLogin: new Date()
    });

    // Return workspace details
    res.status(201).json({
      message: 'Workspace generated successfully',
      workspace: {
        n8nWorkflow: {
          id: n8nWorkflow.id,
          name: n8nWorkflow.name,
          url: n8nWorkflowUrl,
          webhookUrl: `https://n8n-instance.com/webhook/ai-tool/${userId}`,
          active: n8nWorkflow.active
        },
        aiAgent: {
          id: aiAgent.id,
          name: aiAgent.name,
          type: aiAgent.type,
          capabilities: aiAgent.capabilities,
          isActive: aiAgent.isActive
        },
        user: {
          id: userId,
          name: user.name,
          email: user.email,
          loginCount: user.loginCount + 1
        }
      },
      created: true
    });

  } catch (error) {
    console.error('Workspace generation error:', error);
    res.status(500).json({ message: 'Failed to generate workspace' });
  }
}