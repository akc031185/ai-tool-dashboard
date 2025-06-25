// /pages/requests/[id].js

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';

export default function RequestDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchRequest = async () => {
      try {
        const res = await axios.get(`/api/requests/${id}`);
        setRequest(res.data.data);
      } catch (err) {
        console.error('Error fetching request:', err);
        setError('Failed to load request.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  const handleUpdate = async (field, value) => {
    try {
      await axios.put(`/api/requests/${id}`, { [field]: value });
      const res = await axios.get(`/api/requests/${id}`);
      setRequest(res.data.data);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  if (loading) return <p>Loading request...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!request) return <p>No request found.</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded mt-6">
        <h1 className="text-2xl font-bold mb-4">AI Tool Request Details</h1>

        <p><strong>Problem Description:</strong> {request.problemDescription}</p>
        <p className="mt-2"><strong>Expected Output:</strong> {request.expectedOutput}</p>
        <p className="mt-2"><strong>Business Impact:</strong> {request.businessImpact}</p>
        <p className="mt-2"><strong>Category:</strong> {request.category || 'Uncategorized'}</p>
        <p className="mt-2"><strong>Summary:</strong> {request.summary || 'No summary yet'}</p>

        <div className="mt-4">
          <label className="block font-medium">Priority:</label>
          <select
            value={request.priority}
            onChange={(e) => handleUpdate('priority', e.target.value)}
            className="border p-2 rounded w-full"
          >
            {['Low', 'Medium', 'High', 'Critical'].map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="block font-medium">Status:</label>
          <select
            value={request.status}
            onChange={(e) => handleUpdate('status', e.target.value)}
            className="border p-2 rounded w-full"
          >
            {['New', 'In Progress', 'Completed', 'Deployed'].map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <button
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => router.push('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
