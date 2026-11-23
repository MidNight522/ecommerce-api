import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthRole } from '../types/auth.js';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: AuthRole;
};

function getSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) {
    throw new Error('JWT_SECRET must be set and least 16 characters');
  }
  return s;
}

function resolveExpiresInSeconds(): number {
  const raw = process.env.JWT_EXPIRES_IN;
  if (!raw) return 60 * 60 * 24 * 1;
  const n = Number(raw);
  if (Number.isSafeInteger(n) && n > 0) return n;
  const match = /^(\d+)([smhd])$/i.exec(raw.trim());
  if (!match) return 60 * 60 * 24 * 1;
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const mult =
    unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86400;
  return value * mult;
}

export function singAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = { expiresIn: resolveExpiresInSeconds() };
  return jwt.sign(payload, getSecret(), options);
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  const secret = getSecret();

  try {
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });

    if (typeof payload === 'string') return null;

    const { sub, email, role } = payload;
    if (
      typeof sub !== 'string' ||
      typeof email !== 'string' ||
      (role !== 'user' && role !== 'admin')
    ) {
      return null;
    }

    return { sub, email, role };
  } catch {
    return null;
  }
}
