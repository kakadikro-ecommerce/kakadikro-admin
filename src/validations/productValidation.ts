import { z } from 'zod';
import { normalizeProductType, type ProductType } from '../types/product';

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
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return (value || '')
    .split(',')
    .map((item: string) => item.trim())
    .filter(Boolean);
};

const requiredNumber = (label: string, opts?: { min?: number; exclusiveMin?: boolean }) => {
  const min = opts?.min ?? 0;
  const exclusiveMin = opts?.exclusiveMin ?? false;

  return z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      const num = typeof val === 'number' ? val : Number(val);
      return Number.isFinite(num) ? num : undefined;
    },
    exclusiveMin
      ? z
          .number({ error: `${label} is required` })
          .gt(min, `${label} is required`)
      : z
          .number({ error: `${label} is required` })
          .min(min, `${label} is required`),
  );
};

export const productTypeSchema = z.preprocess(
  (value) => normalizeProductType(typeof value === 'string' ? value : ''),
  z.union([z.literal('CROSSLIFE'), z.literal('CROSSLINE')], {
    error: 'Product type must be Cross Life or Cross Line',
  }),
);

export const variantSchema = z
  .object({
    name: textField('Variant name'),
    price: requiredNumber('Price', { exclusiveMin: true }),
    mrp: requiredNumber('MRP', { exclusiveMin: true }),
    stock: requiredNumber('Stock', { min: 0 }),
    attributes: z.record(z.string(), z.string()).optional(),
  })
  .refine((data) => data.mrp >= data.price, {
    message: 'MRP must be greater than or equal to price',
    path: ['mrp'],
  });

const optionalListField = z.any().transform(listTransform);

const baseProductFields = {
  name: z.string().trim().min(3, 'Product name is required'),
  productType: productTypeSchema,
  category: z.string().trim().min(2, 'Category is required'),
  shortDescription: z.string().trim().optional().default(''),
  description: z.string().trim().optional().default(''),
  usage: z.string().trim().optional().default(''),
  ingredients: optionalListField,
  specifications: z.record(z.string(), z.string()).optional().default({}),
  features: optionalListField,
  benefits: optionalListField,
  tags: optionalListField,
  variants: z.array(variantSchema).min(1, 'At least one variant is required'),
};

const validateTypeSpecificFields = (
  data: {
    productType: ProductType;
    ingredients: string[];
    specifications?: Record<string, string>;
  },
  ctx: z.RefinementCtx,
) => {
  if (data.productType === 'CROSSLIFE' && data.ingredients.length === 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'Ingredients are required for Cross Life products',
      path: ['ingredients'],
    });
  }

  if (data.productType === 'CROSSLINE') {
    const specs = data.specifications || {};
    if (Object.keys(specs).length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Specifications are required for Cross Line products',
        path: ['specifications'],
      });
    }
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
