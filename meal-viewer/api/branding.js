import { createGasReader } from './security.mjs';

const read = createGasReader({ url: process.env.GAS_API_URL, secret: process.env.GAS_HMAC_SECRET });

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const data = await read('', false, 'read-branding');
    return res.status(200).json({ schoolName: data.schoolName, logoUrl: data.logoUrl, primaryColor: data.primaryColor, updatedAt: data.updatedAt });
  } catch (error) { return res.status(503).json({ error: 'Chưa tải được cấu hình thương hiệu.' }); }
}
