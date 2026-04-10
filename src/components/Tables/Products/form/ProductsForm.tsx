import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Save,
  Loader2,
  Trash2,
  PlusCircle,
  Layers3,
  AlignLeft,
  UploadCloud,
} from 'lucide-react';
import { z } from 'zod';
import { Modal } from '../../../../pages/UiElements/Modal';
import {
  createProduct,
  updateProduct,
} from '../../../../store/modules/products/products.slice';
import { useAppDispatch } from '../../../../store/hooks';
import {
  variantSchema,
  createProductSchema,
  updateProductSchema,
} from '../../../../validations/productValidation';

const emptyVariant = { weight: '', price: '', mrp: '', stock: '' };

type Errors = Record<string, string>;

const initialForm = {
  name: '',
  brand: '',
  category: '',
  shortDescription: '',
  description: '',
  usage: '',
  ingredients: '',
  features: '',
  benefits: '',
  tags: '',
  variants: [{ ...emptyVariant }],
};

const ProductFormModal = ({ product, isOpen, onClose, onRefresh }: any) => {
  const dispatch = useAppDispatch();
  const isEdit = !!product;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [formData, setFormData] = useState<any>(initialForm);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (product) {
      const firstImage = Array.isArray(product.images) ? product.images[0] : product.images;
      const imageUrl =
        typeof firstImage === 'string'
          ? firstImage
          : firstImage?.url || '';

      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        category: product.category || '',
        shortDescription: product.shortDescription || '',
        description: product.description || '',
        usage: product.usage || '',
        ingredients: Array.isArray(product.ingredients)
          ? product.ingredients.join(', ')
          : product.ingredients || '',
        features: Array.isArray(product.features)
          ? product.features.join(', ')
          : product.features || '',
        benefits: Array.isArray(product.benefits)
          ? product.benefits.join(', ')
          : product.benefits || '',
        tags: Array.isArray(product.tags)
          ? product.tags.join(', ')
          : product.tags || '',
        variants: product.variants?.length ? product.variants : [{ ...emptyVariant }],
      });
      setPreviewUrl(imageUrl);
      setSelectedFile(null);
      setErrors({});
      setLoading(false);
      return;
    }

    setFormData(initialForm);
    setSelectedFile(null);
    setPreviewUrl('');
    setErrors({});
    setLoading(false);
  }, [product, isOpen]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const splitClean = (value: any) =>
    typeof value === 'string'
      ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
      : Array.isArray(value)
        ? value
        : [];

  const setFieldError = (name: string, message?: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  };

  const validateSingleField = (name: string, value: any) => {
    if (name.startsWith('variants.')) {
      const [, indexRaw, field] = name.split('.');
      const index = Number(indexRaw);
      const currentVariant = formData.variants[index];
      if (!currentVariant) return;

      const nextVariant = {
        ...currentVariant,
        [field]: field === 'weight' ? value : value,
      };

      const result = variantSchema.safeParse({
        ...nextVariant,
        price: nextVariant.price === '' ? 0 : Number(nextVariant.price),
        mrp: nextVariant.mrp === '' ? 0 : Number(nextVariant.mrp),
        stock: nextVariant.stock === '' ? 0 : Number(nextVariant.stock),
      });

      if (result.success) {
        setFieldError(name);
        return;
      }

      const fieldIssue = result.error.issues.find((issue) => issue.path[0] === field);
      setFieldError(name, fieldIssue?.message || result.error.issues[0]?.message || 'Invalid value');
      return;
    }

    const schema = isEdit ? updateProductSchema : createProductSchema;
    const schemaField = (schema.shape as Record<string, any>)[name];
    if (!schemaField?.safeParse) return;

    if (isEdit && typeof value === 'string' && value.trim() === '') {
      setFieldError(name);
      return;
    }

    const result = schemaField.safeParse(value);
    if (result.success) {
      setFieldError(name);
      return;
    }

    setFieldError(name, result.error.issues[0]?.message || 'Invalid value');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    validateSingleField(name, value);
  };

  const handleFileSelect = (file?: File) => {
    if (!file) return;

    setSelectedFile(file);
    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
    setFieldError('images');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files?.[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files?.[0]);
  };

  const removeImage = () => {
    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleVariantChange = (
    index: number,
    field: 'weight' | 'price' | 'mrp' | 'stock',
    value: string,
  ) => {
    setFormData((prev: any) => {
      const variants = [...prev.variants];
      variants[index] = { ...variants[index], [field]: value };
      return { ...prev, variants };
    });

    validateSingleField(`variants.${index}.${field}`, value);
  };

  const addVariant = () => {
    const currentVariants = formData.variants || [];
    const lastVariant = currentVariants[currentVariants.length - 1];

    const result = variantSchema.safeParse({
      weight: lastVariant?.weight || '',
      price: lastVariant?.price === '' ? undefined : Number(lastVariant.price),
      mrp: lastVariant?.mrp === '' ? undefined : Number(lastVariant.mrp),
      stock: lastVariant?.stock === '' ? undefined : Number(lastVariant.stock),
    });

    if (!result.success) {
      const nextErrors: Errors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (typeof key === 'string') {
          nextErrors[`variants.${currentVariants.length - 1}.${key}`] = issue.message;
        }
      });
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      return;
    }

    setFormData((prev: any) => ({
      ...prev,
      variants: [...prev.variants, { ...emptyVariant }],
    }));
  };

  const removeVariant = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      variants: prev.variants.filter((_: any, i: number) => i !== index),
    }));

    setErrors((prev) => {
      const next: Errors = {};

      Object.keys(prev).forEach((key) => {
        if (!key.startsWith('variants.')) {
          next[key] = prev[key];
        }
      });

      return next;
    });
  };

  const mapValidationErrors = (issues: z.ZodIssue[]) => {
    const nextErrors: Errors = {};

    issues.forEach((issue) => {
      const path = issue.path;
      if (!path.length) return;

      if (path[0] === 'variants' && typeof path[1] === 'number' && typeof path[2] === 'string') {
        nextErrors[`variants.${path[1]}.${path[2]}`] = issue.message;
        return;
      }

      const key = path.join('.');
      nextErrors[key] = issue.message;
    });

    return nextErrors;
  };

  const handleBackendError = (error: any) => {
    const messages: Errors = {};

    const responseData = error?.response?.data ?? error?.data ?? error?.message ?? error;
    const fieldErrors = responseData?.errors ?? responseData?.error?.errors;

    if (Array.isArray(fieldErrors)) {
      fieldErrors.forEach((item: any) => {
        const key = item.path?.join?.('.') || item.path || item.field;
        if (key) messages[key] = item.message || 'Invalid value';
      });
    }

    if (responseData?.fieldErrors && typeof responseData.fieldErrors === 'object') {
      Object.entries(responseData.fieldErrors).forEach(([key, value]) => {
        messages[key] = Array.isArray(value) ? value[0] : String(value);
      });
    }

    if (!Object.keys(messages).length) {
      messages.name = responseData?.message || 'Something went wrong. Please try again.';
    }

    setErrors((prev) => ({ ...prev, ...messages }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!selectedFile && !isEdit) {
        setErrors((prev) => ({
          ...prev,
          images: 'Product image is required',
        }));
        return;
      }

      if (!formData.variants.length) {
        setErrors((prev) => ({
          ...prev,
          variants: 'At least one variant is required',
        }));
        return;
      }

      const payload = {
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        shortDescription: formData.shortDescription || '',
        description: formData.description || '',
        usage: formData.usage || '',
        ingredients: splitClean(formData.ingredients),
        features: splitClean(formData.features),
        benefits: splitClean(formData.benefits),
        tags: splitClean(formData.tags),
        variants: (formData.variants || []).map((variant: any) => ({
          weight: String(variant.weight || '').trim(),
          price: variant.price === '' ? undefined : Number(variant.price),
          mrp: variant.mrp === '' ? undefined : Number(variant.mrp),
          stock: variant.stock === '' ? undefined : Number(variant.stock),
        })),
      };

      const schema = isEdit ? updateProductSchema : createProductSchema;
      const result = schema.safeParse(payload);
      if (!result.success) {
        setErrors(mapValidationErrors(result.error.issues));
        return;
      }

      setErrors({});

      const data = new FormData();
      data.append('name', payload.name);
      data.append('brand', payload.brand);
      data.append('category', payload.category);
      data.append('shortDescription', payload.shortDescription);
      data.append('description', payload.description);
      data.append('usage', payload.usage);
      data.append('ingredients', JSON.stringify(payload.ingredients));
      data.append('features', JSON.stringify(payload.features));
      data.append('benefits', JSON.stringify(payload.benefits));
      data.append('tags', JSON.stringify(payload.tags));
      data.append('variants', JSON.stringify(payload.variants));

      if (selectedFile) {
        data.append('images', selectedFile);
      } else if (isEdit && product?.images) {
        const existing = Array.isArray(product.images) ? product.images : [product.images];
        data.append('existingImages', JSON.stringify(existing));
      }

      if (isEdit && product?._id) {
        await dispatch(updateProduct({ id: product._id, data })).unwrap();
      } else {
        await dispatch(createProduct(data)).unwrap();
      }

      onRefresh();
      onClose();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setErrors(mapValidationErrors(error.issues));
        return;
      }

      handleBackendError(error);
    } finally {
      setLoading(false);
    }
  };

  const getVariantError = (index: number, field: string) => errors[`variants.${index}.${field}`];

  const baseInputClass =
    'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#7A330F] focus:ring-4 focus:ring-[#7A330F]/10 disabled:cursor-not-allowed disabled:opacity-50';
  const sectionLabelClass = 'text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500';
  const sectionCardClass = 'rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6';

  const imagePreview = useMemo(() => previewUrl, [previewUrl]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="mx-auto flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between bg-[#3e2723] px-5 py-4 text-white md:px-7 md:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
              <Layers3 size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight md:text-xl">
                {isEdit ? 'Edit' : 'Add'} Product
              </h2>
              <p className="text-xs text-white/70">Manage product details and variants</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-white/15"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto bg-slate-50 p-4 sm:p-5 md:p-6">
          <div className="space-y-5">
            <div className={sectionCardClass}>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`group relative flex min-h-[220px] cursor-pointer items-center justify-center overflow-hidden rounded-[1.5rem] border-2 border-dashed transition sm:min-h-[280px] ${isDragging ? 'border-[#7A330F] bg-[#7A330F]/5' : 'border-slate-200 bg-slate-50'
                  }`}
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                      <div className="text-left">
                        <p className="text-xs font-semibold">Product image preview</p>
                        <p className="text-[11px] text-white/70">Click or drag to replace</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                        className="rounded-full bg-white/15 px-3 py-2 text-xs font-semibold backdrop-blur"
                      >
                        Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 p-6 text-center text-slate-400">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <UploadCloud size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Drop image here or click to upload
                      </p>
                      <p className="mt-1 text-xs">PNG, JPG, WEBP recommended</p>
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
                {errors.images && (
                  <p className="mt-2 text-xs text-rose-500">{errors.images}</p>
                )}

              <div className="mt-5 space-y-4">
                <div className="space-y-2">
                  <label className={sectionLabelClass}>Product Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    className={baseInputClass}
                  />
                  {errors.name && <p className="pl-1 text-xs text-rose-500">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className={sectionLabelClass}>Brand</label>
                    <input
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="Enter brand"
                      className={baseInputClass}
                    />
                    {errors.brand && <p className="pl-1 text-xs text-rose-500">{errors.brand}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className={sectionLabelClass}>Category</label>
                    <input
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="Enter category"
                      className={baseInputClass}
                    />
                    {errors.category && <p className="pl-1 text-xs text-rose-500">{errors.category}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={sectionLabelClass}>Usage</label>
                  <input
                    name="usage"
                    value={formData.usage}
                    onChange={handleChange}
                    placeholder="How should the product be used?"
                    className={baseInputClass}
                  />
                  {errors.usage && <p className="pl-1 text-xs text-rose-500">{errors.usage}</p>}
                </div>

                <div className="space-y-2">
                  <label className={sectionLabelClass}>Short Description</label>
                  <textarea
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    placeholder="Write a short description"
                    className={`${baseInputClass} min-h-[110px] resize-none`}
                  />
                  {errors.shortDescription && (
                    <p className="pl-1 text-xs text-rose-500">{errors.shortDescription}</p>
                  )}
                </div>
              </div>
            </div>

            <div className={sectionCardClass}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlignLeft size={14} className="text-[#7A330F]" />
                  <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-600">
                    Product Details
                  </h3>
                </div>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter full product description"
                  className={`${baseInputClass} min-h-[160px] resize-none`}
                />
                {errors.description && (
                  <p className="pl-1 text-xs text-rose-500">{errors.description}</p>
                )}
              </div>
            </div>

            <div className={sectionCardClass}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold tracking-[0.18em] text-slate-600 uppercase">
                    Variants
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">Add price, MRP and stock per variant</p>
                </div>
                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center gap-2 rounded-full bg-[#7A330F] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#5e270b]"
                >
                  <PlusCircle size={14} />
                  Add Variant
                </button>
              </div>

              <div className="space-y-4 pt-1">
                {formData.variants.map((variant: any, index: number) => (
                  <div
                    key={index}
                    className="rounded-[1.5rem] p-4 sm:p-5"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Variant {index + 1}
                      </p>
                      {formData.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="rounded-full p-2 text-rose-500 transition hover:bg-rose-50"
                          aria-label={`Remove variant ${index + 1}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="space-y-2">
                        <label className={sectionLabelClass}>Weight</label>
                        <input
                          value={variant.weight}
                          onChange={(e) =>
                            handleVariantChange(index, 'weight', e.target.value)
                          }
                          placeholder="e.g. 250g"
                          className={baseInputClass}
                        />
                        {getVariantError(index, 'weight') && (
                          <p className="pl-1 text-xs text-rose-500">
                            {getVariantError(index, 'weight')}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className={sectionLabelClass}>Price</label>
                        <input
                          type="number"
                          min="0"
                          value={variant.price}
                          onChange={(e) =>
                            handleVariantChange(index, 'price', e.target.value)
                          }
                          placeholder="0"
                          className={baseInputClass}
                        />
                        {getVariantError(index, 'price') && (
                          <p className="pl-1 text-xs text-rose-500">
                            {getVariantError(index, 'price')}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className={sectionLabelClass}>MRP</label>
                        <input
                          type="number"
                          min="0"
                          value={variant.mrp}
                          onChange={(e) =>
                            handleVariantChange(index, 'mrp', e.target.value)
                          }
                          placeholder="0"
                          className={baseInputClass}
                        />
                        {getVariantError(index, 'mrp') && (
                          <p className="pl-1 text-xs text-rose-500">
                            {getVariantError(index, 'mrp')}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className={sectionLabelClass}>Stock</label>
                        <input
                          type="number"
                          min="0"
                          value={variant.stock}
                          onChange={(e) =>
                            handleVariantChange(index, 'stock', e.target.value)
                          }
                          placeholder="0"
                          className={baseInputClass}
                        />
                        {getVariantError(index, 'stock') && (
                          <p className="pl-1 text-xs text-rose-500">
                            {getVariantError(index, 'stock')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={sectionCardClass}>
              <div className="mb-4">
                <h3 className="text-sm font-bold tracking-[0.18em] text-slate-600 uppercase">
                  Product Meta
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Keep these values short and comma separated.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  { name: 'ingredients', label: 'Ingredients' },
                  { name: 'features', label: 'Features' },
                  { name: 'benefits', label: 'Benefits' },
                  { name: 'tags', label: 'Tags' },
                ].map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label className={sectionLabelClass}>{field.label}</label>
                    <textarea
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={`Separate ${field.label.toLowerCase()} with commas`}
                      className={`${baseInputClass} min-h-[96px] resize-none`}
                    />
                    {errors[field.name] && (
                      <p className="pl-1 text-xs text-rose-500">{errors[field.name]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center rounded-[1.5rem] p-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#3e2723] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1f1211] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProductFormModal;
