import 'dotenv/config';
import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import bcrypt from 'bcrypt';
import {
  authLoginSchema,
  authRegisterSchema,
  profileUpdateSchema,
} from '../validation/schemas.js';
import { tryParse } from '../lib/parse.js';
import { getSupabase } from '../lib/supabase.js';
import { singAccessToken } from '../lib/jwt.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const authRoutes = express.Router();

const BCRYPT_ROUNDS = 10;

authRoutes.post('/register', async (req, res, next) => {
  try {
    const parsed = tryParse(authRegisterSchema, req.body);
    if (!parsed.ok) {
      return res.status(400).json(parsed.payload);
    }

    const { email, password, name } = parsed.value;
    const normalizedEmail = email.toLowerCase();
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const role = 'user';

    const sb = getSupabase();
    const { data, error } = await sb
      .from('users')
      .insert({
        email: normalizedEmail,
        password_hash: passwordHash,
        role,
        name: name ?? null,
      })
      .select(
        'id, email, role, name, phone, city, shipping_address, created_at',
      )
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ message: 'Email already exists' });
      }
      throw error;
    }

    const token = singAccessToken({
      sub: data.id,
      email: data.email,
      role: data.role,
    });
    res.status(201).json({
      token,
      user: {
        id: data.id,
        email: data.email,
        role: data.role,
        name: data.name,
        phone: data.phone,
        city: data.city,
        shippingAddress: data.shipping_address,
        createdAt: data.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
});

authRoutes.post('/login', async (req, res, next) => {
  try {
    const parsed = tryParse(authLoginSchema, req.body);

    if (!parsed.ok) {
      return res.status(400).json(parsed.payload);
    }

    const { email, password } = parsed.value;
    const normalizedEmail = email.toLowerCase();

    const sb = getSupabase();
    const { data, error } = await sb
      .from('users')
      .select(
        'id, email, password_hash, role, name, phone, city, shipping_address, created_at',
      )
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(password, data.password_hash);
    if (!ok) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const token = singAccessToken({
      sub: data.id,
      email: data.email,
      role: data.role,
    });
    res.status(200).json({
      token,
      user: {
        id: data.id,
        email: data.email,
        role: data.role,
        name: data.name,
        phone: data.phone,
        city: data.city,
        shippingAddress: data.shipping_address,
        createdAt: data.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
});

authRoutes.get(
  '/me',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const sb = getSupabase();

      const { data, error } = await sb
        .from('users')
        .select(
          'id, email, role, name, phone, city, shipping_address, created_at',
        )
        .eq('id', user.id)
        .maybeSingle();
      if (error) {
        throw error;
      }
      if (!data) {
        return res.status(401).json({ message: 'User not found' });
      }
      return res.status(200).json({
        user: {
          id: data.id,
          email: data.email,
          role: data.role,
          name: data.name,
          phone: data.phone,
          city: data.city,
          shippingAddress: data.shipping_address,
          createdAt: data.created_at,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

authRoutes.patch('/me', requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const parsed = tryParse(profileUpdateSchema, req.body);

    if (!parsed.ok) {
      res.status(400).json(parsed.payload);
      return;
    }

    const body = parsed.value;
    const { data, error } = await getSupabase()
      .from('users')
      .update({
        name: body.name,
        email: body.email,
        phone: body.phone,
        city: body.city,
        shipping_address: body.shippingAddress,
      })
      .eq('id', req.user.id)
      .select(
        'id, email, role, name, phone, city, shipping_address, created_at',
      )
      .maybeSingle();

    if (error) {
      if (error.code === '23505') {
        res.status(409).json({ message: 'Email already exists' });
        return;
      }

      throw error;
    }

    if (!data) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: data.id,
        email: data.email,
        role: data.role,
        name: data.name,
        phone: data.phone,
        city: data.city,
        shippingAddress: data.shipping_address,
        createdAt: data.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
});
