// Submit Form Page
// // /pages/submit.js

import { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

export default function Submit() {
  const [formData, setFormData] = useState({
    problemDescription: '',
    expectedOutput: '',
    businessImpact: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await axios.post('/api/requests', formData);
      if (res.data.success) {
        setSuccess(true);
        setFormData({
          problemDescription: '',
          expectedOutput: '',
          businessImpact: '',
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
        <h1 className="text-2xl font-bold mb-4">Submit New AI Tool Request</h1>

        {success && <p className="text-green-600 mb-4">Request submitted successfully!</p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">Problem Description</label>
            <textarea
              name="problemDescription"
              value={formData.problemDescription}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block font-medium">Expected Output</label>
            <textarea
              name="expectedOutput"
              value={formData.expectedOutput}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block font-medium">Business Impact</label>
            <textarea
              name="businessImpact"
              value={formData.businessImpact}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
