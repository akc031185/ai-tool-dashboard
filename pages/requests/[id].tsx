// pages/requests/[id].tsx
import { useRouter } from 'next/router';
import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

interface RequestData {
  _id: string;
  name: string;
  problemDescription: string;
  expectedOutput: string;
  businessImpact: string;
  category: string;
  summary: string;
  priority: string;
  status: string;
}

export default function RequestDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [request, setRequest] = useState<RequestData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchRequest();
    }
  }, [id]);

  const fetchRequest = async () => {
    try {
      const res = await axios.get(`/api/requests/${id}`);
      setRequest(res.data.request);
      setLoading(false);
    } catch (err) {
      setError('Failed to load request');
      setLoading(false);
    }
  };

  const handleChange = (field: keyof RequestData, value: string) => {
    if (!request) return;
    setRequest({ ...request, [field]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`/api/requests/${id}`, request);
      alert('Update successful');
    } catch (err) {
      alert('Failed to update');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error || !request) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Request Detail</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.keys(request).map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1">{key}</label>
            <input
              type="text"
              value={request[key as keyof RequestData] || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(key as keyof RequestData, e.target.value)}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
        ))}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
      </form>
    </div>
  );
}
