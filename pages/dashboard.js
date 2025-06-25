// /pages/dashboard.js

import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get('/api/requests');
        setRequests(res.data.data);
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError('Failed to load requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleUpdate = async (id, field, value) => {
    try {
      await axios.put(`/api/requests/${id}`, { [field]: value });
      // Refresh requests after update
      const res = await axios.get('/api/requests');
      setRequests(res.data.data);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">AI Tool Request Dashboard</h1>

        <table className="min-w-full bg-white shadow-md rounded overflow-hidden">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="p-3 text-left">Summary</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Priority</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req._id} className="border-b hover:bg-gray-100">
                <td className="p-3">{req.summary || 'No summary yet'}</td>
                <td className="p-3">{req.category || 'Uncategorized'}</td>

                {/* Priority Dropdown */}
                <td className="p-3">
                  <select
                    value={req.priority}
                    onChange={(e) => handleUpdate(req._id, 'priority', e.target.value)}
                    className="border p-1 rounded"
                  >
                    {['Low', 'Medium', 'High', 'Critical'].map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </td>

                {/* Status Dropdown */}
                <td className="p-3">
                  <select
                    value={req.status}
                    onChange={(e) => handleUpdate(req._id, 'status', e.target.value)}
                    className="border p-1 rounded"
                  >
                    {['New', 'In Progress', 'Completed', 'Deployed'].map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>

                {/* View Details Action */}
                <td className="p-3">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => alert(`Future: View details for ${req._id}`)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
