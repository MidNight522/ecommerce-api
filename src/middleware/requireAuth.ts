import { NextFunction, RequestHandler } from 'express';
import { verifyAccessToken } from '../lib/jwt.js';
import { AuthRole } from '../types/auth.js';

export const requireAuth: RequestHandler = (req, res, next) => {
  const authorization = req.get('Authorization');
  const token = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];
  const user = token ? verifyAccessToken(token) : null;

  if (!user) {
    res.status(401).json({
      message: authorization
        ? 'Invalid or expired token'
        : 'Missing Bearer token',
    });
    return;
  }
  req.user = { id: user.sub, email: user.email, role: user.role };
  next();
};

export const requireRole = (...allowed: AuthRole[]): RequestHandler => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!allowed.includes(user.role)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    next();
  };
};
