import { z } from 'zod';

const requiredText = (label: string, minLength = 2) =>
  z
    .string()
    .trim()
    .min(minLength, `${label} required`);

const commaList = (label: string) =>
  z
    .union([z.string(), z.array(z.string())])
    .transform((value) => {
      if (Array.isArray(value)) return value;
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    })
    .optional();

export const variantSchema = z.object({
  weight: requiredText('Weight'),
  price: z.coerce.number().min(1, 'Price required'),
  mrp: z.coerce.number().min(1, 'MRP required'),
  stock: z.coerce.number().min(0, 'Stock required'),
});

export const productSchema = z.object({
  name: requiredText('Product name', 2),
  brand: requiredText('Brand', 2),
  category: requiredText('Category', 2),
  shortDescription: requiredText('Short description', 3),
  description: requiredText('Description', 5),
  usage: z.string().trim().optional(),
  ingredients: commaList('Ingredients'),
  features: commaList('Features'),
  benefits: commaList('Benefits'),
  tags: commaList('Tags'),
  variants: z.array(variantSchema).min(1, 'At least one variant required'),
});

