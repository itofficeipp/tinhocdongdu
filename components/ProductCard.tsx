
import React from 'react';
import { Product, Category } from '../types';
import { ShoppingCart, Printer, HardDrive, Cpu, Wrench, Monitor, Eye, Box } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onClick }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getIcon = () => {
    if (product.category === Category.NAS) return <HardDrive className="w-5 h-5 text-green-500" />;
    if (product.category === Category.SERVER) return <Printer className="w-5 h-5 text-green-700" />;
    if (product.category === Category.SERVICE) return <Wrench className="w-5 h-5 text-blue-600" />;
    if (product.category === Category.PC_LAPTOP) return <Monitor className="w-5 h-5 text-gray-700" />;
    if (product.category === Category.OTHER) return <Box className="w-5 h-5 text-gray-500" />;
    return <Cpu className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full group cursor-pointer"
      onClick={() => onClick(product)}
    >
      <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1 shadow-sm">
                <Eye size={14} /> Xem chi tiết
            </span>
        </div>
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm z-10">
          {product.category}
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          {getIcon()}
          <h3 className="text-lg font-bold text-gray-800 line-clamp-1 group-hover:text-[#006838] transition-colors" title={product.name}>
            {product.name}
          </h3>
        </div>
        
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
          {product.description}
        </p>
        
        <div className="space-y-2 mb-4">
          {product.specs.slice(0, 2).map((spec, index) => (
            <div key={index} className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
              {spec}
            </div>
          ))}
          {product.specs.length > 2 && (
             <div className="text-xs text-gray-400 pl-4 italic">+ {product.specs.length - 2} thông số khác</div>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <span className="text-xl font-bold text-green-600">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={(e) => {
                e.stopPropagation(); // Prevent opening modal when clicking Buy Now
                onAddToCart(product);
            }}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium active:scale-95 shadow-md hover:shadow-green-500/20"
          >
            <ShoppingCart size={16} />
            Mua ngay
          </button>
        </div>
      </div>
    </div>
  );
};
