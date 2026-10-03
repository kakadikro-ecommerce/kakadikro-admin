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
  ChevronLeft,
  ChevronRight,
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
import {
  FALLBACK_PRODUCT_TYPE_CONFIGS,
  PRODUCT_TYPES,
  ProductType,
  ProductTypeConfig,
  formatProductTypeLabel,
  getVariantDisplayName,
  isCrossLifeType,
  isCrossLineType,
  normalizeProductType,
} from '../../../../types/product';
import {
  getImageUrl,
  toExistingImagesPayload,
  toExistingVideoPayload,
} from '../../../../utils/productMedia';
import { productService } from '../../../../services/products-api';
import { parseApiError } from '../../../../services/axiosError';

const emptyVariant = { name: '', price: '', mrp: '', stock: '' };
const emptySpecification = { key: '', value: '' };
const MAX_IMAGES = 9;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4'];
const THUMBNAIL_PREVIEW_COUNT = 4;

type Errors = Record<string, string>;
type ExistingImageItem = { url: string; altText: string };
type ExistingVideoItem = { url: string; altText: string };
type NewImageItem = { id: string; file: File; previewUrl: string; altText: string };
type NewVideoItem = { id: string; file: File; previewUrl: string; altText: string };
type MediaSlide = {
  key: string;
  kind: 'image' | 'video';
  src: string;
  group: 'existing' | 'new' | 'video';
  indexInGroup: number;
};

const initialForm = {
  name: '',
  productType: 'CROSSLIFE' as ProductType,
  category: '',
  shortDescription: '',
  description: '',
  usage: '',
  ingredients: '',
  features: '',
  benefits: '',
  tags: '',
  specifications: [{ ...emptySpecification }],
  variants: [{ ...emptyVariant }],
};

const mapSpecificationsForForm = (specifications: Record<string, string> | undefined) => {
  if (!specifications || typeof specifications !== 'object') {
    return [{ ...emptySpecification }];
  }

  const entries = Object.entries(specifications).filter(
    ([key, value]) => key && value != null && String(value).trim() !== '',
  );

  if (!entries.length) {
    return [{ ...emptySpecification }];
  }

  return entries.map(([key, value]) => ({
    key,
    value: String(value),
  }));
};

const buildSpecificationsPayload = (rows: Array<{ key: string; value: string }>) =>
  rows.reduce<Record<string, string>>((acc, row) => {
    const key = row.key.trim();
    const value = row.value.trim();
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {});

const mapVariantsForForm = (variants: any[] | undefined) => {
  if (!Array.isArray(variants) || variants.length === 0) {
    return [{ ...emptyVariant }];
  }

  return variants.map((variant) => ({
    name: getVariantDisplayName(variant),
    price: variant.price ?? '',
    mrp: variant.mrp ?? '',
    stock: variant.stock ?? '',
  }));
};

const buildVariantPayload = (variants: any[], productType: ProductType) =>
  (variants || []).map((variant: any) => {
    const name = String(variant.name || '').trim();
    const attributes: Record<string, string> = {};

    if (isCrossLifeType(productType) && name) {
      attributes.weight = name;
    }

    return {
      name,
      price: variant.price === '' ? undefined : Number(variant.price),
      mrp: variant.mrp === '' ? undefined : Number(variant.mrp),
      stock: variant.stock === '' ? undefined : Number(variant.stock),
      ...(Object.keys(attributes).length ? { attributes } : {}),
    };
  });

const fieldLabel = (field: string) => {
  const labels: Record<string, string> = {
    name: 'Product name',
    category: 'Category',
    usage: 'Usage',
    shortDescription: 'Short description',
    description: 'Description',
    ingredients: 'Ingredients',
    specifications: 'Specifications',
    features: 'Features',
    benefits: 'Benefits',
    tags: 'Tags',
    variants: 'Variants',
    images: 'Images',
    video: 'Video',
  };
  return labels[field] || field;
};

const revokePreviewUrls = (items: NewImageItem[]) => {
  items.forEach((item) => {
    if (item.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(item.previewUrl);
    }
  });
};

const revokeVideoPreview = (item: NewVideoItem | null) => {
  if (item?.previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(item.previewUrl);
  }
};

const ProductFormModal = ({ product, isOpen, onClose, onRefresh }: any) => {
  const dispatch = useAppDispatch();
  const isEdit = !!product;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formData, setFormData] = useState<any>(initialForm);
  const [isDragging, setIsDragging] = useState(false);
  const [isVideoDragging, setIsVideoDragging] = useState(false);
  const [existingImages, setExistingImages] = useState<ExistingImageItem[]>([]);
  const [newImages, setNewImages] = useState<NewImageItem[]>([]);
  const [existingVideo, setExistingVideo] = useState<ExistingVideoItem | null>(null);
  const [newVideo, setNewVideo] = useState<NewVideoItem | null>(null);
  const [videoRemoved, setVideoRemoved] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [showAllThumbs, setShowAllThumbs] = useState(false);
  const [productTypeConfigs, setProductTypeConfigs] = useState<ProductTypeConfig[]>(
    FALLBACK_PRODUCT_TYPE_CONFIGS,
  );
  const [typesLoading, setTypesLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const loadProductTypes = async () => {
      setTypesLoading(true);
      try {
        const configs = await productService.getProductTypes();
        if (!cancelled) {
          setProductTypeConfigs(configs.length ? configs : FALLBACK_PRODUCT_TYPE_CONFIGS);
        }
      } catch {
        if (!cancelled) {
          setProductTypeConfigs(FALLBACK_PRODUCT_TYPE_CONFIGS);
        }
      } finally {
        if (!cancelled) setTypesLoading(false);
      }
    };

    loadProductTypes();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (product) {
      const productType = normalizeProductType(product.productType);

      setFormData({
        name: product.name || '',
        productType,
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
        specifications: mapSpecificationsForForm(product.specifications),
        variants: mapVariantsForForm(product.variants),
      });
      setExistingImages(toExistingImagesPayload(product.images));
      setExistingVideo(toExistingVideoPayload(product.video));
      setVideoRemoved(false);
      setPreviewIndex(0);
      setShowAllThumbs(false);
      setNewImages((prev) => {
        revokePreviewUrls(prev);
        return [];
      });
      setNewVideo((prev) => {
        revokeVideoPreview(prev);
        return null;
      });
      setErrors({});
      setLoading(false);
      return;
    }

    setFormData(initialForm);
    setExistingImages([]);
    setExistingVideo(null);
    setVideoRemoved(false);
    setPreviewIndex(0);
    setShowAllThumbs(false);
    setNewImages((prev) => {
      revokePreviewUrls(prev);
      return [];
    });
    setNewVideo((prev) => {
      revokeVideoPreview(prev);
      return null;
    });
    setErrors({});
    setLoading(false);
  }, [product, isOpen]);

  useEffect(() => {
    return () => {
      revokePreviewUrls(newImages);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeTypeConfig = useMemo(() => {
    const code = normalizeProductType(formData.productType);
    return (
      productTypeConfigs.find((item) => item.code === code) ||
      FALLBACK_PRODUCT_TYPE_CONFIGS.find((item) => item.code === code) ||
      FALLBACK_PRODUCT_TYPE_CONFIGS[0]
    );
  }, [formData.productType, productTypeConfigs]);

  const isFieldVisible = (field: string) => {
    // Backend contracts always require these by product type — never hide them.
    if (field === 'ingredients') {
      return isCrossLifeType(formData.productType);
    }
    if (field === 'specifications') {
      return isCrossLineType(formData.productType);
    }
    if (
      field === 'variants' ||
      field === 'name' ||
      field === 'category' ||
      field === 'shortDescription' ||
      field === 'description'
    ) {
      return true;
    }

    if (activeTypeConfig.notRequiredFields.includes(field)) return false;
    if (!activeTypeConfig.fields.length) return true;
    return activeTypeConfig.fields.includes(field);
  };

  const isFieldRequired = (field: string) => {
    if (field === 'ingredients') return isCrossLifeType(formData.productType);
    if (field === 'specifications') return isCrossLineType(formData.productType);
    if (field === 'name' || field === 'category' || field === 'variants') return true;
    return activeTypeConfig.requiredFields.includes(field);
  };

  const totalImageCount = existingImages.length + newImages.length;

  const mediaSlides = useMemo<MediaSlide[]>(() => {
    const slides: MediaSlide[] = existingImages.map((image, index) => ({
      key: `existing-${image.url}-${index}`,
      kind: 'image',
      src: getImageUrl(image),
      group: 'existing',
      indexInGroup: index,
    }));

    newImages.forEach((image, index) => {
      slides.push({
        key: image.id,
        kind: 'image',
        src: image.previewUrl,
        group: 'new',
        indexInGroup: index,
      });
    });

    if (newVideo) {
      slides.push({
        key: newVideo.id,
        kind: 'video',
        src: newVideo.previewUrl,
        group: 'video',
        indexInGroup: 0,
      });
    } else if (!videoRemoved && existingVideo) {
      slides.push({
        key: `existing-video-${existingVideo.url}`,
        kind: 'video',
        src: existingVideo.url,
        group: 'video',
        indexInGroup: 0,
      });
    }

    return slides;
  }, [existingImages, newImages, newVideo, existingVideo, videoRemoved]);

  useEffect(() => {
    setPreviewIndex((index) => {
      if (!mediaSlides.length) return 0;
      return Math.min(index, mediaSlides.length - 1);
    });
  }, [mediaSlides.length]);

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
      // Clear the top banner once the user starts correcting fields.
      delete next._form;
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
        [field]: value,
      };

      const result = variantSchema.safeParse({
        name: nextVariant.name ?? '',
        price: nextVariant.price,
        mrp: nextVariant.mrp,
        stock: nextVariant.stock,
      });

      // Only update the field being edited — never borrow sibling errors.
      if (result.success) {
        setFieldError(name);
        return;
      }

      const fieldIssue = result.error.issues.find(
        (issue) => String(issue.path[0]) === field,
      );
      if (fieldIssue) {
        setFieldError(name, fieldIssue.message);
      } else {
        setFieldError(name);
      }
      return;
    }

    if (!isFieldRequired(name) && typeof value === 'string' && value.trim() === '') {
      setFieldError(name);
      return;
    }

    const schema = isEdit ? updateProductSchema : createProductSchema;
    const schemaField = (schema.shape as Record<string, any>)[name];
    if (!schemaField?.safeParse) {
      if (isFieldRequired(name) && typeof value === 'string' && !value.trim()) {
        setFieldError(name, `${fieldLabel(name)} is required`);
      } else {
        setFieldError(name);
      }
      return;
    }

    if (isEdit && typeof value === 'string' && value.trim() === '' && !isFieldRequired(name)) {
      setFieldError(name);
      return;
    }

    const result = schemaField.safeParse(value);
    if (result.success) {
      if (isFieldRequired(name) && typeof value === 'string' && !value.trim()) {
        setFieldError(name, `${fieldLabel(name)} is required`);
        return;
      }
      setFieldError(name);
      return;
    }

    setFieldError(name, result.error.issues[0]?.message || 'Invalid value');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === 'productType') {
      const nextType = normalizeProductType(value);
      setFormData((prev: any) => ({ ...prev, productType: nextType }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.ingredients;
        delete next.specifications;
        return next;
      });
      return;
    }

    setFormData((prev: any) => ({ ...prev, [name]: value }));
    validateSingleField(name, value);
  };

  const handleFilesSelect = (fileList?: FileList | File[] | null) => {
    const files = fileList ? Array.from(fileList) : [];
    if (!files.length) return;

    const imageFiles = files.filter((file) => file.type !== 'video/mp4');
    const videoFiles = files.filter((file) => file.type === 'video/mp4');

    if (videoFiles.length > 1) {
      setFieldError('video', 'You can upload only 1 video');
    } else if (videoFiles.length === 1) {
      applyVideoFile(videoFiles[0]);
    }

    const remaining = MAX_IMAGES - (existingImages.length + newImages.length);
    if (!imageFiles.length) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (remaining <= 0) {
      setFieldError('images', 'You can upload up to 9 images');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const accepted: NewImageItem[] = [];
    let rejectedTypeOrSize = false;
    let truncated = false;

    for (const file of imageFiles) {
      if (accepted.length >= remaining) {
        truncated = true;
        break;
      }

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES) {
        rejectedTypeOrSize = true;
        continue;
      }

      accepted.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        altText: '',
      });
    }

    if (accepted.length) {
      setNewImages((prev) => [...prev, ...accepted]);
      setFieldError('images');
    }

    if (truncated || imageFiles.length > remaining) {
      setFieldError('images', 'You can upload up to 9 images');
    } else if (rejectedTypeOrSize && !accepted.length) {
      setFieldError('images', 'Please upload JPEG, PNG, or WebP images up to 5MB each');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const applyVideoFile = (file: File) => {
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type) || file.size > MAX_VIDEO_BYTES) {
      setFieldError('video', 'Please upload one MP4 video up to 50MB');
      return;
    }

    setNewVideo((prev) => {
      revokeVideoPreview(prev);
      return {
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        altText: '',
      };
    });
    setVideoRemoved(false);
    setFieldError('video');
  };

  const handleVideoSelect = (fileList?: FileList | File[] | null) => {
    const file = fileList ? Array.from(fileList)[0] : null;
    if (!file) return;
    applyVideoFile(file);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesSelect(e.target.files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelect(e.dataTransfer.files);
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
    setFieldError('images');
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => {
      const target = prev[index];
      if (target?.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
    setFieldError('images');
  };

  const removeCurrentVideo = () => {
    setNewVideo((prev) => {
      revokeVideoPreview(prev);
      return null;
    });
    if (existingVideo) {
      setVideoRemoved(true);
    }
    setFieldError('video');
  };

  const removeCurrentMedia = () => {
    const slide = mediaSlides[previewIndex];
    if (!slide) return;
    if (slide.group === 'existing') removeExistingImage(slide.indexInGroup);
    else if (slide.group === 'new') removeNewImage(slide.indexInGroup);
    else removeCurrentVideo();
  };

  const moveCurrentImage = (direction: -1 | 1) => {
    const slide = mediaSlides[previewIndex];
    if (!slide || slide.kind !== 'image') return;

    if (slide.group === 'existing') {
      const nextIndex = slide.indexInGroup + direction;
      if (nextIndex < 0 || nextIndex >= existingImages.length) return;
      moveExistingImage(slide.indexInGroup, direction);
    } else {
      const nextIndex = slide.indexInGroup + direction;
      if (nextIndex < 0 || nextIndex >= newImages.length) return;
      moveNewImage(slide.indexInGroup, direction);
    }

    setPreviewIndex((index) => index + direction);
  };

  const moveExistingImage = (index: number, direction: -1 | 1) => {
    setExistingImages((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next;
    });
  };

  const moveNewImage = (index: number, direction: -1 | 1) => {
    setNewImages((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next;
    });
  };

  const handleVariantChange = (
    index: number,
    field: 'name' | 'price' | 'mrp' | 'stock',
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
    const lastIndex = currentVariants.length - 1;

    const result = variantSchema.safeParse({
      name: lastVariant?.name || '',
      price: lastVariant?.price,
      mrp: lastVariant?.mrp,
      stock: lastVariant?.stock,
    });

    if (!result.success) {
      const nextErrors: Errors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (key != null) {
          nextErrors[`variants.${lastIndex}.${String(key)}`] = issue.message;
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

      if (String(path[0]) === 'variants' && path.length >= 3) {
        nextErrors[`variants.${String(path[1])}.${String(path[2])}`] = issue.message;
        return;
      }

      const key = path.map((segment) => String(segment)).join('.');
      if (!nextErrors[key]) {
        nextErrors[key] = issue.message;
      }
    });

    return nextErrors;
  };

  const validateConfigRequiredFields = (payload: {
    productType: ProductType;
    name: string;
    category: string;
    shortDescription: string;
    description: string;
    usage: string;
    ingredients: string[];
    specifications: Record<string, string>;
    features: string[];
    benefits: string[];
    tags: string[];
  }) => {
    const nextErrors: Errors = {};

    activeTypeConfig.requiredFields.forEach((field) => {
      if (field === 'variants' || field === 'images' || field === 'productType') return;

      if (field === 'ingredients') {
        if (isCrossLifeType(payload.productType) && payload.ingredients.length === 0) {
          nextErrors.ingredients = 'Ingredients are required for Cross Life products';
        }
        return;
      }

      if (field === 'specifications') {
        if (
          isCrossLineType(payload.productType) &&
          Object.keys(payload.specifications).length === 0
        ) {
          nextErrors.specifications =
            'Specifications are required for Cross Line products';
        }
        return;
      }

      const value = (payload as Record<string, unknown>)[field];
      if (typeof value === 'string' && !value.trim()) {
        nextErrors[field] = `${fieldLabel(field)} is required`;
        return;
      }
      if (Array.isArray(value) && value.length === 0) {
        nextErrors[field] = `${fieldLabel(field)} is required`;
      }
    });

    return nextErrors;
  };

  const handleBackendError = (error: unknown) => {
    const parsed = parseApiError(error, 'Something went wrong. Please try again.');
    const messages: Errors = { ...parsed.fieldErrors };

    if (!Object.keys(messages).length) {
      messages.name = parsed.message;
    } else if (parsed.message) {
      messages._form = parsed.message;
    }

    setErrors((prev) => ({ ...prev, ...messages }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (totalImageCount > MAX_IMAGES) {
        setErrors((prev) => ({
          ...prev,
          images: 'You can upload up to 9 images',
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

      const productType: ProductType = normalizeProductType(formData.productType);

      const showIngredients = isFieldVisible('ingredients');
      const showSpecifications = isFieldVisible('specifications');

      const payload = {
        name: formData.name,
        productType,
        category: formData.category,
        shortDescription: formData.shortDescription || '',
        description: formData.description || '',
        usage: formData.usage || '',
        ingredients: showIngredients ? splitClean(formData.ingredients) : [],
        specifications: showSpecifications
          ? buildSpecificationsPayload(formData.specifications || [])
          : {},
        features: isFieldVisible('features') ? splitClean(formData.features) : [],
        benefits: isFieldVisible('benefits') ? splitClean(formData.benefits) : [],
        tags: isFieldVisible('tags') ? splitClean(formData.tags) : [],
        variants: buildVariantPayload(formData.variants, productType),
      };

      const schema = isEdit ? updateProductSchema : createProductSchema;
      const result = schema.safeParse(payload);
      const configErrors = validateConfigRequiredFields(payload);
      const zodErrors = result.success ? {} : mapValidationErrors(result.error.issues);
      const nextErrors = { ...zodErrors, ...configErrors };

      if (Object.keys(nextErrors).length) {
        // Surface a form-level message when validation fails but field errors
        // might be scrolled out of view / not mapped to a visible input.
        if (!nextErrors._form) {
          const firstMessage = Object.values(nextErrors)[0];
          nextErrors._form =
            firstMessage || 'Please fix the highlighted fields and try again.';
        }
        setErrors(nextErrors);
        return;
      }

      setErrors({});

      const data = new FormData();
      data.append('name', payload.name);
      data.append('productType', payload.productType);
      data.append('category', payload.category);
      data.append('shortDescription', payload.shortDescription);
      data.append('description', payload.description);
      data.append('usage', payload.usage);
      data.append('ingredients', JSON.stringify(payload.ingredients));
      data.append('specifications', JSON.stringify(payload.specifications));
      data.append('features', JSON.stringify(payload.features));
      data.append('benefits', JSON.stringify(payload.benefits));
      data.append('tags', JSON.stringify(payload.tags));
      data.append('variants', JSON.stringify(payload.variants));

      if (isEdit) {
        data.append('existingImages', JSON.stringify(existingImages));
      }

      newImages.forEach((item) => {
        data.append('images', item.file);
      });

      const altTexts = newImages.map((item) => item.altText || '');
      if (altTexts.some((text) => text.trim())) {
        data.append('imageAltTexts', JSON.stringify(altTexts));
      }

      if (newVideo) {
        data.append('video', newVideo.file);
        if (newVideo.altText.trim()) {
          data.append('videoAltText', newVideo.altText);
        }
      } else if (videoRemoved) {
        data.append('existingVideo', '');
      } else if (isEdit && existingVideo) {
        data.append('existingVideo', JSON.stringify(existingVideo));
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

  const isGrocery = isCrossLifeType(formData.productType);
  const isElectronics = isCrossLineType(formData.productType);
  const variantNameLabel = isGrocery ? 'Name / Weight' : 'Variant Name';
  const variantNamePlaceholder = isGrocery ? 'e.g. 250g' : 'e.g. 64GB Black';

  const addSpecification = () => {
    setFormData((prev: any) => ({
      ...prev,
      specifications: [...(prev.specifications || []), { ...emptySpecification }],
    }));
  };

  const removeSpecification = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      specifications: (prev.specifications || []).filter((_: any, i: number) => i !== index),
    }));
  };

  const handleSpecificationChange = (
    index: number,
    field: 'key' | 'value',
    value: string,
  ) => {
    setFormData((prev: any) => {
      const next = [...(prev.specifications || [])];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, specifications: next };
    });
    if (errors.specifications) {
      setFieldError('specifications');
    }
  };

  const baseInputClass =
    'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#7A330F] focus:ring-4 focus:ring-[#7A330F]/10 disabled:cursor-not-allowed disabled:opacity-50';
  const sectionLabelClass = 'text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500';
  const sectionCardClass = 'rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6';

  const productTypeOptions = productTypeConfigs.length
    ? productTypeConfigs
    : PRODUCT_TYPES.map((code) => ({
        code,
        label: formatProductTypeLabel(code),
      }));

  const requiredMark = (field: string) =>
    isFieldRequired(field) ? <span className="text-rose-500"> *</span> : null;

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
            {errors._form && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errors._form}
              </div>
            )}

            <div className={sectionCardClass}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-600">
                    Product media
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Up to 9 images ({totalImageCount}/{MAX_IMAGES}) and 1 video. Both are optional.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div
                  onClick={() => {
                    if (totalImageCount < MAX_IMAGES) fileInputRef.current?.click();
                    else setFieldError('images', 'You can upload up to 9 images');
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`group relative flex min-h-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-[1.5rem] border-2 border-dashed transition ${
                    isDragging
                      ? 'border-[#7A330F] bg-[#7A330F]/5'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2 p-5 text-center text-slate-400">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <UploadCloud size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Images</p>
                      <p className="mt-1 text-xs">JPEG, PNG, or WebP · 5MB each</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                  />
                </div>

                <div
                  onClick={() => videoInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsVideoDragging(true);
                  }}
                  onDragLeave={() => setIsVideoDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsVideoDragging(false);
                    handleVideoSelect(e.dataTransfer.files);
                  }}
                  className={`group relative flex min-h-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-[1.5rem] border-2 border-dashed transition ${
                    isVideoDragging
                      ? 'border-[#7A330F] bg-[#7A330F]/5'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2 p-5 text-center text-slate-400">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <UploadCloud size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Video</p>
                      <p className="mt-1 text-xs">One MP4 · up to 50MB</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={videoInputRef}
                    onChange={(e) => handleVideoSelect(e.target.files)}
                    className="hidden"
                    accept="video/mp4"
                  />
                </div>
              </div>

              {mediaSlides.length > 0 && (
                <div className="mt-4 space-y-3">
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
                    {mediaSlides[previewIndex]?.kind === 'video' ? (
                      <video
                        key={mediaSlides[previewIndex].key}
                        src={mediaSlides[previewIndex].src}
                        className="max-h-72 w-full bg-black object-contain"
                        controls
                      />
                    ) : (
                      <img
                        key={mediaSlides[previewIndex]?.key}
                        src={mediaSlides[previewIndex]?.src}
                        alt={`Product media ${previewIndex + 1}`}
                        className="max-h-72 w-full bg-slate-100 object-contain"
                      />
                    )}

                    {mediaSlides.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewIndex((index) =>
                              index === 0 ? mediaSlides.length - 1 : index - 1,
                            )
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white"
                          aria-label="Previous file"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewIndex((index) =>
                              index === mediaSlides.length - 1 ? 0 : index + 1,
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white"
                          aria-label="Next file"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </>
                    )}

                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <span className="rounded-full bg-white/15 px-2 py-1 text-xs text-white">
                        {mediaSlides[previewIndex]?.kind === 'video' ? 'Video' : 'Image'}{' '}
                        {previewIndex + 1}/{mediaSlides.length}
                      </span>
                      <div className="flex gap-1">
                        {mediaSlides[previewIndex]?.kind === 'image' && (
                          <>
                            <button
                              type="button"
                              onClick={() => moveCurrentImage(-1)}
                              className="rounded-full bg-white/15 p-1.5 text-white"
                              aria-label="Move image earlier"
                            >
                              <ChevronLeft size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveCurrentImage(1)}
                              className="rounded-full bg-white/15 p-1.5 text-white"
                              aria-label="Move image later"
                            >
                              <ChevronRight size={14} />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={removeCurrentMedia}
                          className="rounded-full bg-white/15 p-1.5 text-white"
                          aria-label="Remove file"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {(showAllThumbs
                      ? mediaSlides
                      : mediaSlides.slice(0, THUMBNAIL_PREVIEW_COUNT)
                    ).map((slide) => {
                      const selectedIndex = mediaSlides.findIndex((item) => item.key === slide.key);
                      return (
                        <button
                          key={slide.key}
                          type="button"
                          onClick={() => setPreviewIndex(selectedIndex)}
                          className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border ${
                            selectedIndex === previewIndex
                              ? 'border-[#7A330F]'
                              : 'border-slate-200'
                          }`}
                        >
                          {slide.kind === 'video' ? (
                            <video src={slide.src} className="h-full w-full object-cover" muted />
                          ) : (
                            <img src={slide.src} alt="" className="h-full w-full object-cover" />
                          )}
                          {slide.kind === 'video' && (
                            <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 text-[10px] text-white">
                              Video
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {mediaSlides.length > THUMBNAIL_PREVIEW_COUNT && (
                    <button
                      type="button"
                      onClick={() => setShowAllThumbs((open) => !open)}
                      className="text-xs font-semibold text-[#7A330F]"
                    >
                      {showAllThumbs
                        ? 'Show less'
                        : `View more (${mediaSlides.length - THUMBNAIL_PREVIEW_COUNT})`}
                    </button>
                  )}
                </div>
              )}

              {errors.images && (
                <p className="mt-2 text-xs text-rose-500">{errors.images}</p>
              )}
              {errors.video && (
                <p className="mt-2 text-xs text-rose-500">{errors.video}</p>
              )}

              <div className="mt-5 space-y-4">
                {isFieldVisible('name') && (
                  <div className="space-y-2">
                    <label className={sectionLabelClass}>
                      Product Name
                      {requiredMark('name')}
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter product name"
                      className={baseInputClass}
                    />
                    {errors.name && <p className="pl-1 text-xs text-rose-500">{errors.name}</p>}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className={sectionLabelClass}>
                      Product Type
                      {requiredMark('productType')}
                    </label>
                    <select
                      name="productType"
                      value={formData.productType}
                      onChange={handleChange}
                      disabled={typesLoading}
                      className={baseInputClass}
                    >
                      {productTypeOptions.map((type) => (
                        <option key={type.code} value={type.code}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.productType && (
                      <p className="pl-1 text-xs text-rose-500">{errors.productType}</p>
                    )}
                  </div>

                  {isFieldVisible('category') && (
                    <div className="space-y-2">
                      <label className={sectionLabelClass}>
                        Category
                        {requiredMark('category')}
                      </label>
                      <input
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="Enter category"
                        className={baseInputClass}
                      />
                      {errors.category && (
                        <p className="pl-1 text-xs text-rose-500">{errors.category}</p>
                      )}
                    </div>
                  )}
                </div>

                {isFieldVisible('usage') && (
                  <div className="space-y-2">
                    <label className={sectionLabelClass}>
                      Usage
                      {requiredMark('usage')}
                    </label>
                    <input
                      name="usage"
                      value={formData.usage}
                      onChange={handleChange}
                      placeholder="How should the product be used?"
                      className={baseInputClass}
                    />
                    {errors.usage && <p className="pl-1 text-xs text-rose-500">{errors.usage}</p>}
                  </div>
                )}

                {isFieldVisible('shortDescription') && (
                  <div className="space-y-2">
                    <label className={sectionLabelClass}>
                      Short Description
                      {requiredMark('shortDescription')}
                    </label>
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
                )}
              </div>
            </div>

            {isFieldVisible('description') && (
              <div className={sectionCardClass}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlignLeft size={14} className="text-[#7A330F]" />
                    <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-600">
                      Product Details
                      {requiredMark('description')}
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
            )}

            {isFieldVisible('variants') && (
              <div className={sectionCardClass}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold tracking-[0.18em] text-slate-600 uppercase">
                      Variants
                      {requiredMark('variants')}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {isGrocery
                        ? 'Add weight/name, price, MRP and stock per variant'
                        : 'Add variant name, price, MRP and stock'}
                    </p>
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

                {errors.variants && (
                  <p className="mt-2 text-xs text-rose-500">{errors.variants}</p>
                )}

                <div className="space-y-4 pt-1">
                  {formData.variants.map((variant: any, index: number) => (
                    <div key={index} className="rounded-[1.5rem] p-4 sm:p-5">
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
                          <label className={sectionLabelClass}>{variantNameLabel}</label>
                          <input
                            value={variant.name}
                            onChange={(e) =>
                              handleVariantChange(index, 'name', e.target.value)
                            }
                            placeholder={variantNamePlaceholder}
                            className={baseInputClass}
                          />
                          {getVariantError(index, 'name') && (
                            <p className="pl-1 text-xs text-rose-500">
                              {getVariantError(index, 'name')}
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
            )}

            <div className={sectionCardClass}>
              <div className="mb-4">
                <h3 className="text-sm font-bold tracking-[0.18em] text-slate-600 uppercase">
                  Product Meta
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Keep these values short and comma separated.
                </p>
              </div>

              {isFieldVisible('specifications') && isElectronics ? (
                <div className="mb-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className={sectionLabelClass}>
                      Specifications
                      {requiredMark('specifications')}
                    </h4>
                    <button
                      type="button"
                      onClick={addSpecification}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#7A330F] hover:text-[#7A330F]"
                    >
                      <PlusCircle size={14} />
                      Add Spec
                    </button>
                  </div>

                  {(formData.specifications || []).map((spec: any, index: number) => (
                    <div key={index} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
                      <input
                        value={spec.key}
                        onChange={(e) =>
                          handleSpecificationChange(index, 'key', e.target.value)
                        }
                        placeholder="e.g. Voltage"
                        className={baseInputClass}
                      />
                      <input
                        value={spec.value}
                        onChange={(e) =>
                          handleSpecificationChange(index, 'value', e.target.value)
                        }
                        placeholder="e.g. 220V"
                        className={baseInputClass}
                      />
                      {(formData.specifications || []).length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeSpecification(index)}
                          className="rounded-full p-2 text-rose-500 transition hover:bg-rose-50"
                          aria-label={`Remove specification ${index + 1}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : null}
                    </div>
                  ))}
                  {errors.specifications && (
                    <p className="pl-1 text-xs text-rose-500">{errors.specifications}</p>
                  )}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  ...(isFieldVisible('ingredients')
                    ? [{ name: 'ingredients', label: 'Ingredients' }]
                    : []),
                  ...(isFieldVisible('features')
                    ? [{ name: 'features', label: 'Features' }]
                    : []),
                  ...(isFieldVisible('benefits')
                    ? [{ name: 'benefits', label: 'Benefits' }]
                    : []),
                  ...(isFieldVisible('tags') ? [{ name: 'tags', label: 'Tags' }] : []),
                ].map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label className={sectionLabelClass}>
                      {field.label}
                      {requiredMark(field.name)}
                    </label>
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
