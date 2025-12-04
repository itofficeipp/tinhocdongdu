
import React, { useState, useEffect } from 'react';
import { Product, Category, BannerConfig } from '../types';
import { X, Plus, Edit, Trash2, Save, Image as ImageIcon, Search, LayoutDashboard, Lock, Upload, Link as LinkIcon, LogOut, Star, KeyRound, MonitorPlay } from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  bannerConfig: BannerConfig;
  onUpdateBannerConfig: (config: BannerConfig) => void;
}

const emptyProduct: Product = {
  id: '',
  name: '',
  price: 0,
  category: Category.PC_LAPTOP,
  description: '',
  specs: [],
  image: '',
  isFeatured: false
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  bannerConfig,
  onUpdateBannerConfig
}) => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  
  // Store valid password in state (so it can be changed in this session)
  const [storedPassword, setStoredPassword] = useState('123456');

  // Dashboard State
  const [view, setView] = useState<'list' | 'form' | 'banners'>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Product>(emptyProduct);
  const [specsInput, setSpecsInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Banner Config Form State
  const [bannerForm, setBannerForm] = useState<BannerConfig>(bannerConfig);

  // Change Password State
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Image Input State
  const [imageInputType, setImageInputType] = useState<'url' | 'upload'>('url');

  // Reset states when opening/closing
  useEffect(() => {
    if (!isOpen) {
      setView('list');
      setLoginError('');
    } else {
        // Sync banner form with current config when opening
        setBannerForm(bannerConfig);
    }
  }, [isOpen, bannerConfig]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginCreds.username === 'admin' && loginCreds.password === storedPassword) {
      setIsAuthenticated(true);
      setLoginError('');
      setLoginCreds({ username: '', password: '' });
    } else {
      setLoginError('Tên đăng nhập hoặc mật khẩu không đúng!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setView('list');
  };
  
  const handleChangePassword = (e: React.FormEvent) => {
      e.preventDefault();
      setPasswordError('');
      setPasswordSuccess('');
      
      if (passwordForm.current !== storedPassword) {
          setPasswordError('Mật khẩu hiện tại không đúng');
          return;
      }
      
      if (passwordForm.new.length < 6) {
          setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
          return;
      }
      
      if (passwordForm.new !== passwordForm.confirm) {
          setPasswordError('Xác nhận mật khẩu không khớp');
          return;
      }
      
      setStoredPassword(passwordForm.new);
      setPasswordSuccess('Đổi mật khẩu thành công!');
      setTimeout(() => {
          setIsChangePasswordOpen(false);
          setPasswordForm({ current: '', new: '', confirm: '' });
          setPasswordSuccess('');
      }, 1500);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setSpecsInput(product.specs.join('\n'));
    setImageInputType(product.image.startsWith('data:') ? 'upload' : 'url');
    setView('form');
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setFormData({ ...emptyProduct, id: `prod-${Date.now()}` });
    setSpecsInput('');
    setImageInputType('url');
    setView('form');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const productToSave = {
      ...formData,
      specs: specsInput.split('\n').filter(line => line.trim() !== '')
    };

    if (editingProduct) {
      onUpdateProduct(productToSave);
    } else {
      onAddProduct(productToSave);
    }
    setView('list');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      onDeleteProduct(id);
    }
  };
  
  const handleToggleFeatured = (product: Product) => {
      onUpdateProduct({
          ...product,
          isFeatured: !product.isFeatured
      });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit warning
        alert("File ảnh quá lớn! Nên dùng ảnh < 2MB để web chạy nhanh hơn.");
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (side: 'left' | 'right', e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setBannerForm(prev => ({
                  ...prev,
                  [side === 'left' ? 'leftImage' : 'rightImage']: reader.result as string
              }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSaveBanners = () => {
      onUpdateBannerConfig(bannerForm);
      alert('Đã cập nhật cấu hình Banner thành công!');
  };

  // Filter products
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  // --- RENDER LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
           <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
             <X size={24} />
           </button>
           
           <div className="bg-[#006838] p-8 text-center">
             <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
               <Lock className="text-white" size={32} />
             </div>
             <h2 className="text-2xl font-black text-white uppercase tracking-wide font-['Montserrat']">Đăng Nhập Quản Trị</h2>
             <p className="text-green-100 text-sm mt-2">Vui lòng đăng nhập để tiếp tục</p>
           </div>

           <form onSubmit={handleLogin} className="p-8 space-y-6">
             {loginError && (
               <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium border border-red-100">
                 {loginError}
               </div>
             )}
             
             <div className="space-y-2">
               <label className="text-sm font-bold text-gray-700">Tên đăng nhập</label>
               <input 
                 type="text" 
                 value={loginCreds.username}
                 onChange={e => setLoginCreds({...loginCreds, username: e.target.value})}
                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                 placeholder="admin"
                 autoFocus
               />
             </div>
             
             <div className="space-y-2">
               <label className="text-sm font-bold text-gray-700">Mật khẩu</label>
               <input 
                 type="password" 
                 value={loginCreds.password}
                 onChange={e => setLoginCreds({...loginCreds, password: e.target.value})}
                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                 placeholder="••••••"
               />
             </div>

             <button type="submit" className="w-full bg-[#006838] hover:bg-green-700 text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-green-900/20 transition-all active:scale-[0.98]">
               Đăng Nhập
             </button>
           </form>
        </div>
      </div>
    );
  }

  // --- RENDER DASHBOARD ---
  return (
    <div className="fixed inset-0 z-[100] bg-gray-100 flex flex-col animate-fade-in-up overflow-hidden">
      {/* Admin Header */}
      <div className="bg-[#006838] text-white px-6 py-4 shadow-md flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <LayoutDashboard size={24} />
          <h1 className="text-xl font-bold uppercase tracking-wide font-['Montserrat']">Quản Lý Hệ Thống</h1>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={() => setIsChangePasswordOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm">
               <KeyRound size={16} /> Đổi mật khẩu
           </button>
           <span className="text-sm hidden sm:inline text-green-100">Xin chào, <b>Admin</b></span>
           <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Đăng xuất">
             <LogOut size={20} />
           </button>
           <div className="h-6 w-px bg-white/20 mx-1"></div>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Đóng">
            <X size={20} />
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex relative">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col p-4 gap-2 shadow-sm z-10">
            <button 
                onClick={() => setView('list')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${view === 'list' ? 'bg-green-50 text-[#006838]' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <LayoutDashboard size={18} /> Danh sách sản phẩm
            </button>
            <button 
                onClick={handleCreate}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${view === 'form' && !editingProduct ? 'bg-green-50 text-[#006838]' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <Plus size={18} /> Thêm sản phẩm mới
            </button>
            <div className="h-px bg-gray-100 my-2"></div>
             <button 
                onClick={() => setView('banners')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${view === 'banners' ? 'bg-green-50 text-[#006838]' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <MonitorPlay size={18} /> Cấu hình Banner QC
            </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            
            {view === 'banners' && (
                 <div className="max-w-4xl mx-auto animate-fade-in-up">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Cấu hình Banner Quảng cáo (2 bên)</h2>
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">
                        <div className="flex items-center gap-3 mb-4">
                            <input 
                                type="checkbox"
                                className="w-5 h-5 text-[#006838] rounded focus:ring-green-500"
                                checked={bannerForm.isVisible}
                                onChange={e => setBannerForm({...bannerForm, isVisible: e.target.checked})}
                            />
                            <label className="font-bold text-gray-700">Hiển thị Banner 2 bên (Chỉ hiện trên màn hình lớn)</label>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             {/* Left Banner */}
                             <div className="space-y-4">
                                 <h3 className="font-bold text-lg text-gray-800 border-b pb-2">Banner Trái</h3>
                                 
                                 <div className="space-y-2">
                                     <label className="text-sm font-semibold text-gray-600">Link Ảnh URL</label>
                                     <input 
                                         type="text"
                                         className="w-full px-3 py-2 border rounded-lg text-sm"
                                         value={bannerForm.leftImage}
                                         onChange={e => setBannerForm({...bannerForm, leftImage: e.target.value})}
                                     />
                                 </div>
                                 <div className="space-y-2">
                                     <label className="text-sm font-semibold text-gray-600">Hoặc Tải ảnh lên</label>
                                     <input type="file" accept="image/*" onChange={(e) => handleBannerUpload('left', e)} className="text-sm" />
                                 </div>
                                 
                                 <div className="w-full h-64 border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                     {bannerForm.leftImage ? (
                                         <img src={bannerForm.leftImage} className="w-full h-full object-cover" />
                                     ) : (
                                         <span className="text-gray-400">Chưa có ảnh</span>
                                     )}
                                 </div>
                                 
                                 <div className="space-y-2">
                                     <label className="text-sm font-semibold text-gray-600">Link đích (Khi click vào)</label>
                                     <input 
                                         type="text"
                                         className="w-full px-3 py-2 border rounded-lg text-sm"
                                         value={bannerForm.leftLink}
                                         onChange={e => setBannerForm({...bannerForm, leftLink: e.target.value})}
                                         placeholder="#"
                                     />
                                 </div>
                             </div>

                             {/* Right Banner */}
                             <div className="space-y-4">
                                 <h3 className="font-bold text-lg text-gray-800 border-b pb-2">Banner Phải</h3>
                                 
                                 <div className="space-y-2">
                                     <label className="text-sm font-semibold text-gray-600">Link Ảnh URL</label>
                                     <input 
                                         type="text"
                                         className="w-full px-3 py-2 border rounded-lg text-sm"
                                         value={bannerForm.rightImage}
                                         onChange={e => setBannerForm({...bannerForm, rightImage: e.target.value})}
                                     />
                                 </div>
                                 <div className="space-y-2">
                                     <label className="text-sm font-semibold text-gray-600">Hoặc Tải ảnh lên</label>
                                     <input type="file" accept="image/*" onChange={(e) => handleBannerUpload('right', e)} className="text-sm" />
                                 </div>
                                 
                                 <div className="w-full h-64 border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                     {bannerForm.rightImage ? (
                                         <img src={bannerForm.rightImage} className="w-full h-full object-cover" />
                                     ) : (
                                         <span className="text-gray-400">Chưa có ảnh</span>
                                     )}
                                 </div>
                                 
                                 <div className="space-y-2">
                                     <label className="text-sm font-semibold text-gray-600">Link đích (Khi click vào)</label>
                                     <input 
                                         type="text"
                                         className="w-full px-3 py-2 border rounded-lg text-sm"
                                         value={bannerForm.rightLink}
                                         onChange={e => setBannerForm({...bannerForm, rightLink: e.target.value})}
                                         placeholder="#"
                                     />
                                 </div>
                             </div>
                        </div>

                        <div className="pt-4 flex justify-end border-t">
                            <button 
                                onClick={handleSaveBanners}
                                className="px-6 py-3 bg-[#006838] text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg"
                            >
                                <Save size={20} /> Lưu cấu hình Banner
                            </button>
                        </div>
                    </div>
                 </div>
            )}

            {view === 'list' && (
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <div className="relative w-full sm:w-96 group">
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm theo tên, danh mục..." 
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-3 top-3 text-gray-400 group-focus-within:text-green-600 transition-colors" size={18} />
                        </div>
                        <button 
                            onClick={handleCreate}
                            className="bg-[#006838] hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md shadow-green-900/10 transition-all hover:-translate-y-0.5 w-full sm:w-auto justify-center"
                        >
                            <Plus size={18} /> Thêm mới
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Hình ảnh</th>
                                        <th className="px-6 py-4">Tên sản phẩm</th>
                                        <th className="px-6 py-4 text-center" title="Hiển thị trên Slide trang chủ">Slide</th>
                                        <th className="px-6 py-4">Giá bán</th>
                                        <th className="px-6 py-4">Danh mục</th>
                                        <th className="px-6 py-4 text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-3">
                                                <div className="w-14 h-14 bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm p-1">
                                                    <img src={product.image} alt="" className="w-full h-full object-contain" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 font-semibold text-gray-900">{product.name}</td>
                                            <td className="px-6 py-3 text-center">
                                                <button 
                                                    onClick={() => handleToggleFeatured(product)}
                                                    className={`p-1 rounded-full transition-colors ${product.isFeatured ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-gray-400'}`}
                                                    title={product.isFeatured ? "Bỏ khỏi slide" : "Thêm vào slide"}
                                                >
                                                    <Star fill={product.isFeatured ? "currentColor" : "none"} size={20} />
                                                </button>
                                            </td>
                                            <td className="px-6 py-3 text-[#006838] font-bold">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="inline-block bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex justify-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleEdit(product)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Sửa"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredProducts.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-16 text-center text-gray-400 flex flex-col items-center justify-center">
                                                <Search size={48} className="mb-4 opacity-20" />
                                                <p>Không tìm thấy sản phẩm nào phù hợp.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {view === 'form' && (
                <div className="max-w-3xl mx-auto animate-fade-in-up">
                    <div className="flex items-center gap-4 mb-6">
                         <button onClick={() => setView('list')} className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 hover:text-[#006838] hover:border-[#006838] transition-all shadow-sm">
                            &larr;
                         </button>
                         <h2 className="text-2xl font-bold text-gray-900">
                             {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                         </h2>
                    </div>

                    <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Tên sản phẩm <span className="text-red-500">*</span></label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Ví dụ: Laptop Dell Latitude..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Giá bán (VND) <span className="text-red-500">*</span></label>
                                <input 
                                    required
                                    type="number" 
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Danh mục <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select 
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all appearance-none bg-white"
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value as Category})}
                                    >
                                        {Object.values(Category).map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-3 pointer-events-none text-gray-400">▼</div>
                                </div>
                            </div>

                             {/* Featured Checkbox */}
                            <div className="space-y-2 flex items-center pt-6">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input 
                                            type="checkbox"
                                            className="sr-only"
                                            checked={formData.isFeatured || false}
                                            onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                                        />
                                        <div className={`w-12 h-7 rounded-full transition-colors ${formData.isFeatured ? 'bg-[#006838]' : 'bg-gray-300'}`}></div>
                                        <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${formData.isFeatured ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 group-hover:text-[#006838] transition-colors">
                                        Hiển thị trên Slide (Sản phẩm nổi bật)
                                    </span>
                                </label>
                            </div>
                            
                            {/* Image Input Section */}
                             <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-gray-700 flex justify-between">
                                    Hình ảnh sản phẩm <span className="text-red-500">*</span>
                                </label>
                                
                                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit mb-2">
                                    <button
                                        type="button"
                                        onClick={() => setImageInputType('url')}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${imageInputType === 'url' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <span className="flex items-center gap-1"><LinkIcon size={12}/> Link URL</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setImageInputType('upload')}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${imageInputType === 'upload' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                         <span className="flex items-center gap-1"><Upload size={12}/> Tải ảnh lên</span>
                                    </button>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <div className="flex-1">
                                        {imageInputType === 'url' ? (
                                            <input 
                                                required={imageInputType === 'url'}
                                                type="text" 
                                                placeholder="https://example.com/image.jpg"
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-sm"
                                                value={formData.image}
                                                onChange={(e) => setFormData({...formData, image: e.target.value})}
                                            />
                                        ) : (
                                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative">
                                                <input 
                                                    type="file" 
                                                    accept="image/*"
                                                    onChange={handleFileUpload}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                <div className="flex flex-col items-center gap-1 text-gray-500">
                                                    <ImageIcon size={24} />
                                                    <span className="text-xs font-medium">Nhấn để chọn ảnh</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {formData.image && (
                                        <div className="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden shrink-0 bg-white p-1 shadow-sm relative group">
                                            <img src={formData.image} alt="Preview" className="w-full h-full object-contain" />
                                            <button 
                                                type="button"
                                                onClick={() => setFormData({...formData, image: ''})}
                                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Mô tả ngắn</label>
                            <textarea 
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Mô tả các tính năng nổi bật..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Thông số kỹ thuật (Mỗi dòng một thông số)</label>
                            <textarea 
                                rows={5}
                                placeholder="CPU: Intel Core i7&#10;RAM: 16GB&#10;SSD: 512GB"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-mono text-sm bg-gray-50"
                                value={specsInput}
                                onChange={(e) => setSpecsInput(e.target.value)}
                            />
                        </div>

                        <div className="pt-6 flex justify-end gap-4 border-t border-gray-100">
                            <button 
                                type="button"
                                onClick={() => setView('list')}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                type="submit"
                                className="px-6 py-3 bg-[#006838] text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg shadow-green-900/10 hover:-translate-y-0.5"
                            >
                                <Save size={20} /> Lưu sản phẩm
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
      </div>
      
      {/* Change Password Modal */}
      {isChangePasswordOpen && (
          <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up">
                  <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                      <h3 className="font-bold flex items-center gap-2"><KeyRound size={18}/> Đổi mật khẩu</h3>
                      <button onClick={() => setIsChangePasswordOpen(false)} className="hover:text-gray-300"><X size={20}/></button>
                  </div>
                  <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                       {passwordError && (
                          <div className="bg-red-50 text-red-600 p-2 rounded text-xs text-center font-bold">
                              {passwordError}
                          </div>
                       )}
                       {passwordSuccess && (
                          <div className="bg-green-50 text-green-600 p-2 rounded text-xs text-center font-bold">
                              {passwordSuccess}
                          </div>
                       )}
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-600">Mật khẩu hiện tại</label>
                          <input 
                              type="password"
                              required
                              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                              value={passwordForm.current}
                              onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-600">Mật khẩu mới</label>
                          <input 
                              type="password"
                              required
                              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                              value={passwordForm.new}
                              onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-600">Xác nhận mật khẩu mới</label>
                          <input 
                              type="password"
                              required
                              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                              value={passwordForm.confirm}
                              onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                          />
                       </div>
                       <button type="submit" className="w-full bg-[#006838] text-white py-2.5 rounded-lg font-bold text-sm hover:bg-green-700 transition-colors">
                           Cập nhật mật khẩu
                       </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
