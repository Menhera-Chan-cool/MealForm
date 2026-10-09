import { OAuth2Client } from 'google-auth-library';
import { cookieValue, createSessionToken, isGoogleIdentity, readSessionToken, requestBody, SESSION_SECONDS } from './security.mjs';

const COOKIE = 'meal_session';
const google = new OAuth2Client();

function setSessionCookie(req, res, identity, secret) {
  const secure = process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https';
  res.setHeader('Set-Cookie', `${COOKIE}=${createSessionToken(identity, secret)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_SECONDS}${secure ? '; Secure' : ''}`);
}

function sameOrigin(req) {
  try {
    const origin = new URL(req.headers.origin);
    const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim().toLowerCase();
    return origin.host.toLowerCase() === host && (origin.protocol === 'https:' || host.startsWith('localhost:'));
  } catch {
    return false;
  }
}

function noStore(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

export default async function handler(req, res) {
  noStore(res);
  const sessionSecret = process.env.SESSION_SECRET;
  if (req.method === 'GET') {
    const identity = readSessionToken(cookieValue(req.headers.cookie, COOKIE), sessionSecret);
    if (identity) setSessionCookie(req, res, identity, sessionSecret);
    return res.status(200).json({ authenticated: Boolean(identity) });
  }
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Origin không hợp lệ.' });
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`);
    return res.status(200).json({ authenticated: false });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  if (!clientId || !sessionSecret || sessionSecret.length < 32) return res.status(503).json({ error: 'Đăng nhập chưa được cấu hình.' });
  try {
    const credential = String(requestBody(req.body).credential || '');
    if (!credential || credential.length > 10000) return res.status(400).json({ error: 'Thiếu thông tin đăng nhập Google.' });
    const ticket = await google.verifyIdToken({ idToken: credential, audience: clientId });
    const claims = ticket.getPayload();
    if (!isGoogleIdentity(claims, clientId)) return res.status(401).json({ error: 'Không xác minh được tài khoản Google.' });
    setSessionCookie(req, res, { sub: claims.sub, email: claims.email }, sessionSecret);
    return res.status(200).json({ authenticated: true });
  } catch {
    return res.status(401).json({ error: 'Không xác minh được tài khoản Google.' });
  }
}
