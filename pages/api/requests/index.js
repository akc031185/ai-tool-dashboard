import dbConnect from '../../../lib/dbConnect';
import Request from '../../../models/Request';

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const requests = await Request.find({});
        res.status(200).json({ success: true, data: requests });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    case 'POST':
      try {
        const request = await Request.create(req.body);
        res.status(201).json({ success: true, data: request });
      } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
