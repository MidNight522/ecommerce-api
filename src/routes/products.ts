import express, { NextFunction, Request, Response } from 'express';
import { getSupabase } from '../lib/supabase.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';
import { tryParse } from '../lib/parse.js';
import {
  productCreateSchema,
  productVisibilitySchema,
} from '../validation/schemas.js';

export const productsRoutes = express.Router();

productsRoutes.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sb = getSupabase();
      const { data, error } = await sb
        .from('products')
        .select('*')
        .eq('is_hidden', false)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      res
        .status(200)
        .json({ data: data ?? [], message: 'Product fetched successfully' });
    } catch (err) {
      next(err);
    }
  },
);

//admin
productsRoutes.post(
  '/',
  requireAuth,
  requireRole('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = tryParse(productCreateSchema, req.body);

      if (!parsed.ok) {
        return res.status(400).json(parsed.payload);
      }

      const body = parsed.value;
      const insert = {
        name: body.name,
        description: body.description ?? null,
        price: body.price,
        image_url: body.image_url ?? null,
        scoville: body.scoville ?? null,
        stock: body.stock ?? 0,
        product_type: body.product_type ?? null,
      };

      const sb = getSupabase();
      const { data, error } = await sb
        .from('products')
        .insert(insert)
        .select('*')
        .single();

      if (error) throw error;

      res.status(201).json({
        product: data,
        message: 'Product created successfully',
      });
    } catch (err) {
      next(err);
    }
  },
);

productsRoutes.get(
  '/admin',
  requireAuth,
  requireRole('admin'),
  async (_req, res, next) => {
    try {
      const { data, error } = await getSupabase()
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({ data: data ?? [], message: 'Products fetched successfully' });
    } catch (error) {
      next(error);
    }
  },
);

productsRoutes.get(
  '/admin/:id',
  requireAuth,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const { data, error } = await getSupabase()
        .from('products')
        .select('*')
        .eq('id', req.params.id)
        .maybeSingle();

      if (error) {
        if (error.code === '22P02') {
          res.status(404).json({ message: 'Product not found' });
          return;
        }
        throw error;
      }

      if (!data) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      res.json({ data, message: 'Product fetched successfully' });
    } catch (error) {
      next(error);
    }
  },
);

productsRoutes.put(
  '/:id',
  requireAuth,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const parsed = tryParse(productCreateSchema, req.body);

      if (!parsed.ok) {
        res.status(400).json(parsed.payload);
        return;
      }

      const body = parsed.value;

      const { data, error } = await getSupabase()
        .from('products')
        .update({
          name: body.name,
          description: body.description ?? null,
          price: body.price,
          image_url: body.image_url ?? null,
          scoville: body.scoville ?? null,
          stock: body.stock ?? 0,
          product_type: body.product_type ?? null,
        })
        .eq('id', req.params.id)
        .select('*')
        .maybeSingle();

      if (error) {
        if (error.code === '22P02') {
          res.status(404).json({ message: 'Product not found' });
          return;
        }

        throw error;
      }

      if (!data) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      res.json({
        product: data,
        message: 'Product updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },
);

productsRoutes.patch(
  '/:id/visibility',
  requireAuth,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const parsed = tryParse(productVisibilitySchema, req.body);

      if (!parsed.ok) {
        res.status(400).json(parsed.payload);
        return;
      }

      const { data, error } = await getSupabase()
        .from('products')
        .update({ is_hidden: parsed.value.is_hidden })
        .eq('id', req.params.id)
        .select('*')
        .maybeSingle();

      if (error) {
        if (error.code === '22P02') {
          res.status(404).json({ message: 'Product not found' });
          return;
        }
        throw error;
      }

      if (!data) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      res.json({ product: data, message: 'Product visibility updated' });
    } catch (error) {
      next(error);
    }
  },
);

productsRoutes.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const { error } = await getSupabase()
        .from('products')
        .delete()
        .eq('id', req.params.id);

      if (error) {
        if (error.code === '22P02') {
          res.status(404).json({ message: 'Product not found' });
          return;
        }

        if (error.code === '23503') {
          res.status(409).json({
            message: 'This product is used by other records. Hide it instead.',
          });
          return;
        }

        throw error;
      }

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },
);

productsRoutes.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const sb = getSupabase();
      const { data, error } = await sb
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_hidden', false)
        .maybeSingle();

      if (error) {
        if (error.code === '22P02') {
          return res.status(404).json({ message: 'Product not found' });
        }
        throw error;
      }

      if (!data) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json({ data, message: 'Product fetched successfully' });
    } catch (err) {
      next(err);
    }
  },
);
