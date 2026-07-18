import { UserRole } from '../models';

export const JWT_SECRET = 'smart_task_secret_key_2026';

export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(36);
}

// Low-dependency password hash simulator
export function hashPassword(password: string): string {
  return 'hashed_' + simpleHash(password);
}

// Simple custom JWT token implementation
export function generateToken(payload: { id: string; role: UserRole }): string {
  const payloadStr = JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 });
  const base64Payload = Buffer.from(payloadStr).toString('base64');
  const signature = simpleHash(base64Payload + JWT_SECRET);
  return `${base64Payload}.${signature}`;
}

export function verifyToken(token: string): { id: string; role: UserRole } | null {
  try {
    const [base64Payload, signature] = token.split('.');
    if (!base64Payload || !signature) return null;
    const expectedSignature = simpleHash(base64Payload + JWT_SECRET);
    if (signature !== expectedSignature) return null;
    const payloadStr = Buffer.from(base64Payload, 'base64').toString('utf8');
    const payload = JSON.parse(payloadStr);
    if (payload.exp < Date.now()) return null; // Expired
    return { id: payload.id, role: payload.role };
  } catch {
    return null;
  }
}
