import type { NextApiRequest, NextApiResponse } from 'next';

const startTime = Date.now();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const uptimeMs = Date.now() - startTime;
  const env = process.env.NODE_ENV || 'unknown';

  res.status(200).json({
    ok: true,
    env,
    uptimeMs,
    time: new Date().toISOString(),
  });
}
