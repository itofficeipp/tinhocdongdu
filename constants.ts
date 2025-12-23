
import { Category, Product, BannerConfig } from './types';

export const STORE_NAME = "Tin Học Đông Du";
export const CONTACT_PHONE = "0918 620 986";
export const CONTACT_EMAIL = "info@tinhocdongdu.com";
export const CONTACT_ADDRESS = "TP. Hồ Chí Minh & Toàn Quốc";

// Social Media Links
export const FACEBOOK_LINK = "https://www.facebook.com/tinhocdongdu";
export const ZALO_LINK = "https://zalo.me/0918620986";

export const DEFAULT_BANNER_CONFIG: BannerConfig = {
  isVisible: true,
  leftImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200&h=600',
  leftLink: '#',
  rightImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=200&h=600',
  rightLink: '#'
};

// Dữ liệu mẫu ban đầu (Sẽ tự động đẩy lên Firebase trong lần chạy đầu tiên)
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'laptop-dell-7420',
    name: 'Laptop Dell Latitude 7420 Carbon',
    price: 18500000,
    category: Category.PC_LAPTOP,
    description: 'Laptop cao cấp cho doanh nhân, mỏng nhẹ, bền bỉ với vỏ sợi Carbon.',
    specs: ['Core i7-1185G7', '16GB RAM', '512GB SSD NVMe', '14 inch FHD IPS'],
    image: 'https://images.unsplash.com/photo-1593642632823-8f78536788c6?auto=format&fit=crop&q=80&w=600',
    isFeatured: true,
    inStock: true,
    warranty: '12 Tháng'
  },
  {
    id: 'nas-synology-ds923',
    name: 'NAS Synology DS923+ (4 Khay)',
    price: 14900000,
    category: Category.NAS,
    description: 'Thiết bị lưu trữ dữ liệu tập trung cho doanh nghiệp vừa và nhỏ.',
    specs: ['AMD Ryzen R1600', '4GB ECC RAM', 'Hỗ trợ M.2 NVMe SSD', 'Cổng mạng 1GbE (Opt 10GbE)'],
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bbcbf?auto=format&fit=crop&q=80&w=600',
    isFeatured: true,
    inStock: true,
    warranty: '36 Tháng'
  }
];
