import { useState } from 'react';
import Link from 'next/link';

export default function SubmitAiTool() {
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    contactName: '', 
    contactEmail: '', 
    contactPhone: '' 
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [shortPrompt, setShortPrompt] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generateDescription = async () => {
    if (!shortPrompt.trim()) {
      alert('Please enter a brief idea first');
      return;
    }

    setAiLoading(true);
    try {
      const res = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: shortPrompt, 
          toolName: form.name 
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setForm({ ...form, description: data.description });
      } else {
        alert('Failed to generate description. Please try again.');
      }
    } catch (error) {
      console.error('Error generating description:', error);
      alert('Failed to generate description. Please try again.');
    } finally {
      setAiLoading(false);
    }
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
        setForm({ 
          name: '', 
          description: '', 
          contactName: '', 
          contactEmail: '', 
          contactPhone: '' 
        });
        setShortPrompt('');
      }
    } catch (error) {
      console.error('Error submitting tool:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Back to Home Button */}
        <div className="text-center mb-6">
          <Link href="/">
            <button className="bg-white text-pink-500 px-4 py-2 rounded font-semibold hover:bg-gray-200">
              ← Back to Home
            </button>
          </Link>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl mb-6 text-gray-800 text-center font-bold">🚀 Submit AI Tool Request</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tool Information Section */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Tool Information</h2>
              
              <input
                type="text"
                name="name"
                placeholder="Tool Name (e.g., Smart Content Generator)"
                value={form.name}
                onChange={handleChange}
                className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />

              {/* AI-Powered Description Generation */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-medium text-gray-700 mb-3">🤖 AI-Powered Description Generator</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Just type a few words about your idea, and our AI will generate a detailed description!
                </p>
                
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Brief idea (e.g., 'content writing tool for social media')"
                    value={shortPrompt}
                    onChange={(e) => setShortPrompt(e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={generateDescription}
                    disabled={aiLoading}
                    className="bg-blue-500 text-white px-4 py-3 rounded font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {aiLoading ? '🤖...' : '✨ Generate'}
                  </button>
                </div>
                
                {aiLoading && (
                  <div className="text-center text-blue-600">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    AI is crafting your description...
                  </div>
                )}
              </div>

              <textarea
                name="description"
                placeholder="Detailed description will appear here after AI generation, or write your own..."
                value={form.description}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded h-40 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            {/* Contact Information Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Contact Information</h2>
              
              <input
                type="text"
                name="contactName"
                placeholder="Your Full Name"
                value={form.contactName}
                onChange={handleChange}
                className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
              
              <input
                type="email"
                name="contactEmail"
                placeholder="Your Email Address"
                value={form.contactEmail}
                onChange={handleChange}
                className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
              
              <input
                type="tel"
                name="contactPhone"
                placeholder="Your Phone Number (optional)"
                value={form.contactPhone}
                onChange={handleChange}
                className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting Request...
                </div>
              ) : (
                'Submit AI Tool Request'
              )}
            </button>
            
            {success && (
              <div className="mt-6 p-6 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎉</div>
                  <h3 className="text-lg font-semibold mb-2">Tool Request Submitted Successfully!</h3>
                  <p className="mb-4">Claude AI has automatically categorized your tool request and it's now in our system.</p>
                  <Link href="/dashboard/tools">
                    <button className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700">
                      View Dashboard →
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
