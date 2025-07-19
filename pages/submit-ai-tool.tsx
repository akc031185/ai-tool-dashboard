import { useState } from 'react';
import Link from 'next/link';

export default function SubmitAiTool() {
  const [form, setForm] = useState({ name: '', description: '' });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/ai-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSuccess(true);
        setForm({ name: '', description: '' });
      }
    } catch (error) {
      console.error('Error submitting tool:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        <div className="text-center mb-4">
          <Link href="/">
            <button className="bg-white text-pink-500 px-4 py-2 rounded font-semibold hover:bg-gray-200">
              ← Back to Home
            </button>
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl mb-6 text-gray-800 text-center font-bold">🚀 Submit AI Tool Request</h1>
          
          <input
            type="text"
            name="name"
            placeholder="Tool Name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          />
          
          <textarea
            name="description"
            placeholder="Describe your AI tool idea and what problem it should solve..."
            value={form.description}
            onChange={handleChange}
            className="w-full p-3 mb-4 border border-gray-300 rounded h-32 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          />
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-pink-500 text-white px-6 py-3 rounded font-semibold hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Tool Request'}
          </button>
          
          {success && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              ✅ Tool submitted successfully! Claude AI has automatically categorized it.
              <div className="mt-2">
                <Link href="/dashboard/tools">
                  <button className="text-green-800 underline hover:text-green-900">
                    View Dashboard →
                  </button>
                </Link>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
