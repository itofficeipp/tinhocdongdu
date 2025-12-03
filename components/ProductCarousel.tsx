
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';

interface ProductCarouselProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({ 
  products, 
  onAddToCart,
  onProductClick 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(3);
  const [isPaused, setIsPaused] = useState(false);

  // Responsive check for itemsPerSlide
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerSlide(1);
      else if (window.innerWidth < 1024) setItemsPerSlide(2);
      else setItemsPerSlide(3);
    };
    
    // Initial call
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (products.length <= itemsPerSlide || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 4000); // 4 seconds per slide

    return () => clearInterval(interval);
  }, [products.length, itemsPerSlide, isPaused]);

  if (!products || products.length === 0) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  // Get visible items ensuring loop
  const getVisibleProducts = () => {
    const visible = [];
    for (let i = 0; i < itemsPerSlide; i++) {
      visible.push(products[(currentIndex + i) % products.length]);
    }
    return visible;
  };

  const visibleProducts = getVisibleProducts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-12 animate-fade-in-up">
      {/* Section Title */}
      <div className="flex flex-col items-center mb-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight">
            Sản Phẩm Nổi Bật
          </h2>
          <div className="w-24 h-1 bg-yellow-400 mt-3 rounded-full"></div>
      </div>

      <div 
        className="relative group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Navigation Buttons */}
        {products.length > itemsPerSlide && (
          <>
            <button 
                onClick={prevSlide}
                className="absolute -left-4 lg:-left-12 top-1/2 -translate-y-1/2 z-20 bg-white border border-gray-100 text-gray-600 hover:text-[#006838] p-3 rounded-full shadow-lg hover:scale-110 transition-all hidden md:flex"
            >
                <ChevronLeft size={24} />
            </button>
            <button 
                onClick={nextSlide}
                className="absolute -right-4 lg:-right-12 top-1/2 -translate-y-1/2 z-20 bg-white border border-gray-100 text-gray-600 hover:text-[#006838] p-3 rounded-full shadow-lg hover:scale-110 transition-all hidden md:flex"
            >
                <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Carousel Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleProducts.map((product, idx) => (
                <div 
                    key={`${product.id}-${idx}`}
                    className="bg-white rounded-2xl p-3 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col items-center text-center h-full group/card"
                    onClick={() => onProductClick(product)}
                >
                    {/* Image Area - Aspect ratio fixed at 16/10 for consistency */}
                    <div className="relative w-full aspect-[16/10] mb-3 overflow-hidden rounded-xl bg-gray-50 p-2">
                        <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-contain transform group-hover/card:scale-110 transition-transform duration-500" 
                        />
                        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                            Hot
                        </div>
                    </div>
                    
                    {/* Content - Fixed Heights enforced to prevent layout jumps */}
                    <div className="h-5 flex items-center justify-center mb-1 w-full">
                         <div className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate px-2">
                            {product.category}
                        </div>
                    </div>
                    
                    <div className="h-14 flex items-center justify-center mb-2 w-full px-2">
                        <h3 className="text-gray-900 font-bold text-lg line-clamp-2 group-hover/card:text-[#006838] transition-colors">
                            {product.name}
                        </h3>
                    </div>
                    
                    <div className="h-8 flex items-center justify-center mb-3 w-full">
                        <div className="text-[#006838] font-black text-xl">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                        </div>
                    </div>
                    
                    <button 
                         onClick={(e) => {
                             e.stopPropagation();
                             onAddToCart(product);
                         }}
                         className="mt-auto bg-gray-50 hover:bg-[#006838] text-gray-700 hover:text-white px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 group/btn w-full justify-center sm:w-auto"
                    >
                        <ShoppingCart size={16} />
                        <span>Mua Ngay</span>
                    </button>
                </div>
            ))}
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8">
             {products.map((_, idx) => (
                 <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === (currentIndex % products.length)
                        ? 'bg-[#006838] w-8' 
                        : 'bg-gray-300 hover:bg-green-300 w-2'
                    }`}
                 />
             ))}
        </div>
      </div>
    </div>
  );
};
