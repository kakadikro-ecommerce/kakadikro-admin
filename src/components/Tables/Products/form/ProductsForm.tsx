import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Save,
  Loader2,
  Image as Layers,
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
import { productSchema } from '../../../../validations/productValidation';

const emptyVariant = { weight: '', price: '', mrp: '', stock: '' };

const ProductFormModal = ({ product, isOpen, onClose, onRefresh }: any) => {
  const dispatch = useAppDispatch();
  const isEdit = !!product;
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<any>({});
  const [formData, setFormData] = useState<any>({
    name: '',
    brand: '',
    category: '',
    shortDescription: '',
    description: '',
    ingredients: '',
    features: '',
    benefits: '',
    tags: '',
    usage: '',
    variants: [{ ...emptyVariant }],
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          ...product,
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
          images: Array.isArray(product.images)
            ? typeof product.images[0] === 'string'
              ? product.images[0]
              : product.images[0]?.url
            : product.images || '',
          variants: product.variants?.length
            ? product.variants
            : [{ ...emptyVariant }],
          active: product.isActive !== undefined ? product.isActive : true,
        });
      } else {
        resetForm();
      }
      setErrors({});
      setLoading(false);
    }
  }, [product, isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      category: '',
      shortDescription: '',
      description: '',
      images: '',
      active: true,
      ingredients: '',
      features: '',
      benefits: '',
      tags: '',
      usage: '',
      variants: [{ ...emptyVariant }],
    });
    setSelectedFile(null);
    setErrors({});
  };

  const setFieldError = (name: string, message?: string) => {
    setErrors((prev: any) => {
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  };

  const validateSingleField = (name: string, value: any) => {
    const fieldSchema = (productSchema.shape as any)[name];
    if (!fieldSchema) return;

    const result = fieldSchema.safeParse(value);
    if (result.success) {
      setFieldError(name);
      return;
    }

    setFieldError(name, result.error.issues[0]?.message || 'Invalid');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev: any) => ({ ...prev, images: previewUrl }));
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData((prev: any) => ({
        ...prev,
        images: URL.createObjectURL(file),
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    validateSingleField(name, value);
  };

  const handleVariantChange = (
    index: number,
    field: 'weight' | 'price' | 'mrp' | 'stock',
    value: string,
  ) => {
    setFormData((prev: any) => {
      const updatedVariants = [...prev.variants];
      updatedVariants[index] = {
        ...updatedVariants[index],
        [field]: value,
      };
      return { ...prev, variants: updatedVariants };
    });

    const parsedValue =
      field === 'weight' ? value : value === '' ? value : Number(value);

    const nextVariant = {
      ...formData.variants[index],
      [field]: parsedValue,
    };

    const result = productSchema.shape.variants.element.safeParse(nextVariant);
    if (result.success) {
      setErrors((prev: any) => {
        const next = { ...prev };
        delete next[`variants.${index}.weight`];
        delete next[`variants.${index}.price`];
        delete next[`variants.${index}.mrp`];
        delete next[`variants.${index}.stock`];
        return next;
      });
      return;
    }

    const fieldMessages: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const key = issue.path[0];
      if (typeof key === 'string') {
        fieldMessages[`variants.${index}.${key}`] = issue.message;
      }
    });

    setErrors((prev: any) => ({
      ...prev,
      ...fieldMessages,
    }));
  };

  const addVariant = () => {
    const lastVariant = formData.variants[formData.variants.length - 1];
    if (!lastVariant.weight || !lastVariant.price || !lastVariant.mrp) {
      alert('Fill current variant before adding new one');
      return;
    }

    setFormData({
      ...formData,
      variants: [...formData.variants, { ...emptyVariant }],
    });
  };

  const removeVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_: any, i: number) => i !== index),
    });

    setErrors((prev: any) => {
      const next = { ...prev };
      delete next[`variants.${index}.weight`];
      delete next[`variants.${index}.price`];
      delete next[`variants.${index}.mrp`];
      delete next[`variants.${index}.stock`];
      return next;
    });
  };

  const splitClean = (value: any) =>
    typeof value === 'string'
      ? value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      : Array.isArray(value)
        ? value
        : [];

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const parsedData = {
        ...formData,
        usage: formData.usage || '',
        ingredients: splitClean(formData.ingredients),
        features: splitClean(formData.features),
        benefits: splitClean(formData.benefits),
        tags: splitClean(formData.tags),
        variants: formData.variants.map((v: any) => ({
          weight: String(v.weight || '').trim(),
          price: Number(v.price),
          mrp: Number(v.mrp),
          stock: Number(v.stock || 0),
        })),
      };

      productSchema.parse(parsedData);
      setErrors({});

      const data = new FormData();
      data.append('name', formData.name || '');
      data.append('brand', formData.brand || '');
      data.append('category', formData.category || '');
      data.append('shortDescription', formData.shortDescription || '');
      data.append('description', formData.description || '');
      data.append('usage', formData.usage || '');
      data.append('ingredients', JSON.stringify(splitClean(formData.ingredients)));
      data.append('features', JSON.stringify(splitClean(formData.features)));
      data.append('benefits', JSON.stringify(splitClean(formData.benefits)));
      data.append('tags', JSON.stringify(splitClean(formData.tags)));
      data.append(
        'variants',
        JSON.stringify(
          formData.variants.map((v: any) => ({
            weight: String(v.weight || '').trim(),
            price: Number(v.price) || 0,
            mrp: Number(v.mrp) || 0,
            stock: Number(v.stock) || 0,
          })),
        ),
      );

      if (selectedFile) {
        data.append('images', selectedFile);
      } else if (isEdit && product.images) {
        const existing = Array.isArray(product.images)
          ? product.images
          : [product.images];
        data.append('existingImages', JSON.stringify(existing));
      }

      if (isEdit && product._id) {
        await dispatch(updateProduct({ id: product._id, data })).unwrap();
      } else {
        await dispatch(createProduct(data)).unwrap();
      }

      onRefresh();
      onClose();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors: any = {};

        error.issues.forEach((issue) => {
          if (issue.path.length === 1) {
            fieldErrors[issue.path[0] as string] = issue.message;
            return;
          }

          if (issue.path.length >= 3 && issue.path[0] === 'variants') {
            const [_, index, field] = issue.path;
            fieldErrors[`variants.${String(index)}.${String(field)}`] = issue.message;
          }
        });

        setErrors(fieldErrors);
        return;
      }

      if (error?.errors) {
        const fieldErrors: any = {};
        error.errors.forEach((err: any) => {
          const key = err.path?.[0];
          fieldErrors[key] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }

      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const getVariantError = (index: number, field: string) =>
    errors?.[`variants.${index}.${field}`];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-2xl flex flex-col h-auto max-h-[92vh] overflow-hidden my-auto">
        <div className="bg-[#2D1B19] p-5 md:p-6 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Layers3 size={20} className="text-orange-200" />
            </div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight">
              {isEdit ? 'Edit' : 'Add'} Product
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/20 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 md:p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
              <div
                onClick={triggerFileSelect}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="w-full md:w-48 h-48 bg-white rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden shrink-0 shadow-inner group cursor-pointer hover:border-[#3E2723]/20 transition-all relative"
              >
                {formData.images ? (
                  <img
                    src={formData.images}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <UploadCloud size={32} />
                    <span className="text-xs md:text-sm font-semibold tracking-wide">
                      Drop or Click
                    </span>
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

              <div className="flex-1 w-full space-y-3">
                <div className="space-y-1">
                  <h3 className="text-[11px] font-black text-gray-400 ml-2">
                    Product Name
                  </h3>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm md:text-base font-semibold outline-none shadow-sm w-full"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs md:text-sm mt-1 ml-2">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <h3 className="text-[11px] font-black text-gray-400 ml-2">
                      Brand
                    </h3>
                    <input
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      className="px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm md:text-base font-semibold outline-none shadow-sm w-full"
                    />
                    {errors.brand && (
                      <p className="text-red-500 text-xs md:text-sm mt-1 ml-2">
                        {errors.brand}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-[11px] font-black text-gray-400 ml-2">
                      Category
                    </h3>
                    <input
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm md:text-base font-semibold outline-none shadow-sm w-full"
                    />
                    {errors.category && (
                      <p className="text-red-500 text-xs md:text-sm mt-1 ml-2">
                        {errors.category}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-[#3E2723]/60 tracking-[0.25em] flex items-center gap-2">
              <AlignLeft size={12} /> Narratives
            </h3>

            {[
              { name: 'shortDescription', label: 'Short Description', as: 'input' },
              { name: 'description', label: 'Full Description', as: 'textarea' },
              { name: 'usage', label: 'Usage', as: 'input' },
            ].map((field) => (
              <div key={field.name} className="space-y-1">
                <label className="text-[12px] font-black text-gray-400 ml-2">
                  {field.label}
                </label>
                {field.as === 'textarea' ? (
                  <textarea
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm md:text-base font-semibold outline-none min-h-[80px] resize-none shadow-sm"
                  />
                ) : (
                  <input
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm md:text-base font-semibold outline-none shadow-sm"
                  />
                )}
                {errors[field.name] && (
                  <p className="text-red-500 text-xs md:text-sm mt-1 ml-2">
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[12px] font-black text-[#3E2723]/50 tracking-[0.25em] flex items-center gap-2">
                <Layers size={12} /> Pricing & Variants
              </h3>
              <button
                type="button"
                onClick={addVariant}
                className="text-[11px] font-black text-blue-600 flex items-center gap-1.5 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
              >
                <PlusCircle size={14} /> ADD SIZE
              </button>
            </div>

            <div className="space-y-3">
              {formData.variants.map((variant: any, index: number) => (
                <div
                  key={index}
                  className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm"
                >
                  <div className="col-span-1 space-y-1">
                    <label className="text-[11px] font-black text-gray-500 block mb-1">
                      Weight
                    </label>
                    <input
                      value={variant.weight}
                      onChange={(e) =>
                        handleVariantChange(index, 'weight', e.target.value)
                      }
                      className="w-full px-2 py-1 text-sm md:text-base font-semibold border-b border-gray-50 outline-none"
                    />
                    {getVariantError(index, 'weight') && (
                      <p className="text-red-500 text-xs md:text-sm mt-1 ml-2">
                        {getVariantError(index, 'weight')}
                      </p>
                    )}
                  </div>

                  <div className="col-span-1 space-y-1">
                    <label className="text-[11px] font-black text-gray-500 block mb-1">
                      MRP
                    </label>
                    <input
                      type="number"
                      value={variant.mrp}
                      onChange={(e) =>
                        handleVariantChange(index, 'mrp', e.target.value)
                      }
                      className="w-full px-2 py-1 text-sm md:text-base font-semibold border-b border-gray-50 outline-none"
                    />
                    {getVariantError(index, 'mrp') && (
                      <p className="text-red-500 text-xs md:text-sm mt-1 ml-2">
                        {getVariantError(index, 'mrp')}
                      </p>
                    )}
                  </div>

                  <div className="col-span-1 space-y-1">
                    <label className="text-[11px] font-black text-gray-500 block mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) =>
                        handleVariantChange(index, 'price', e.target.value)
                      }
                      className="w-full px-2 py-1 text-sm md:text-base font-semibold border-b border-gray-50 outline-none text-emerald-600"
                    />
                    {getVariantError(index, 'price') && (
                      <p className="text-red-500 text-xs md:text-sm mt-1 ml-2">
                        {getVariantError(index, 'price')}
                      </p>
                    )}
                  </div>

                  <div className="col-span-1 space-y-1">
                    <label className="text-[11px] font-black text-gray-500 block mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) =>
                        handleVariantChange(index, 'stock', e.target.value)
                      }
                      className="w-full px-2 py-1 text-sm md:text-base font-semibold border-b border-gray-50 outline-none"
                    />
                    {getVariantError(index, 'stock') && (
                      <p className="text-red-500 text-xs md:text-sm mt-1 ml-2">
                        {getVariantError(index, 'stock')}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2 md:col-span-1 flex justify-end">
                    {formData.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-2 text-rose-300 hover:text-rose-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
            {['features', 'benefits', 'ingredients', 'tags'].map((id) => (
              <div key={id} className="space-y-1">
                <h3 className="text-[12px] font-black text-[#3E2723]/50 tracking-widest px-2 uppercase">
                  {id}
                </h3>
                <textarea
                  name={id}
                  value={formData[id as string]}
                  onChange={handleChange}
                  placeholder={`Separate ${id} with commas...`}
                  className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-xs md:text-sm font-semibold min-h-[80px] outline-none shadow-sm"
                />
                {errors[id] && (
                  <p className="text-red-500 text-xs md:text-sm mt-1 ml-2">
                    {errors[id]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 md:p-6 bg-white border-t border-gray-50 shrink-0 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full md:w-auto px-12 py-3 bg-[#3E2723] text-[#FDFBF9] border border-[#3E2723] rounded-full flex items-center justify-center gap-2 shadow-sm active:scale-[0.95] transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <Save size={14} />
            )}
            <span className="font-bold tracking-[0.15em] text-xs md:text-sm">
              {isEdit ? 'Update Product' : 'Create Product'}
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProductFormModal;
