
import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Search, Menu, Phone, Mail, Server, Facebook, Settings, Filter } from 'lucide-react';
import { MOCK_PRODUCTS, STORE_NAME, CONTACT_PHONE, CONTACT_EMAIL, DEFAULT_BANNER_CONFIG } from './constants';
import { Product, CartItem, Category, BannerConfig } from './types';
import { ProductCard } from './components/ProductCard';
import { CartSidebar } from './components/CartSidebar';
import { ChatWidget } from './components/ChatWidget';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ProductCarousel } from './components/ProductCarousel';
import { ProductFilters } from './components/ProductFilters';
import { FloatingAds } from './components/FloatingAds';

// Extended interface for performance optimization
interface ProcessedProduct extends Product {
  _searchableText: string;
  _specString: string;
}

const App: React.FC = () => {
  // Product Data State (Moved from constant to state for Admin manipulation)
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  // Banner Config State
  const [bannerConfig, setBannerConfig] = useState<BannerConfig>(DEFAULT_BANNER_CONFIG);

  // Default to the first category instead of 'ALL'
  const [selectedCategory, setSelectedCategory] = useState<string>(Category.PC_LAPTOP);
  
  // Search States: Split into input (immediate) and query (debounced) for performance
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Filter States
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Admin State
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  
  // Product Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Define the menu structure with explicit order and labels
  const menuItems = [
    { id: Category.PC_LAPTOP, label: 'PC / LAPTOP' },
    { id: Category.SERVER, label: 'MỰC IN / MÁY IN' },
    { id: Category.NETWORK, label: 'THIẾT BỊ MẠNG' },
    { id: Category.ACCESSORY, label: 'LINH KIỆN & PHỤ KIỆN' },
    { id: Category.SERVICE, label: 'THI CÔNG BẢO TRÌ HỆ THỐNG' },
    { id: Category.OTHER, label: 'THIẾT BỊ KHÁC' } // Contains NAS and OTHER
  ];

  // Helper for fuzzy search - normalizes Vietnamese text for better matching
  // Define outside of render or use useCallback, but here simple function is fine
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // 1. Debounce Search Input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchInput);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchInput]);

  // 2. Pre-process Products (Heavy Lifting)
  // We calculate the normalized search strings and joined spec strings ONCE when products change,
  // NOT every time a filter changes.
  const processedProducts: ProcessedProduct[] = useMemo(() => {
    return products.map(product => ({
      ...product,
      _searchableText: normalizeText(`${product.name} ${product.description} ${product.specs.join(' ')} ${product.category}`),
      _specString: normalizeText(`${product.name} ${product.specs.join(' ')}`) // Includes name to match Brands
    }));
  }, [products]);

  // 3. Optimized Filtering Logic
  const filteredProducts = useMemo(() => {
    // Start with the full pre-processed list
    let result = processedProducts;

    // A. Filter by Category (Fastest check first)
    if (selectedCategory) {
       result = result.filter(product => {
        if (selectedCategory === Category.OTHER) {
          return product.category === Category.NAS || product.category === Category.OTHER;
        }
        return product.category === selectedCategory;
      });
    }

    // B. Filter by Search Query (Using pre-computed string)
    if (debouncedSearchQuery.trim()) {
       const normalizedQuery = normalizeText(debouncedSearchQuery);
       const queryTokens = normalizedQuery.split(/\s+/).filter(token => token.length > 0);
       
       result = result.filter(product => {
          // O(1) access to pre-computed string
          return queryTokens.every(token => product._searchableText.includes(token));
       });
    }
    
    // C. Filter by Price (Numeric comparison is fast)
    if (minPrice !== '') {
        result = result.filter(p => p.price >= minPrice);
    }
    if (maxPrice !== '') {
        result = result.filter(p => p.price <= maxPrice);
    }

    // D. Filter by Stock (Boolean check is fast)
    if (inStockOnly) {
        result = result.filter(p => p.inStock !== false);
    }

    // E. Filter by Specs (Using pre-computed string)
    if (selectedSpecs.length > 0) {
        // Prepare normalized specs once per render
        const normalizedSelectedSpecs = selectedSpecs.map(s => normalizeText(s));
        
        result = result.filter(product => {
            // Check against pre-computed _specString
            return normalizedSelectedSpecs.every(spec => product._specString.includes(spec));
        });
    }

    return result;
  }, [selectedCategory, debouncedSearchQuery, processedProducts, minPrice, maxPrice, inStockOnly, selectedSpecs]);

  const featuredProducts = useMemo(() => {
      return products.filter(p => p.isFeatured);
  }, [products]);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };
  
  const toggleSpec = (spec: string) => {
      setSelectedSpecs(prev => 
        prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
      );
  };
  
  const resetFilters = () => {
      setMinPrice('');
      setMaxPrice('');
      setInStockOnly(false);
      setSelectedSpecs([]);
  };

  // Admin Handlers
  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Unified Handler for navigation clicks (Header & Footer)
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setSearchInput(''); // Clear search input
    resetFilters();
    setIsMobileMenuOpen(false); // Close mobile menu if open
    // Scroll to products grid with a small offset for the sticky header
    const element = document.getElementById('products-grid');
    if (element) {
        const headerOffset = 140; // Approx height of sticky header + top bar
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
  };
  
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  // Custom Logo Component
  const DongDuLogo = () => (
    <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16 text-[#006838] flex-shrink-0 transition-transform hover:scale-105 duration-300">
      <circle cx="50" cy="50" r="24" fill="currentColor" />
      <path d="M 68 18 A 40 40 0 1 1 25 82" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
      <circle cx="13" cy="66" r="5" fill="currentColor" />
      <circle cx="10" cy="50" r="4.5" fill="currentColor" />
      <circle cx="15" cy="34" r="4" fill="currentColor" />
      <circle cx="26" cy="21" r="3.5" fill="currentColor" />
      <circle cx="40" cy="13" r="3" fill="currentColor" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
      {/* Floating Ads */}
      <FloatingAds config={bannerConfig} />

      {/* Top Bar */}
      <div className="bg-gradient-to-r from-[#004d2a] to-[#006838] text-white py-2 px-4 text-xs sm:text-sm shadow-md z-50 relative">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <p className="hidden sm:block font-medium tracking-wide">Công nghệ cho cuộc sống, chất lượng cho niềm tin</p>
          <div className="flex gap-6">
            <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="flex items-center gap-1.5 hover:text-yellow-300 transition-colors font-bold">
              <Phone size={14} className="animate-pulse" /> {CONTACT_PHONE}
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-1.5 hover:text-yellow-300 transition-colors">
              <Mail size={14} /> {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* Logo Section */}
            <div className="flex items-center gap-4 group">
              <button 
                className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-green-700 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu />
              </button>
              
              <div 
                className="flex items-center gap-3 select-none cursor-pointer" 
                onClick={() => {
                  setSelectedCategory(Category.PC_LAPTOP);
                  setSearchInput('');
                  resetFilters();
                  window.scrollTo({top: 0, behavior: 'smooth'});
                }}
              >
                 <DongDuLogo />
                 
                 <div className="flex flex-col items-center justify-center pt-1">
                  <span className="text-[11px] sm:text-[13px] font-bold text-[#006838] tracking-[0.2em] leading-tight uppercase font-['Montserrat']">
                    Tin Học
                  </span>
                  <h1 className="text-2xl sm:text-[32px] font-[900] text-[#006838] tracking-tight leading-none uppercase font-['Montserrat']">
                    Đông Du
                  </h1>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 ml-10 xl:ml-16 pr-8 mr-auto">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleCategoryClick(item.id)}
                  className={`text-sm xl:text-base font-[800] uppercase transition-all relative py-2 group whitespace-nowrap tracking-wide ${
                    selectedCategory === item.id 
                      ? 'text-[#006838]' 
                      : 'text-gray-600 hover:text-[#006838]'
                  }`}
                >
                  {item.label}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#006838] transform transition-transform duration-300 origin-left ${selectedCategory === item.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex relative group">
                <input
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 rounded-full text-sm w-48 focus:w-64 transition-all duration-300"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <Search className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-green-600 transition-colors" size={16} />
              </div>

              <button 
                className="relative p-2.5 text-gray-600 hover:text-[#006838] hover:bg-green-50 rounded-full transition-all"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart size={24} />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full shadow-md border-2 border-white">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search & Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden px-4 pb-4 border-t border-gray-100 bg-white shadow-lg animate-fade-in-up">
            <div className="mt-4 mb-4 relative">
               <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
            </div>
            <div className="flex flex-col space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleCategoryClick(item.id)}
                  className={`text-left px-4 py-3 rounded-lg text-sm font-bold uppercase transition-colors ${
                    selectedCategory === item.id 
                      ? 'bg-green-50 text-[#006838]' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <div id="hero-section" className="relative bg-[#006838] text-white overflow-hidden border-b border-green-800">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white opacity-[0.07] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-white opacity-[0.05] rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 flex flex-col items-center text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold tracking-wider mb-6 animate-fade-in-up">
              ĐỐI TÁC CÔNG NGHỆ TIN CẬY
            </span>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight mb-6 leading-tight text-white">
              <span className="font-['Montserrat'] uppercase drop-shadow-md">TIN HỌC ĐÔNG DU</span> <br/>
              <span className="text-2xl sm:text-4xl mt-2 font-extrabold text-green-100 block">Giải Pháp Công Nghệ Toàn Diện</span>
            </h2>
            <p className="text-lg sm:text-xl text-green-50 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
              Chuyên cung cấp Máy chủ, thiết bị NAS, giải pháp Camera an ninh và hạ tầng mạng chuyên nghiệp cho doanh nghiệp.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
              <button 
                 onClick={() => {
                   const element = document.getElementById('products-grid');
                   element?.scrollIntoView({ behavior: 'smooth' });
                 }}
                 className="bg-white text-[#006838] hover:bg-gray-100 px-8 py-4 rounded-xl font-bold transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0"
              >
                KHÁM PHÁ SẢN PHẨM
              </button>
              <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="bg-transparent text-white border-2 border-white hover:bg-white/10 px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-1 active:translate-y-0">
                <Phone size={20} /> TƯ VẤN: {CONTACT_PHONE}
              </a>
            </div>
        </div>
      </div>
      
      {/* Featured Products Carousel */}
      {!debouncedSearchQuery && (
          <ProductCarousel 
             products={featuredProducts} 
             onAddToCart={addToCart}
             onProductClick={handleProductClick}
          />
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full" id="products-grid">
        
        {/* Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-gray-200 gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
              {debouncedSearchQuery ? `Kết quả tìm kiếm: "${debouncedSearchQuery}"` : menuItems.find(m => m.id === selectedCategory)?.label || selectedCategory}
            </h2>
            <div className="h-1.5 w-24 bg-[#006838] mt-3 rounded-full"></div>
          </div>
          <div className="flex items-center gap-3">
             <button 
               className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 shadow-sm"
               onClick={() => setShowMobileFilters(!showMobileFilters)}
             >
                <Filter size={16} /> Bộ lọc
             </button>
             <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full w-fit">
                {filteredProducts.length} sản phẩm
             </span>
          </div>
        </div>

        {/* Content Layout: Sidebar + Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Sidebar - Filters */}
            <aside className={`lg:w-1/4 flex-shrink-0 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
                <ProductFilters 
                    category={selectedCategory}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    setMinPrice={setMinPrice}
                    setMaxPrice={setMaxPrice}
                    inStockOnly={inStockOnly}
                    setInStockOnly={setInStockOnly}
                    selectedSpecs={selectedSpecs}
                    toggleSpec={toggleSpec}
                    onReset={resetFilters}
                />
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        onAddToCart={addToCart}
                        onClick={handleProductClick}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300 h-full flex flex-col items-center justify-center">
                    <div className="inline-block p-6 rounded-full bg-gray-50 mb-4">
                      <Search className="w-12 h-12 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Không tìm thấy sản phẩm</h3>
                    <p className="text-gray-500 mt-2">Vui lòng thử thay đổi danh mục hoặc bộ lọc.</p>
                    <button 
                      onClick={() => {
                          setSearchInput(''); 
                          resetFilters();
                      }}
                      className="mt-6 px-8 py-3 bg-[#006838] text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-900/10"
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                )}
            </div>
        </div>
      </main>

      {/* Footer */}
      <footer id="main-footer" className="bg-[#1a1a1a] text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <DongDuLogo />
              <div className="flex flex-col items-center justify-center pt-1">
                  <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase font-['Montserrat']">Tin Học</span>
                  <span className="text-2xl font-black text-white tracking-tight uppercase font-['Montserrat'] leading-none">Đông Du</span>
              </div>
            </div>
            
            <p className="text-sm leading-relaxed mb-8 text-gray-400">
              Đơn vị tiên phong cung cấp giải pháp công nghệ thông tin, thiết bị mạng, máy chủ và giải pháp lưu trữ dữ liệu an toàn cho doanh nghiệp Việt Nam.
            </p>
            <div className="flex gap-4">
               {/* Facebook */}
               <a 
                 href="https://www.facebook.com/tinhocdongdu" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="w-14 h-14 bg-[#1877F2] text-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-blue-900/50"
                 title="Facebook"
               >
                 <Facebook size={28} fill="white" />
               </a>
               
               {/* Zalo */}
               <a 
                 href="https://zalo.me/0918620986" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="w-14 h-14 bg-[#0068FF] text-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-blue-900/50"
                 title="Liên hệ Zalo"
               >
                 <span className="font-bold text-sm">Zalo</span>
               </a>

               {/* Email */}
               <a 
                 href={`mailto:${CONTACT_EMAIL}`} 
                 className="w-14 h-14 bg-[#EA4335] text-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-red-900/50"
                 title="Gửi Email"
               >
                 <Mail size={28} />
               </a>
            </div>
          </div>
          <div className="md:pl-10">
            <h3 className="text-white text-lg font-bold mb-6 uppercase tracking-wide border-l-4 border-[#006838] pl-3">Sản phẩm chính</h3>
            <ul className="space-y-4 text-sm font-medium">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button onClick={() => handleCategoryClick(item.id)} className="hover:text-green-400 transition-colors flex items-center gap-3 group text-left w-full uppercase">
                    <span className="w-1.5 h-1.5 bg-gray-600 group-hover:bg-green-50 rounded-full transition-colors"></span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-6 uppercase tracking-wide border-l-4 border-[#006838] pl-3">Thông tin liên hệ</h3>
            <ul className="space-y-5 text-sm">
              <li className="flex items-start gap-4 group">
                <div className="bg-gray-800 p-2 rounded-lg group-hover:bg-[#006838] transition-colors">
                  <Phone size={18} className="text-white" /> 
                </div>
                <div>
                  <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Hotline tư vấn</span>
                  <span className="text-white font-bold text-lg">{CONTACT_PHONE}</span>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="bg-gray-800 p-2 rounded-lg group-hover:bg-[#006838] transition-colors">
                   <Mail size={18} className="text-white" /> 
                </div>
                 <div>
                  <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Email hỗ trợ</span>
                  <span className="text-gray-300 font-medium">{CONTACT_EMAIL}</span>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                 <div className="bg-gray-800 p-2 rounded-lg group-hover:bg-[#006838] transition-colors">
                    <Server size={18} className="text-white" /> 
                 </div>
                 <div>
                  <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Khu vực hoạt động</span>
                  <span className="text-gray-300 font-medium">Toàn quốc</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 gap-4">
          <p>© {new Date().getFullYear()} {STORE_NAME}. All rights reserved.</p>
          <button 
             onClick={() => setIsAdminOpen(true)}
             className="flex items-center gap-1.5 text-gray-700 hover:text-green-500 transition-colors opacity-50 hover:opacity-100"
          >
             <Settings size={12} /> Quản trị
          </button>
        </div>
      </footer>

      {/* Overlays */}
      <ProductDetailModal 
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />

      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
      />
      
      <ChatWidget />
      
      {/* Admin Dashboard */}
      <AdminDashboard 
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        bannerConfig={bannerConfig}
        onUpdateBannerConfig={setBannerConfig}
      />
    </div>
  );
};

export default App;
