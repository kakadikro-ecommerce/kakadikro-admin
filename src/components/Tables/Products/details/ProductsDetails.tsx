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
    const rawImages = product.images as unknown as any[];
    if (!Array.isArray(rawImages) || rawImages.length === 0)
      return '/placeholder-spice.png';
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
      <div className="w-full max-w-4xl mx-auto bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[92vh] border border-[#3E2723] overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#3E2723]/30 bg-[#3E2723] shrink-0flex justify-between items-center px-6 py-4 border-b border-white/10 bg-[#2D1B18] shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-[#3E2723] p-1.5 rounded-lg text-white shadow-sm">
              <Box size={14} />
            </div>
            <h2 className="text-[#fff] font-bold  tracking-widest text-[10px]">
              Product Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#F3EBE1] rounded-full text-[#A69080] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 custom-scrollbar min-h-0">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="w-40 h-40 md:w-48 md:h-48 flex-shrink-0 relative">
              <div className="w-full h-full rounded-[1.5rem] border-2 border-[#F3EBE1] p-4 bg-white flex items-center justify-center overflow-hidden">
                <img
                  src={getDisplayImage()}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="flex-1 space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="bg-[#F3EBE1] text-[#A69080] text-[9px] px-2 py-0.5 rounded font-bold tracking-tighter border border-[#EFE4D5]">
                  {product.brand || 'KD Masale'}
                </span>
                <span
                  className={`px-2 py-0.5 text-[9px] font-bold rounded border ${
                    product.isActive
                      ? 'bg-[#E7F8F2] text-[#00A36C] border-[#B2EBD3]'
                      : 'bg-red-50 text-red-600 border-red-100'
                  }`}
                >
                  ● {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h1 className="text-xl md:text-1xl font-black text-[#3E2723] tracking-tight">
                {product.name}
              </h1>
              <p className="text-[#A69080] font-medium text-[11px] opacity-80">
                "{product.shortDescription || 'Authentic Spice Blend'}"
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-[#FDFBF9] p-5 rounded-[1.5rem] border border-[#EFE4D5] space-y-6">
              <div className="flex items-center gap-2 text-[#A69080] font-bold tracking-widest text-[9px] border-b border-[#F3EBE1] pb-2">
                <Layers size={12} />
                <span>Spice Profile</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DetailItem
                  label="Category"
                  value={product.category || 'Spices'}
                  icon={<Tag size={11} />}
                />
                <DetailItem
                  label="Sizes"
                  value={
                    variants.length > 0
                      ? variants.map((v) => v.weight).join(' • ')
                      : 'Standard'
                  }
                  icon={<Scale size={11} />}
                />
                <DetailItem label="Stock Count" value={`${totalStock} Units`} />
                <DetailItem
                  label="Rating"
                  value={`${product.rating || 5}.0 / 5.0`}
                />
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {Array.isArray(product.tags) &&
                  product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[8px] font-bold text-[#A69080] tracking-tighter bg-white px-2 py-0.5 rounded border border-[#EFE4D5]"
                    >
                      #{tag}
                    </span>
                  ))}
              </div>
            </div>
            <div className="bg-[#FDFBF9] p-5 rounded-[1.5rem] border border-[#EFE4D5] flex flex-col justify-center space-y-4 shadow-sm">
              <h3 className="text-[9px] font-black tracking-[0.2em] text-[#A69080] border-b border-[#F3EBE1] pb-2">
                Pricing & Variants
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[#A69080] font-black text-[8px] tracking-widest opacity-70 mb-0.5">
                    Our Price
                  </p>
                  <p className="text-xl font-black text-[#3E2723] tracking-tight">
                    ₹{firstVariant.price}
                  </p>
                </div>
                <div>
                  <p className="text-[#A69080] font-black text-[8px] tracking-widest opacity-50 mb-0.5">
                    Market Price
                  </p>
                  <p className="text-[12px] font-bold text-[#A69080] line-through opacity-40">
                    ₹{firstVariant.mrp}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
            <div className="bg-[#FDFBF9] p-5 rounded-[1.5rem] border border-[#EFE4D5] flex flex-col gap-3">
              <h3 className="flex items-center gap-2 text-[9px] font-bold text-[#A69080] tracking-widest">
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
                      className="bg-white px-2 py-1 rounded-md text-[9px] font-bold text-[#3E2723] border border-[#EFE4D5] shadow-sm max-w-[80px]"
                    >
                      {item.length > 10 ? `${item.substring(0, 10)}...` : item}
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-[#FDFBF9] p-5 rounded-[1.5rem] border border-[#EFE4D5] flex flex-col gap-3">
              <h3 className="flex items-center gap-2 text-[9px] font-bold text-[#A69080] tracking-widest">
                <ClipboardList size={12} /> Ingredients
              </h3>
              <div className="text-[10px] font-bold text-[#3E2723]/70 leading-relaxed">
                {Array.isArray(product.ingredients)
                  ? product.ingredients.join(' • ')
                  : 'Natural Spices Selection'}
              </div>
            </div>

            <div className="bg-[#FDFBF9] p-5 rounded-[1.5rem] border border-[#EFE4D5] flex flex-col gap-3">
              <h3 className="flex items-center gap-2 text-[9px] font-bold text-[#A69080] tracking-widest">
                <Info size={12} /> Description
              </h3>
              <div className="text-[10px] text-[#3E2723] leading-tight font-medium opacity-80">
                {product.description || 'Verified traditional blend.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const DetailItem: React.FC<{
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}> = ({ label, value, icon }) => (
  <div className="space-y-0.5">
    <div className="text-[8px] font-bold tracking-tighter text-[#A69080] flex items-center gap-1.5 opacity-70">
      {icon} {label}
    </div>
    <div className="text-[11px] font-bold text-[#3E2723] truncate">
      {value}
    </div>
  </div>
);

export default ProductViewModal;
