import React from 'react';
import {
  Box,
  Tag,
  Info,
  Scale,
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
  const firstVariant =
    variants.length > 0
      ? variants[0]
      : { price: 0, mrp: 0, stock: 0, weight: 'N/A' };

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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="mx-auto flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between bg-[#2D1B18] px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-[#3E2723] p-1.5 text-white shadow-sm">
              <Box size={14} />
            </div>
            <h2 className="text-lg font-bold tracking-widest text-white">
              Product Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-[#A69080] transition-all hover:bg-[#F3EBE1]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="custom-scrollbar min-h-0 flex-1 space-y-8 overflow-y-auto p-4 md:p-6">
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
            <div className="relative h-40 w-40 flex-shrink-0 md:h-48 md:w-48">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[1.5rem] bg-white p-4">
                <img
                  src={getDisplayImage()}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>

            <div className="flex-1 space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <span className="rounded bg-[#F3EBE1] px-2 py-0.5 text-[9px] font-bold tracking-tighter text-[#A69080]">
                  {product.brand || 'KD Masale'}
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-[9px] font-bold ${
                    product.isActive
                      ? 'bg-[#E7F8F2] text-[#00A36C]'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h1 className="text-xl font-black tracking-tight text-[#3E2723] md:text-1xl">
                {product.name}
              </h1>
              <p className="text-[11px] font-medium text-[#A69080] opacity-80">
                "{product.shortDescription || 'Authentic Spice Blend'}"
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-6 rounded-[1.5rem] p-5 lg:col-span-2">
              <div className="flex items-center gap-2 pb-2 text-[13px] font-bold tracking-widest text-[#A69080]">
                <Layers size={12} />
                <span>Spice Profile</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#A69080]">
                    <Tag size={11} /> Category
                  </h3>
                  <div className="text-[13px] font-bold text-[#3E2723]">
                    {product.category || 'Spices'}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#A69080]">
                    <Scale size={11} /> Sizes
                  </h3>
                  <div className="text-[13px] font-bold text-[#3E2723]">
                    {variants.length > 0
                      ? variants.map((v) => v.weight).join(' | ')
                      : 'Standard'}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#A69080]">
                    Stock Count
                  </h3>
                  <div className="text-[13px] font-bold text-[#3E2723]">
                    {totalStock} Units
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#A69080]">
                    Rating
                  </h3>
                  <div className="text-[13px] font-bold text-[#3E2723]">
                    {product.rating || 5}.0 / 5.0
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-[1.5rem] p-5">
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#A69080]">
                  Tags
                </h3>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {Array.isArray(product.tags) &&
                    product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-gray-50 bg-white px-2 py-0.5 text-[13px] tracking-tighter text-[#A69080] shadow-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-4 rounded-[1.5rem] p-5">
              <h3 className="pb-2 text-[9px] font-black tracking-[0.2em] text-[#A69080]">
                Pricing & Variants
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="mb-0.5 text-[11px] font-black tracking-widest text-[#A69080]">
                    Our Price
                  </p>
                  <p className="text-xl font-black tracking-tight text-[#3E2723]">
                    Rs {firstVariant.price}
                  </p>
                </div>
                <div>
                  <p className="mb-0.5 text-[11px] font-black tracking-widest text-[#A69080]">
                    Market Price
                  </p>
                  <p className="text-[12px] font-bold text-[#A69080] line-through">
                    Rs {firstVariant.mrp}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 divide-y divide-gray-100 pb-2">
            <div className="flex flex-col gap-3 rounded-[1.5rem] py-5">
              <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#A69080]">
                <Heart size={12} className="text-red-400" /> Benefits
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(product.features) ? product.features : [])
                  .concat(
                    Array.isArray(product.benefits) ? product.benefits : [],
                  )
                  .map((item: string, i) => (
                    <div
                      key={i}
                      title={item}
                      className="rounded-md border border-gray-100 bg-gray-50 px-2 py-1 text-[11px] font-bold text-[#3E2723]"
                    >
                      {item.length > 15 ? `${item.substring(0, 15)}...` : item}
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-[1.5rem] py-5">
              <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#A69080]">
                <ClipboardList size={12} /> Ingredients
              </h3>
              <div className="text-[13px] font-bold leading-relaxed text-[#3E2723]/70">
                {Array.isArray(product.ingredients)
                  ? product.ingredients.join(' | ')
                  : 'Natural Spices Selection'}
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-[1.5rem] py-5">
              <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#A69080]">
                <Info size={12} /> Description
              </h3>
              <div className="text-[13px] font-medium leading-normal text-[#3E2723] opacity-80">
                {product.description || 'Verified traditional blend.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProductViewModal;
