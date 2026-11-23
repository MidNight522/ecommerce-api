import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getSupabase } from '../lib/supabase.js';
import { tryParse } from '../lib/parse.js';
import { orderCreateSchema, ordersQuerySchema } from '../validation/schemas.js';

export const ordersRoutes = express.Router();

ordersRoutes.use(requireAuth);

ordersRoutes.post('/', async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const parsed = tryParse(orderCreateSchema, req.body);

    if (!parsed.ok) {
      res.status(400).json(parsed.payload);
      return;
    }

    const { data, error } = await getSupabase().rpc('create_store_order', {
      p_user_id: req.user.id,
      p_payload: parsed.value,
    });

    if (error) {
      if (error.code === 'P0001') {
        res.status(409).json({ message: error.message });
        return;
      }

      throw error;
    }

    res.status(201).json({ order: data });
  } catch (error) {
    next(error);
  }
});

ordersRoutes.get('/', async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const parsed = tryParse(ordersQuerySchema, req.query);

    if (!parsed.ok) {
      res.status(400).json(parsed.payload);
      return;
    }

    const { page, pageSize } = parsed.value;
    const start = page * pageSize;

    const { data, count, error } = await getSupabase()
      .from('orders')
      .select('id, total, status, created_at, payment_method, payment_status', {
        count: 'exact',
      })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(start, start + pageSize - 1);

    if (error) throw error;

    res.json({ data: data ?? [], count: count ?? 0 });
  } catch (error) {
    next(error);
  }
});
