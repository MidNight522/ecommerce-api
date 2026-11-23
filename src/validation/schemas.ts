import z from 'zod';

export const authRegisterSchema = z.object({
  email: z.email().trim().toLowerCase().max(300),
  password: z.string().min(8).max(128),
  name: z.string().trim().max(200).optional(),
});

export const authLoginSchema = z.object({
  email: z.email().trim().toLowerCase().max(300),
  password: z.string().min(8).max(128),
});

export const productCreateSchema = z.object({
  name: z.string().trim().min(1, 'name is required').max(500),
  description: z.string().max(10000).nullable().optional(),
  price: z.coerce
    .number()
    .finite('price must be a finite number')
    .nonnegative(),
  image_url: z.union([z.string().url().max(2000), z.null()]).optional(),
  scoville: z.coerce.number().int().nonnegative().nullable().optional(),
  stock: z.coerce.number().int().nonnegative().optional().default(0),
  product_type: z
    .enum([
      'Whole Chilies',
      'Ground Spices',
      'Scorching Sauces',
      'Sadistic Blends',
      'Infernal Extracts',
    ])
    .nullable()
    .optional(),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().max(200),
  email: z.string().trim().toLowerCase().email().max(300),
  phone: z
    .string()
    .trim()
    .max(40)
    .refine(
      (value) => value === '' || /^\+?[0-9](?:[ ()-]*[0-9]){6,14}$/.test(value),
      'Invalid phone number',
    ),
  city: z.string().trim().max(100),
  shippingAddress: z.string().trim().max(500),
});

export const productVisibilitySchema = z.object({
  is_hidden: z.boolean(),
});

export const orderCreateSchema = z.object({
  requestId: z.string().uuid(),
  customer: z.object({
    name: z.string().trim().min(1).max(200),
    phone: z
      .string()
      .trim()
      .max(40)
      .regex(/^\+?[0-9](?:[ ()-]*[0-9]){6,14}$/),
    city: z.string().trim().min(1).max(100),
    address: z.string().trim().min(1).max(500),
  }),
  paymentMethod: z.enum(['card', 'wallet', 'cash']),
  expectedTotalCents: z.number().int().nonnegative().max(999999999999),
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        quantity: z.number().int().min(1).max(1000),
      }),
    )
    .min(1)
    .max(100)
    .refine(
      (items) => new Set(items.map((item) => item.id)).size === items.length,
      'Duplicate products are not allowed',
    ),
});

export const ordersQuerySchema = z.object({
  page: z.coerce.number().int().min(0).max(1000000).default(0),
  pageSize: z.coerce.number().int().min(1).max(50).default(8),
});
