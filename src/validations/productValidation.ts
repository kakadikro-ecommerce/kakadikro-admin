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

export const productTypeSchema = z.union([
  z.literal('GROCERY'),
  z.literal('ELECTRONICS'),
], {
  error: 'Product type must be Grocery or Electronics',
});

export const variantSchema = z
  .object({
    name: textField('Variant name'),

    price: z.coerce
      .number()
      .refine((val) => val > 0, { message: 'Price is required' }),

    mrp: z.coerce
      .number()
      .refine((val) => val > 0, { message: 'MRP is required' }),

    stock: z.coerce
      .number()
      .refine((val) => val >= 0, { message: 'Stock is required' }),

    attributes: z.record(z.string(), z.string()).optional(),
  })
  .refine((data) => data.mrp >= data.price, {
    message: 'MRP must be greater than or equal to price',
    path: ['mrp'],
  });

const baseProductFields = {
  name: z.string().trim().min(3, 'Product name is required'),
  productType: productTypeSchema,
  category: z.string().trim().min(2, 'Category is required'),
  shortDescription: z.string().trim().min(1, 'Short description is required'),
  description: z.string().trim().min(1, 'Description is required'),
  usage: z.string().trim().min(1, 'Usage is required'),
  ingredients: z.any().transform(listTransform),
  specifications: z.record(z.string(), z.string()).optional(),
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
  variants: z.array(variantSchema).min(1, 'At least one variant is required'),
};

const validateTypeSpecificFields = (
  data: {
    productType: 'GROCERY' | 'ELECTRONICS';
    ingredients: string[];
  },
  ctx: z.RefinementCtx,
) => {
  if (data.productType === 'GROCERY' && data.ingredients.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Ingredients required',
      path: ['ingredients'],
    });
  }
};

export const createProductSchema = z
  .object(baseProductFields)
  .superRefine(validateTypeSpecificFields);

export const updateProductSchema = z
  .object(baseProductFields)
  .superRefine(validateTypeSpecificFields);

export type CreateProductFormValues = z.infer<typeof createProductSchema>;
export type UpdateProductFormValues = z.infer<typeof updateProductSchema>;
