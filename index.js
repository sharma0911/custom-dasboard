import crypto from 'crypto';
import { promises as fs } from 'fs';

const WEBHOOK_SECRET = process.env.WEBHOOK_SIGNING_KEY;
const FILE_PATH = '/tmp/tickets.json';

export default async function handler(req, res) {
  const buffers = [];
  for await (const chunk of req) buffers.push(chunk);
  const rawBody = Buffer.concat(buffers).toString();

  const signature = req.headers['x-signature'] || '';
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (req.method === 'POST') {
    if (signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const payload = JSON.parse(rawBody);

    let tickets = [];
    try {
      const data = await fs.readFile(FILE_PATH, 'utf-8');
      tickets = JSON.parse(data);
    } catch (_) {}

    tickets.push(payload);
    await fs.writeFile(FILE_PATH, JSON.stringify(tickets, null, 2));

    console.log('Ticket received:', payload);
    return res.status(200).json({ message: 'Ticket stored' });
  }

  if (req.method === 'GET') {
    try {
      const data = await fs.readFile(FILE_PATH, 'utf-8');
      return res.status(200).json(JSON.parse(data));
    } catch (e) {
      return res.status(200).json([]);
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
