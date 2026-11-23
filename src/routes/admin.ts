import express from 'express';
import { getSupabase } from '../lib/supabase.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';

export const adminRoutes = express.Router();

adminRoutes.get(
  '/dashboard',
  requireAuth,
  requireRole('admin'),
  async (_req, res, next) => {
    try {
      const { data, error } = await getSupabase().rpc('get_admin_dashboard');

      if (error) throw error;

      res.json({ data });
    } catch (error) {
      next(error);
    }
  },
);
