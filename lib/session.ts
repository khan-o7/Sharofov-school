import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE = 'ss_admin_session';
const TG_COOKIE = 'ss_tg_session';
function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('SESSION_SECRET kamida 32 belgidan iborat bo‘lishi kerak.');
  return new TextEncoder().encode(value);
}
export async function createAdminSession() {
  const token = await new SignJWT({ role: 'admin' }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('8h').sign(secret());
  const jar = await cookies();
  jar.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8 });
}
export async function isAdmin() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return false;
  try { const { payload } = await jwtVerify(token, secret()); return payload.role === 'admin'; } catch { return false; }
}
export async function clearAdminSession() {
  const jar = await cookies();
  jar.set(COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
}

export async function createTelegramSession(userId: number) {
  const token = await new SignJWT({ role: 'telegram_user', telegramUserId: userId }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('30d').sign(secret());
  const jar = await cookies();
  jar.set(TG_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
}
export async function getTelegramSessionUserId() {
  const jar = await cookies();
  const token = jar.get(TG_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === 'telegram_user' && typeof payload.telegramUserId === 'number' ? payload.telegramUserId : null;
  } catch { return null; }
}
