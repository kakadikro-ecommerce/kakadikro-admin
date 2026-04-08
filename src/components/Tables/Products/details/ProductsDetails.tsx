import React from 'react';
import {
  Box,
  Tag,
  Info,
  X,
  Heart,
  Layers,
  ClipboardList,
} from 'lucide-react';
import { Product } from '../../../../types/product';
import { Modal } from '../../../../pages/UiElements/Modal';

interface LocalVariant {
  weight: string;
  price: number;
  mrp: number;
  stock: number;
}

interface ProductViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductViewModal: React.FC<ProductViewModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  if (!product) return null;

  const variants = (product.variants || []) as unknown as LocalVariant[];

  const getDisplayImage = (): string => {
    const rawImages = product.images as unknown as Array<string | { url?: string }>;
    if (!Array.isArray(rawImages) || rawImages.length === 0) {
      return '/placeholder-spice.png';
    }

    const firstImg = rawImages[0];
    return typeof firstImg === 'string'
      ? firstImg
      : firstImg?.url || '/placeholder-spice.png';
  };

  const totalStock = variants.reduce(
    (acc, curr) => acc + (Number(curr.stock) || 0),
    0,
  );

  const benefits = [
    ...(Array.isArray(product.features) ? product.features : []),
    ...(Array.isArray(product.benefits) ? product.benefits : []),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="mx-auto flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-[#4E342E] px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-white/10 p-2">
              <Box className="text-white" size={18} />
            </div>
            <h2 className="text-lg font-semibold tracking-wide">
              Product Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 transition hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto space-y-6 p-5 pb-10 md:p-6">
          <div className="overflow-hidden rounded-2xl shadow-sm">
            <div className="relative flex min-h-[240px] items-center justify-center p-4 sm:min-h-[320px]">
              <div className="absolute inset-0" />
              <img
                src={getDisplayImage()}
                alt={product.name}
                className="relative z-10 max-h-[280px] w-full max-w-[420px] object-contain drop-shadow-2xl sm:max-h-[340px]"
              />
            </div>

            <div className="space-y-4 px-5 py-5 md:px-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#F5F5F5] px-3 py-1 text-xs text-[#6D4C41]">
                  {product.brand || 'Brand'}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${product.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                    }`}
                >
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-[#3E2723] md:text-3xl">
                  {product.name}
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-gray-600">
                  {product.shortDescription}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div className="rounded-xl bg-white px-3 py-3 shadow-sm ring-1 ring-gray-100">
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="mt-1 font-medium text-[#3E2723]">
                    {product.category || '—'}
                  </p>
                </div>
                <div className="rounded-xl bg-white px-3 py-3 shadow-sm ring-1 ring-gray-100">
                  <p className="text-xs text-gray-500">Sizes</p>
                  <p className="mt-1 font-medium text-[#3E2723]">
                    {variants.map(v => v.weight).join(', ') || '—'}
                  </p>
                </div>
                <div className="rounded-xl bg-white px-3 py-3 shadow-sm ring-1 ring-gray-100">
                  <p className="text-xs text-gray-500">Stock</p>
                  <p className="mt-1 font-medium text-[#3E2723]">{totalStock}</p>
                </div>
                <div className="rounded-xl bg-white px-3 py-3 shadow-sm ring-1 ring-gray-100">
                  <p className="text-xs text-gray-500">Rating</p>
                  <p className="mt-1 font-medium text-[#3E2723]">
                    {product.rating}0
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#6D4C41]">
              <Layers size={14} /> Variants
            </h3>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="grid grid-cols-4 bg-[#F9F6F4] px-3 py-2 text-xs font-medium text-[#6D4C41]">
                <span>Size</span>
                <span>Price</span>
                <span>MRP</span>
                <span>Stock</span>
              </div>

              {variants.map((v, i) => (
                <div
                  key={i}
                  className="grid grid-cols-4 border-t px-3 py-3 text-sm text-[#3E2723]"
                >
                  <span>{v.weight}</span>
                  <span className="font-medium">₹{v.price}</span>
                  <span className="text-gray-400 line-through">₹{v.mrp}</span>
                  <span>{v.stock}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#6D4C41]">
              <Tag size={14} /> Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {product.tags?.map(tag => (
                <span
                  key={tag}
                  className="rounded-full bg-[#F5F5F5] px-3 py-1 text-xs text-[#6D4C41]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#6D4C41]">
              <Heart size={14} /> Benefits
            </h3>

            <ul className="list-disc space-y-1 pl-5 text-sm text-[#3E2723]">
              {benefits.length > 0 ? (
                benefits.map((item, i) => <li key={i}>{item}</li>)
              ) : (
                <li>No benefits listed</li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#6D4C41]">
              <ClipboardList size={14} /> Ingredients
            </h3>
            <p className="text-sm text-[#3E2723]">
              {product.ingredients?.join(', ') || '—'}
            </p>
          </div>

          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#6D4C41]">
              <Info size={14} /> Description
            </h3>
            <p className="mb-4 text-sm text-[#3E2723]">
              {product.description || '—'}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProductViewModal;
