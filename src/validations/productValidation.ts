import { z } from 'zod';

const textField = (label: string, minLength = 1) =>
  z.string().trim().min(minLength, `${label} is required`);

const listField = z
  .union([z.string(), z.array(z.string())])
  .transform((value) => {
    if (Array.isArray(value)) {
      return value.map((item) => item.trim()).filter(Boolean);
    }

    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  })
  .optional()
  .default([]);

export const variantSchema = z
  .object({
    weight: textField('Weight'),
    price: z.coerce.number().min(0, 'Price must be greater than or equal to 0'),
    mrp: z.coerce.number().min(0, 'MRP must be greater than or equal to 0'),
    stock: z.coerce.number().min(0, 'Stock must be greater than or equal to 0'),
  })
  .refine((data) => data.mrp >= data.price, {
    message: 'MRP must be greater than or equal to price',
    path: ['mrp'],
  });

export const productSchema = z.object({
  name: z.string().trim().min(3, 'Product name must be at least 3 characters'),
  brand: textField('Brand'),
  category: textField('Category'),
  shortDescription: z.string().trim().optional().default(''),
  description: z.string().trim().optional().default(''),
  usage: z.string().trim().optional().default(''),
  ingredients: listField,
  features: listField,
  benefits: listField,
  tags: listField,
  variants: z.array(variantSchema).min(1, 'At least one variant is required'),
});

export type ProductFormValues = z.infer<typeof productSchema>;
