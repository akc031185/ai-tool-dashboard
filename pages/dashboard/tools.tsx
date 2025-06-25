'use client';

import { useEffect, useState } from 'react';

interface AiTool {
  _id: string;
  name: string;
  email: string;
  toolName: string;
  description: string;
  createdAt: string;
}

export default function ToolsDashboard() {
  const [tools, setTools] = useState<AiTool[]>([]);

  useEffect(() => {
    fetch('/api/ai-tools')
      .then((res) => res.json())
      .then((data) => setTools(data));
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white">
      <h2 className="text-3xl font-bold mb-4">🚀 Dashboard: AI Tool Submissions</h2>
      <table className="w-full bg-gray-800 rounded">
        <thead>
          <tr>
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Tool Name</th>
            <th className="p-2">Description</th>
            <th className="p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {tools.map((tool) => (
            <tr key={tool._id} className="border-t border-gray-700">
              <td className="p-2">{tool.name}</td>
              <td className="p-2">{tool.email}</td>
              <td className="p-2">{tool.toolName}</td>
              <td className="p-2">{tool.description}</td>
              <td className="p-2">{new Date(tool.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
