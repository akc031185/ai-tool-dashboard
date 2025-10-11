import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/src/lib/dbConnect';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      return res.status(503).json({
        ok: false,
        message: 'Database not connected',
        readyState: mongoose.connection.readyState,
        time: new Date().toISOString(),
      });
    }

    // Perform a simple ping operation
    await mongoose.connection.db.admin().ping();

    res.status(200).json({
      ok: true,
      message: 'Database connected',
      readyState: mongoose.connection.readyState,
      time: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(503).json({
      ok: false,
      message: 'Database health check failed',
      error: error instanceof Error ? error.message : String(error),
      time: new Date().toISOString(),
    });
  }
}
