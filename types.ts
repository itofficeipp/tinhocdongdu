
export enum Category {
  PC_LAPTOP = 'PC / Laptop',
  NAS = 'Lưu trữ NAS',
  SERVER = 'Mực in / Máy in',
  SERVICE = 'Thi công bảo trì hệ thống',
  NETWORK = 'Thiết bị mạng',
  ACCESSORY = 'Linh kiện & Phụ kiện',
  OTHER = 'Thiết bị khác'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  description: string;
  specs: string[];
  image: string;
  isFeatured?: boolean;
  inStock?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface BannerConfig {
  leftImage: string;
  leftLink: string;
  rightImage: string;
  rightLink: string;
  isVisible: boolean;
}
