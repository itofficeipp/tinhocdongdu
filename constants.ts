
import { Category, Product, BannerConfig } from './types';

export const STORE_NAME = "Tin Học Đông Du";
export const CONTACT_PHONE = "0918 620 986";
export const CONTACT_EMAIL = "info@tinhocdongdu.com";

export const DEFAULT_BANNER_CONFIG: BannerConfig = {
  isVisible: true,
  leftImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200&h=600',
  leftLink: '#',
  rightImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=200&h=600',
  rightLink: '#'
};

export const MOCK_PRODUCTS: Product[] = [
  // PC / Laptop
  {
    id: 'laptop-dell-lat-7420',
    name: 'Laptop Dell Latitude 7420',
    price: 18900000,
    category: Category.PC_LAPTOP,
    description: 'Laptop doanh nhân siêu bền, mỏng nhẹ, hiệu năng ổn định, vỏ sợi Carbon.',
    specs: ['Core i7-1185G7', '16GB RAM', '512GB SSD', '14" FHD IPS'],
    image: 'https://images.unsplash.com/photo-1593642632823-8f78536788c6?auto=format&fit=crop&q=80&w=600',
    isFeatured: true,
    inStock: true
  },
  {
    id: 'pc-gaming-dongdu-01',
    name: 'PC Gaming Design Đông Du 01',
    price: 22500000,
    category: Category.PC_LAPTOP,
    description: 'Cấu hình tối ưu cho Gaming và Đồ họa tầm trung, chiến mọi game.',
    specs: ['Core i5-12400F', 'RTX 3060 12GB', '16GB RAM RGB', 'SSD 500GB NVMe'],
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=600',
    isFeatured: true,
    inStock: true
  },
  {
    id: 'pc-dell-optiplex',
    name: 'Dell OptiPlex 7090 Tower',
    price: 15500000,
    category: Category.PC_LAPTOP,
    description: 'PC đồng bộ mạnh mẽ cho doanh nghiệp, độ bền cao, hoạt động 24/7.',
    specs: ['Intel Core i7-11700', '16GB DDR4', '512GB SSD NVMe', 'Windows 11 Pro'],
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=600',
    inStock: true
  },

  // Mực in / Máy in (Printers)
  {
    id: 'prt-canon-2900',
    name: 'Máy in Canon LBP2900',
    price: 4200000,
    category: Category.SERVER,
    description: 'Máy in laser trắng đen bền bỉ, huyền thoại văn phòng, dễ sử dụng.',
    specs: ['In Laser đen trắng', '12 trang/phút', 'Độ phân giải 2400x600dpi', 'Cartridge 303'],
    image: 'https://images.unsplash.com/photo-1612815154858-60aa4c46ae2d?auto=format&fit=crop&q=80&w=600',
    inStock: false // Out of stock example
  },
  {
    id: 'prt-hp-m404dn',
    name: 'Máy in HP LaserJet Pro M404dn',
    price: 6800000,
    category: Category.SERVER,
    description: 'Máy in mạng tốc độ cao, hỗ trợ in 2 mặt tự động cho doanh nghiệp.',
    specs: ['In 2 mặt tự động', '38 trang/phút', 'Kết nối LAN/USB', 'Khay giấy 250 tờ'],
    image: 'https://images.unsplash.com/photo-1588620063102-3b821c9fa00c?auto=format&fit=crop&q=80&w=600',
    isFeatured: true,
    inStock: true
  },
  {
    id: 'prt-epson-l3210',
    name: 'Máy in phun màu Epson L3210',
    price: 3950000,
    category: Category.SERVER,
    description: 'Máy in phun màu đa năng (In/Scan/Copy), tiết kiệm mực.',
    specs: ['Đa năng In/Scan/Copy', 'Bình mực lớn', 'In ảnh tràn viền', 'USB 2.0'],
    image: 'https://images.unsplash.com/photo-1616423664096-7451996238b6?auto=format&fit=crop&q=80&w=600',
    inStock: true
  },

  // NAS
  {
    id: 'nas-syno-ds1621',
    name: 'Synology DiskStation DS1621+',
    price: 24500000,
    category: Category.NAS,
    description: 'Giải pháp lưu trữ mạnh mẽ với 6 khay ổ cứng, mở rộng linh hoạt.',
    specs: ['AMD Ryzen V1500B', '4GB ECC SODIMM', '4x 1GbE LAN', '2x M.2 NVMe'],
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bbcbf?auto=format&fit=crop&q=80&w=600',
    isFeatured: true,
    inStock: true
  },
  {
    id: 'nas-syno-ds923',
    name: 'Synology DiskStation DS923+',
    price: 14900000,
    category: Category.NAS,
    description: 'NAS 4 khay ổ cứng nhỏ gọn, hiệu năng cao cho doanh nghiệp vừa và nhỏ.',
    specs: ['Ryzen R1600', '4GB ECC', '2x 1GbE', 'Hỗ trợ 10GbE Option'],
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bbcbf?auto=format&fit=crop&q=80&w=600',
    inStock: true
  },
  {
    id: 'nas-syno-ds224',
    name: 'Synology DiskStation DS224+',
    price: 8500000,
    category: Category.NAS,
    description: 'Thiết bị lưu trữ 2 khay, giải pháp cloud cá nhân hoàn hảo.',
    specs: ['Intel Celeron J4125', '2GB RAM', '2x 1GbE LAN', 'Bảo hành 2 năm'],
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bbcbf?auto=format&fit=crop&q=80&w=600',
    inStock: true
  },

  // Thi công bảo trì (Service)
  {
    id: 'service-camera-pkg',
    name: 'Trọn bộ 4 Camera IP Hikvision',
    price: 6500000,
    category: Category.SERVICE,
    description: 'Lắp đặt trọn gói hệ thống Camera quan sát sắc nét, xem qua điện thoại.',
    specs: ['4 Camera IP 2MP', 'Đầu ghi hình 4 kênh', 'Ổ cứng 1TB', 'Bao công lắp đặt'],
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=600',
    inStock: true
  },
  {
    id: 'service-maintenance',
    name: 'Gói Bảo Trì Hệ Thống Mạng & Camera',
    price: 5000000,
    category: Category.SERVICE,
    description: 'Dịch vụ thi công, bảo trì hệ thống mạng và camera định kỳ cho văn phòng.',
    specs: ['Kiểm tra tín hiệu', 'Vệ sinh thiết bị', 'Cấu hình tối ưu', 'Hỗ trợ 24/7'],
    image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a783?auto=format&fit=crop&q=80&w=600',
    inStock: true
  },
  {
    id: 'service-it-helpdesk',
    name: 'Dịch vụ IT Helpdesk Onsite',
    price: 3000000,
    category: Category.SERVICE,
    description: 'Cho thuê nhân sự IT hỗ trợ xử lý sự cố máy tính, máy in tại văn phòng.',
    specs: ['Xử lý sự cố PC', 'Cài đặt phần mềm', 'Hỗ trợ người dùng', 'Định kỳ hàng tháng'],
    image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a783?auto=format&fit=crop&q=80&w=600',
    inStock: true
  },

  // Network
  {
    id: 'net-unifi-6-pro',
    name: 'Wifi Unifi 6 Pro (U6-Pro)',
    price: 4200000,
    category: Category.NETWORK,
    description: 'Bộ phát Wifi 6 chuẩn doanh nghiệp, chịu tải cao, sóng khỏe.',
    specs: ['Wifi 6 AX3000', 'Chịu tải 300 user', 'PoE+', 'Quản lý Cloud'],
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bbcbf?auto=format&fit=crop&q=80&w=600',
    inStock: true
  },
  {
    id: 'net-aruba-1930',
    name: 'Aruba Instant On 1930 24G',
    price: 6500000,
    category: Category.NETWORK,
    description: 'Switch quản lý thông minh, phù hợp cho doanh nghiệp SMB.',
    specs: ['24 Port 1G', '4 Port SFP+', 'Quản lý qua App/Cloud', 'Layer 2+'],
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bbcbf?auto=format&fit=crop&q=80&w=600',
    inStock: true
  },
  {
    id: 'net-mikrotik-750',
    name: 'Router MikroTik RB750Gr3',
    price: 1850000,
    category: Category.NETWORK,
    description: 'Router cân bằng tải mạnh mẽ, chịu tải 100-150 user.',
    specs: ['5 Port Gigabit', 'CPU 2 Core', 'RouterOS Level 4', 'VPN/Load Balancing'],
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bbcbf?auto=format&fit=crop&q=80&w=600',
    inStock: true
  },

  // Linh kiện (Accessories)
  {
    id: 'part-hdd-ironwolf-4tb',
    name: 'HDD Seagate IronWolf 4TB',
    price: 2950000,
    category: Category.ACCESSORY,
    description: 'Ổ cứng chuyên dụng cho NAS, bền bỉ, hoạt động 24/7.',
    specs: ['4TB', '5900 RPM', '64MB Cache', 'Công nghệ AgileArray'],
    image: 'https://images.unsplash.com/photo-1531492244965-f969f3ad091e?auto=format&fit=crop&q=80&w=600',
    inStock: true
  },
  {
    id: 'part-hdd-10tb',
    name: 'HDD Seagate IronWolf Pro 10TB',
    price: 7200000,
    category: Category.ACCESSORY,
    description: 'Ổ cứng chuyên dụng cho NAS Enterprise, hiệu suất cực cao.',
    specs: ['Dung lượng 10TB', '7200 RPM', 'Cache 256MB', 'Bảo hành 5 năm'],
    image: 'https://images.unsplash.com/photo-1531492244965-f969f3ad091e?auto=format&fit=crop&q=80&w=600',
    inStock: true
  },
  {
    id: 'part-ssd-samsung',
    name: 'SSD Samsung 980 PRO 1TB',
    price: 2850000,
    category: Category.ACCESSORY,
    description: 'Ổ cứng SSD NVMe Gen4 tốc độ siêu nhanh cho Workstation.',
    specs: ['1TB', 'Đọc 7000MB/s', 'Ghi 5000MB/s', 'PCIe 4.0'],
    image: 'https://images.unsplash.com/photo-1531492244965-f969f3ad091e?auto=format&fit=crop&q=80&w=600',
    inStock: false // Out of stock example
  }
];
