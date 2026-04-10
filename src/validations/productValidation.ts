import { z } from 'zod';

const textField = (label: string, minLength = 1) =>
  z
    .string()
    .trim()
    .min(minLength, `${label} is required`)
    .refine((value) => /[A-Za-z]/.test(value), {
      message: `${label} must contain text`,
    });

const listTransform = (value: any) => {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  return (value || '')
    .split(',')
    .map((item: string) => item.trim())
    .filter(Boolean);
};


export const variantSchema = z
  .object({
    weight: textField('Weight'),

    price: z.coerce
      .number()
      .refine((val) => val > 0, { message: 'Price is required' }),

    mrp: z.coerce
      .number()
      .refine((val) => val > 0, { message: 'MRP is required' }),

    stock: z.coerce
      .number()
      .refine((val) => val >= 0, { message: 'Stock is required' }),
  })
  .refine((data) => data.mrp >= data.price, {
    message: 'MRP must be greater than or equal to price',
    path: ['mrp'],
  });


export const createProductSchema = z.object({
  name: z.string().trim().min(3, 'Product name is required'),
  brand: z.string().trim().min(2, 'Brand is required'),
  category: z.string().trim().min(2, 'Category is required'),

  shortDescription: z
    .string()
    .trim()
    .min(1, 'Short description is required'),

  description: z
    .string()
    .trim()
    .min(1, 'Description is required'),

  usage: z
    .string()
    .trim()
    .min(1, 'Usage is required'),

  ingredients: z
    .any()
    .transform(listTransform)
    .refine((arr) => arr.length > 0, {
      message: 'Ingredients required',
    }),

  features: z
    .any()
    .transform(listTransform)
    .refine((arr) => arr.length > 0, {
      message: 'Features required',
    }),

  benefits: z
    .any()
    .transform(listTransform)
    .refine((arr) => arr.length > 0, {
      message: 'Benefits required',
    }),

  tags: z
    .any()
    .transform(listTransform)
    .refine((arr) => arr.length > 0, {
      message: 'Tags required',
    }),

  variants: z
    .array(variantSchema)
    .min(1, 'At least one variant is required'),
});

export const updateProductSchema = z.object({
  name: textField('Product name', 3),
  brand: textField('Brand', 2),
  category: textField('Category', 2),

  shortDescription: z.string().trim().min(1, 'Short description is required'),
  description: z.string().trim().min(1, 'Description is required'),
  usage: textField('Usage'),

  ingredients: z.any().transform(listTransform).refine((arr) => arr.length > 0, {
    message: 'Ingredients required',
  }),

  features: z.any().transform(listTransform).refine((arr) => arr.length > 0, {
    message: 'Features required',
  }),

  benefits: z.any().transform(listTransform).refine((arr) => arr.length > 0, {
    message: 'Benefits required',
  }),

  tags: z.any().transform(listTransform).refine((arr) => arr.length > 0, {
    message: 'Tags required',
  }),

  variants: z.array(variantSchema).min(1, 'At least one variant is required'),
});


export type CreateProductFormValues = z.infer<typeof createProductSchema>;
export type UpdateProductFormValues = z.infer<typeof updateProductSchema>;