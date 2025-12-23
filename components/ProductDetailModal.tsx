
import React, { useEffect } from 'react';
import { X, ShoppingCart, CheckCircle, Tag, ShieldCheck } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isOpen, onClose, onAddToCart }) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row animate-fade-in-up max-h-[90vh] md:h-auto">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-gray-100 z-10 transition-colors shadow-sm"
        >
            <X size={24} className="text-gray-600" />
        </button>
        
        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-gray-50 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
            <div className="relative w-full h-64 md:h-96">
                <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain drop-shadow-xl mix-blend-multiply" 
                />
            </div>
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
            <div className="mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-[#006838] tracking-wider bg-green-50 px-2.5 py-1 rounded-md">
                    <Tag size={12} />
                    {product.category}
                </span>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{product.name}</h2>
            
            <div className="text-2xl font-black text-[#006838] mb-2 pb-4 border-b border-gray-100">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
            </div>
            
            {/* Warranty Info */}
            {product.warranty && (
                <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-700">
                    <ShieldCheck size={18} className="text-[#006838]" />
                    <span>Bảo hành: {product.warranty}</span>
                </div>
            )}
            
            <p className="text-gray-600 mb-6 leading-relaxed text-sm md:text-base">
                {product.description}
            </p>

            <div className="space-y-3 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm uppercase mb-2">Thông số kỹ thuật</h3>
                <ul className="space-y-2.5">
                    {product.specs.map((spec, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                            <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                            <span className="font-medium">{spec}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-auto pt-4">
                <button
                    onClick={() => {
                        onAddToCart(product);
                        onClose();
                    }}
                    className="w-full bg-[#006838] hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-green-900/20 active:scale-[0.98] group"
                >
                    <ShoppingCart className="group-hover:animate-bounce" /> Thêm vào giỏ hàng
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};