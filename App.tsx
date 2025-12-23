
import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Search, Menu, Phone, Server, Settings, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { MOCK_PRODUCTS, STORE_NAME, CONTACT_PHONE, CONTACT_ADDRESS, DEFAULT_BANNER_CONFIG } from './constants';
import { Product, CartItem, Category, BannerConfig } from './types';
import { ProductCard } from './components/ProductCard';
import { CartSidebar } from './components/CartSidebar';
import { ChatWidget } from './components/ChatWidget';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ProductCarousel } from './components/ProductCarousel';
import { ProductFilters } from './components/ProductFilters';
import { FloatingAds } from './components/FloatingAds';

// Firebase Imports
import { ref, onValue, set, update, remove, onDisconnect, goOnline, goOffline } from "firebase/database";
import { db } from "./firebaseConfig";

interface ProcessedProduct extends Product {
  _searchableText: string;
  _specString: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'loading';
}

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [bannerConfig, setBannerConfig] = useState<BannerConfig>(DEFAULT_BANNER_CONFIG);
  const [selectedCategory, setSelectedCategory] = useState<string>(Category.PC_LAPTOP);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'loading' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    if (type !== 'loading') {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
    }
    return id;
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const connectedRef = ref(db, ".info/connected");
    onValue(connectedRef, (snap) => {
      setIsOnline(snap.val() === true);
    });

    const productsRef = ref(db, 'products');
    const unsubscribeProducts = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productList = Object.values(data) as Product[];
        // Sắp xếp theo ID hoặc thời gian nếu cần, ở đây đảo ngược để hiện mới nhất
        setProducts(productList.sort((a, b) => b.id.localeCompare(a.id)));
      } else {
        // Khởi tạo dữ liệu mẫu nếu DB trống
        MOCK_PRODUCTS.forEach(p => {
           set(ref(db, `products/${p.id}`), p);
        });
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Firebase Error:", error);
      addToast("Không thể kết nối cơ sở dữ liệu. Vui lòng kiểm tra mạng.", "error");
    });

    const bannerRef = ref(db, 'bannerConfig');
    const unsubscribeBanner = onValue(bannerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setBannerConfig(data);
      else set(ref(db, 'bannerConfig'), DEFAULT_BANNER_CONFIG);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeBanner();
    };
  }, []);

  const normalizeText = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const processedProducts: ProcessedProduct[] = useMemo(() => {
    return products.map(product => ({
      ...product,
      _searchableText: normalizeText(`${product.name} ${product.description} ${product.specs.join(' ')} ${product.category}`),
      _specString: normalizeText(`${product.name} ${product.specs.join(' ')}`)
    }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = processedProducts;
    if (selectedCategory) {
       result = result.filter(product => {
        if (selectedCategory === Category.OTHER) return product.category === Category.NAS || product.category === Category.OTHER;
        return product.category === selectedCategory;
      });
    }
    if (debouncedSearchQuery.trim()) {
       const normalizedQuery = normalizeText(debouncedSearchQuery);
       const queryTokens = normalizedQuery.split(/\s+/).filter(token => token.length > 0);
       result = result.filter(product => queryTokens.every(token => product._searchableText.includes(token)));
    }
    if (minPrice !== '') result = result.filter(p => p.price >= minPrice);
    if (maxPrice !== '') result = result.filter(p => p.price <= maxPrice);
    if (inStockOnly) result = result.filter(p => p.inStock !== false);
    if (selectedSpecs.length > 0) {
        const normalizedSelectedSpecs = selectedSpecs.map(s => normalizeText(s));
        result = result.filter(product => normalizedSelectedSpecs.every(spec => product._specString.includes(spec)));
    }
    return result;
  }, [selectedCategory, debouncedSearchQuery, processedProducts, minPrice, maxPrice, inStockOnly, selectedSpecs]);

  const featuredProducts = useMemo(() => products.filter(p => p.isFeatured), [products]);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  // CRUD Handlers with Global Sync Verification
  const handleUpdateProduct = async (updatedProduct: Product) => {
    const toastId = addToast("Đang cập nhật sản phẩm...", "loading");
    try {
      await update(ref(db, `products/${updatedProduct.id}`), updatedProduct);
      removeToast(toastId);
      addToast("Đã lưu thay đổi thành công!");
    } catch (error) {
      removeToast(toastId);
      addToast("Lỗi khi lưu dữ liệu. Vui lòng thử lại.", "error");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const toastId = addToast("Đang xóa sản phẩm...", "loading");
    try {
      await remove(ref(db, `products/${id}`));
      removeToast(toastId);
      addToast("Đã xóa sản phẩm khỏi hệ thống.");
    } catch (error) {
      removeToast(toastId);
      addToast("Không thể xóa sản phẩm.", "error");
    }
  };

  const handleAddProduct = async (newProduct: Product) => {
    const toastId = addToast("Đang thêm sản phẩm mới...", "loading");
    try {
      await set(ref(db, `products/${newProduct.id}`), newProduct);
      removeToast(toastId);
      addToast("Sản phẩm mới đã được niêm yết!");
    } catch (error) {
      removeToast(toastId);
      addToast("Lỗi khi thêm sản phẩm.", "error");
    }
  };

  const handleUpdateBannerConfig = async (newConfig: BannerConfig) => {
    const toastId = addToast("Đang cập nhật banner...", "loading");
    try {
      await set(ref(db, 'bannerConfig'), newConfig);
      removeToast(toastId);
      addToast("Cấu hình quảng cáo đã được cập nhật.");
    } catch (error) {
      removeToast(toastId);
      addToast("Lỗi khi cập nhật banner.", "error");
    }
  };

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
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col overflow-x-hidden">
      <FloatingAds config={bannerConfig} />
      
      {/* Toast System */}
      <div className="fixed top-24 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border min-w-[280px] animate-fade-in-up ${
            toast.type === 'success' ? 'bg-white border-green-100 text-green-800' :
            toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' :
            'bg-white border-blue-100 text-blue-800'
          }`}>
            {toast.type === 'success' && <CheckCircle className="text-green-500" size={20} />}
            {toast.type === 'error' && <AlertCircle className="text-red-500" size={20} />}
            {toast.type === 'loading' && <Loader2 className="text-blue-500 animate-spin" size={20} />}
            <span className="text-sm font-bold">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Top Bar */}
      <div className="bg-gradient-to-r from-[#004d2a] to-[#006838] text-white py-2 px-4 text-xs sm:text-sm shadow-md z-50 relative">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <p className="hidden sm:block font-medium tracking-wide uppercase text-[10px] opacity-90">Công nghệ cho cuộc sống - Tin Học Đông Du</p>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${isOnline ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              {isOnline ? 'Hệ thống trực tuyến' : 'Mất kết nối máy chủ'}
            </div>
          </div>
          <div className="flex gap-6">
            <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="flex items-center gap-1.5 hover:text-yellow-300 transition-colors font-bold">
              <Phone size={14} className="animate-pulse" /> {CONTACT_PHONE}
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center gap-2 xl:gap-4 group shrink-0">
              <button className="lg:hidden p-2 -ml-2 text-gray-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu /></button>
              <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                 <DongDuLogo />
                 <div className="flex flex-col items-center justify-center pt-1">
                  <span className="text-[11px] sm:text-[13px] font-bold text-[#006838] tracking-[0.2em] leading-tight uppercase font-['Montserrat']">Tin Học</span>
                  <h1 className="text-xl sm:text-2xl xl:text-[32px] font-[900] text-[#006838] tracking-tight leading-none uppercase font-['Montserrat'] whitespace-nowrap">Đông Du</h1>
                </div>
              </div>
            </div>

            <nav className="hidden lg:flex items-center space-x-2 xl:space-x-4 mr-auto ml-8">
              {[
                { id: Category.PC_LAPTOP, label: 'PC / LAPTOP' },
                { id: Category.SERVER, label: 'MỰC IN / MÁY IN' },
                { id: Category.NETWORK, label: 'THIẾT BỊ MẠNG' },
                { id: Category.ACCESSORY, label: 'LINH KIỆN' },
                { id: Category.SERVICE, label: 'DỊCH VỤ IT' },
                { id: Category.OTHER, label: 'KHÁC' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedCategory(item.id)}
                  className={`text-[10px] xl:text-xs font-[800] uppercase transition-all relative py-2 group whitespace-nowrap ${selectedCategory === item.id ? 'text-[#006838]' : 'text-gray-600 hover:text-[#006838]'}`}
                >
                  {item.label}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#006838] transform transition-transform duration-300 ${selectedCategory === item.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-4 shrink-0">
              <div className="hidden sm:flex relative group">
                <input
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 focus:bg-white focus:border-green-500 rounded-full text-sm w-32 xl:w-48 transition-all"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              </div>
              <button className="relative p-2 text-gray-600" onClick={() => setIsCartOpen(true)}>
                <ShoppingCart size={24} />
                {cartItems.length > 0 && <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">{cartItems.length}</span>}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {!debouncedSearchQuery && featuredProducts.length > 0 && <ProductCarousel products={featuredProducts} onAddToCart={addToCart} onProductClick={setSelectedProduct} />}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="products-grid">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-1/4">
                <ProductFilters category={selectedCategory} minPrice={minPrice} maxPrice={maxPrice} setMinPrice={setMinPrice} setMaxPrice={setMaxPrice} inStockOnly={inStockOnly} setInStockOnly={setInStockOnly} selectedSpecs={selectedSpecs} toggleSpec={(s) => setSelectedSpecs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} onReset={() => {setMinPrice(''); setMaxPrice(''); setInStockOnly(false); setSelectedSpecs([]);}} />
            </aside>
            <div className="flex-1">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-40 text-gray-400">
                    <Loader2 size={48} className="animate-spin mb-4 text-[#006838]" />
                    <p className="font-bold">Đang tải dữ liệu từ máy chủ...</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                         <div className="w-1.5 h-6 bg-[#006838] rounded-full"></div>
                         {selectedCategory} <span className="text-sm font-normal text-gray-400">({filteredProducts.length} sản phẩm)</span>
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProducts.map(p => <ProductCard key={p.id} product={p} onAddToCart={addToCart} onClick={setSelectedProduct} />)}
                    </div>
                    {filteredProducts.length === 0 && (
                      <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100">
                         <Search size={48} className="mx-auto mb-4 text-gray-200" />
                         <p className="text-gray-500 font-medium">Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.</p>
                         <button onClick={() => {setMinPrice(''); setMaxPrice(''); setSelectedSpecs([]); setSearchInput('');}} className="mt-4 text-[#006838] font-bold hover:underline">Xóa tất cả bộ lọc</button>
                      </div>
                    )}
                  </>
                )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#1a1a1a] text-gray-400 py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
             <h1 className="text-2xl font-black text-white uppercase font-['Montserrat'] mb-4">Đông Du</h1>
             <p className="text-sm leading-relaxed">Đối tác tin cậy cung cấp giải pháp Hạ tầng CNTT, Máy chủ chuyên dụng và Lưu trữ NAS Synology hàng đầu tại Việt Nam.</p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider">Thông Tin Liên Hệ</h3>
            <p className="text-sm mb-2">{CONTACT_ADDRESS}</p>
            <p className="text-sm font-bold text-green-400">{CONTACT_PHONE}</p>
          </div>
          <div className="flex flex-col items-start md:items-end justify-end">
             <button onClick={() => setIsAdminOpen(true)} className="flex items-center gap-2 text-xs bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-all border border-white/10 text-white font-bold uppercase tracking-widest">
                <Settings size={14} /> QUẢN TRỊ VIÊN
             </button>
             <p className="text-[10px] mt-4 opacity-50">© 2024 Tin Học Đông Du. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <ProductDetailModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cartItems} onUpdateQuantity={(id, d) => setCartItems(prev => prev.map(item => item.id === id ? {...item, quantity: Math.max(1, item.quantity + d)} : item))} onRemoveItem={(id) => setCartItems(prev => prev.filter(i => i.id !== id))} />
      <ChatWidget />
      <AdminDashboard isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} products={products} onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} bannerConfig={bannerConfig} onUpdateBannerConfig={handleUpdateBannerConfig} />
    </div>
  );
};

export default App;
