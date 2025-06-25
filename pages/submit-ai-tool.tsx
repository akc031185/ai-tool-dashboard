'use client';

import { useState } from 'react';

export default function SubmitAITool() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    toolName: '',
    description: '',
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/ai-tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setSuccess(true);
      setFormData({ name: '', email: '', toolName: '', description: '' });
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded shadow-md w-full max-w-lg">
        <h2 className="text-2xl mb-4">Submit AI Tool Request</h2>
        <input
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
          name="email"
          placeholder="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
          name="toolName"
          placeholder="AI Tool Name"
          value={formData.toolName}
          onChange={handleChange}
          required
        />
        <textarea
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
          name="description"
          placeholder="Description / Reason"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <button type="submit" className="bg-green-500 px-4 py-2 rounded hover:bg-green-600">Submit</button>
        {success && <p className="mt-2 text-green-300">✅ Request submitted successfully!</p>}
      </form>
    </div>
  );
}
