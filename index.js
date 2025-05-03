import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false, // We'll manually handle the raw body for signature verification
  },
};

function verifySignature(rawBody, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawBody);
  const digest = hmac.digest('hex');
  return digest === signature;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.WEBHOOK_SIGNING_KEY;
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const rawBody = Buffer.concat(chunks).toString();
  const signature = req.headers['x-periskope-signature'];

  if (!verifySignature(rawBody, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const payload = JSON.parse(rawBody);

  console.log('✅ Valid webhook received:', payload);

  return res.status(200).json({ message: 'Webhook processed' });
}
