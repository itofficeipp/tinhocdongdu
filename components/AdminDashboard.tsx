
import React, { useState, useEffect } from 'react';
import { Product, Category, BannerConfig } from '../types';
import { X, Plus, Edit, Trash2, Save, Image as ImageIcon, Search, LayoutDashboard, Lock, Upload, Link as LinkIcon, LogOut, Star, KeyRound, MonitorPlay, ShieldCheck, Loader2 } from 'lucide-react';

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
  isFeatured: false,
  warranty: ''
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [storedPassword, setStoredPassword] = useState('123456');
  const [view, setView] = useState<'list' | 'form' | 'banners'>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Product>(emptyProduct);
  const [specsInput, setSpecsInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [bannerForm, setBannerForm] = useState<BannerConfig>(bannerConfig);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [imageInputType, setImageInputType] = useState<'url' | 'upload'>('url');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setView('list');
      setLoginError('');
    } else {
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const productToSave = {
      ...formData,
      specs: specsInput.split('\n').filter(line => line.trim() !== '')
    };

    try {
      if (editingProduct) {
        await onUpdateProduct(productToSave);
      } else {
        await onAddProduct(productToSave);
      }
      setView('list');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống vĩnh viễn?')) {
      onDeleteProduct(id);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative border border-white/20">
           <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
             <X size={24} />
           </button>
           <div className="bg-[#006838] p-8 text-center">
             <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
               <Lock className="text-white" size={32} />
             </div>
             <h2 className="text-2xl font-black text-white uppercase tracking-wide font-['Montserrat']">Cổng Quản Trị</h2>
             <p className="text-green-100 text-sm mt-2">Dành riêng cho quản lý Tin Học Đông Du</p>
           </div>
           <form onSubmit={handleLogin} className="p-8 space-y-6">
             {loginError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium border border-red-100">{loginError}</div>}
             <div className="space-y-2">
               <label className="text-sm font-bold text-gray-700">Tài khoản</label>
               <input type="text" value={loginCreds.username} onChange={e => setLoginCreds({...loginCreds, username: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" placeholder="admin" />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-bold text-gray-700">Mật khẩu</label>
               <input type="password" value={loginCreds.password} onChange={e => setLoginCreds({...loginCreds, password: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" placeholder="••••••" />
             </div>
             <button type="submit" className="w-full bg-[#006838] hover:bg-green-700 text-white py-3.5 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98]">Đăng Nhập Ngay</button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col animate-fade-in-up overflow-hidden">
      <div className="bg-[#006838] text-white px-6 py-4 shadow-md flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <LayoutDashboard size={24} />
          <h1 className="text-xl font-bold uppercase tracking-wide font-['Montserrat']">Quản Lý Nội Dung</h1>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={() => setIsChangePasswordOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"><KeyRound size={16} /> Bảo mật</button>
           <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><LogOut size={20} /></button>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X size={20} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex relative">
        <div className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col p-4 gap-2 shadow-sm z-10">
            <button onClick={() => setView('list')} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-colors ${view === 'list' ? 'bg-green-50 text-[#006838]' : 'text-gray-600 hover:bg-gray-50'}`}><LayoutDashboard size={18} /> Danh sách sản phẩm</button>
            <button onClick={handleCreate} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-colors ${view === 'form' && !editingProduct ? 'bg-green-50 text-[#006838]' : 'text-gray-600 hover:bg-gray-50'}`}><Plus size={18} /> Niêm yết mới</button>
            <div className="h-px bg-gray-100 my-4"></div>
            <button onClick={() => setView('banners')} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-colors ${view === 'banners' ? 'bg-green-50 text-[#006838]' : 'text-gray-600 hover:bg-gray-50'}`}><MonitorPlay size={18} /> Banner Quảng cáo</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50">
            {view === 'list' && (
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <div className="relative w-full sm:w-96">
                            <input type="text" placeholder="Tìm kiếm nhanh..." className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        </div>
                        <button onClick={handleCreate} className="bg-[#006838] hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg w-full sm:w-auto justify-center"><Plus size={18} /> Thêm sản phẩm</button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-[10px] sm:text-xs uppercase font-black tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Ảnh</th>
                                    <th className="px-6 py-4">Sản phẩm</th>
                                    <th className="px-6 py-4">Giá bán</th>
                                    <th className="px-6 py-4 hidden md:table-cell">Danh mục</th>
                                    <th className="px-6 py-4 text-center">Xử lý</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredProducts.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-3"><img src={p.image} className="w-12 h-12 object-contain bg-white rounded border p-1" /></td>
                                        <td className="px-6 py-3 font-bold text-gray-900">{p.name}</td>
                                        <td className="px-6 py-3 text-[#006838] font-black">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</td>
                                        <td className="px-6 py-3 hidden md:table-cell"><span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-bold uppercase">{p.category}</span></td>
                                        <td className="px-6 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {view === 'form' && (
                <div className="max-w-3xl mx-auto animate-fade-in-up">
                    <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 space-y-6">
                        <div className="flex items-center justify-between border-b pb-4 mb-4">
                            <h2 className="text-xl font-black text-[#006838] uppercase">{editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h2>
                            <button type="button" onClick={() => setView('list')} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1"><label className="text-xs font-bold text-gray-500">Tên thiết bị</label><input required className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500/20" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                            <div className="space-y-1"><label className="text-xs font-bold text-gray-500">Giá (VND)</label><input required type="number" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500/20" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} /></div>
                            <div className="space-y-1"><label className="text-xs font-bold text-gray-500">Danh mục</label><select className="w-full px-4 py-3 border rounded-xl" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})}>{Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                            <div className="space-y-1"><label className="text-xs font-bold text-gray-500">Bảo hành</label><input className="w-full px-4 py-3 border rounded-xl" value={formData.warranty} onChange={e => setFormData({...formData, warranty: e.target.value})} placeholder="12 tháng..." /></div>
                        </div>
                        <div className="space-y-1"><label className="text-xs font-bold text-gray-500">Mô tả tóm tắt</label><textarea rows={3} className="w-full px-4 py-3 border rounded-xl" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
                        <div className="space-y-1"><label className="text-xs font-bold text-gray-500">Thông số kỹ thuật (Mỗi dòng 1 ý)</label><textarea rows={5} className="w-full px-4 py-3 border rounded-xl font-mono text-sm bg-gray-50" value={specsInput} onChange={e => setSpecsInput(e.target.value)} placeholder="CPU: i7 12th&#10;RAM: 16GB" /></div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={() => setView('list')} className="px-6 py-3 font-bold text-gray-400">Hủy</button>
                            <button disabled={isSubmitting} type="submit" className="bg-[#006838] hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg disabled:opacity-50">
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                {isSubmitting ? 'Đang lưu...' : 'Lưu dữ liệu'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {view === 'banners' && (
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-black text-[#006838] uppercase mb-6">Cấu hình Banner Quảng Cáo</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {['left', 'right'].map((side) => (
                            <div key={side} className="space-y-4">
                                <h3 className="font-bold text-gray-700">Banner {side === 'left' ? 'Trái' : 'Phải'}</h3>
                                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={side === 'left' ? bannerForm.leftImage : bannerForm.rightImage} onChange={e => setBannerForm({...bannerForm, [side === 'left' ? 'leftImage' : 'rightImage']: e.target.value})} placeholder="Dán link ảnh..." />
                                <div className="aspect-[2/6] bg-gray-100 rounded-lg overflow-hidden border">
                                    <img src={side === 'left' ? bannerForm.leftImage : bannerForm.rightImage} className="w-full h-full object-cover" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex justify-end">
                        <button onClick={() => onUpdateBannerConfig(bannerForm)} className="bg-[#006838] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2"><Save size={20}/> Lưu cấu hình</button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
