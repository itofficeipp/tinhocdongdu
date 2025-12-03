
import React, { useMemo } from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { Category } from '../types';

interface ProductFiltersProps {
  category: string;
  minPrice: number | '';
  maxPrice: number | '';
  setMinPrice: (value: number | '') => void;
  setMaxPrice: (value: number | '') => void;
  inStockOnly: boolean;
  setInStockOnly: (value: boolean) => void;
  selectedSpecs: string[];
  toggleSpec: (spec: string) => void;
  onReset: () => void;
}

interface FilterGroup {
  label: string;
  options: string[];
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  category,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  inStockOnly,
  setInStockOnly,
  selectedSpecs,
  toggleSpec,
  onReset
}) => {
  
  // Define filter configurations for specific categories
  const filterConfigs: Record<string, FilterGroup[]> = useMemo(() => ({
    [Category.PC_LAPTOP]: [
      {
        label: 'Vi xử lý (CPU)',
        options: ['Core i3', 'Core i5', 'Core i7', 'Core i9', 'Ryzen 5', 'Ryzen 7', 'Xeon']
      },
      {
        label: 'RAM',
        options: ['8GB', '16GB', '32GB', '64GB']
      },
      {
        label: 'Ổ cứng',
        options: ['SSD', 'HDD', '256GB', '512GB', '1TB']
      },
      {
        label: 'Thương hiệu',
        options: ['Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Apple']
      }
    ],
    [Category.SERVER]: [ // Mực in / Máy in
      {
        label: 'Hãng sản xuất',
        options: ['Canon', 'HP', 'Epson', 'Brother']
      },
      {
        label: 'Loại máy in',
        options: ['Laser', 'In Phun', 'In Kim', 'In Màu', 'Đa năng']
      },
      {
        label: 'Khổ giấy',
        options: ['A4', 'A3']
      },
      {
        label: 'Mực in tương thích',
        options: ['Cartridge 303', 'Cartridge 337', 'Mực nước', 'Mực dầu']
      }
    ],
    [Category.NETWORK]: [
      {
        label: 'Loại thiết bị',
        options: ['Router', 'Switch', 'Wifi', 'Access Point', 'Cân bằng tải']
      },
      {
        label: 'Hãng sản xuất',
        options: ['Cisco', 'Aruba', 'MikroTik', 'Unifi', 'TP-Link', 'DrayTek']
      },
      {
        label: 'Số cổng (Port)',
        options: ['5 Port', '8 Port', '16 Port', '24 Port', '48 Port']
      },
      {
        label: 'Tốc độ',
        options: ['Gigabit', '10GbE', 'Wifi 6', 'Wifi 5']
      }
    ],
    [Category.ACCESSORY]: [
      {
        label: 'Loại linh kiện',
        options: ['Mainboard', 'CPU', 'RAM', 'VGA', 'PSU', 'Case', 'Màn hình', 'Ổ cứng']
      },
      {
        label: 'Dung lượng (Storage/RAM)',
        options: ['250GB', '500GB', '1TB', '2TB', '4TB', '8TB', '10TB']
      }
    ]
  }), []);

  // Determine which config to use based on current category
  const activeFilters = filterConfigs[category];

  // If the category doesn't have specific filters (e.g., Service, Other), hide the sidebar or show minimal
  if (!activeFilters) {
    // Return null to hide the filter component completely for unsupported categories
    // Or return just the Price/Stock filter if desired. 
    // Based on prompt "Bộ lọc sản phẩm chỉ sử dụng ở menu...", we hide it or show minimal.
    // Let's show minimal Price/Stock filtering for "Other" but hide specific specs.
    if (category !== Category.OTHER && category !== Category.SERVICE) {
        return null;
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-28">
      <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Filter size={18} /> Bộ Lọc
        </h3>
        <button 
          onClick={onReset}
          className="text-xs text-gray-500 hover:text-green-600 flex items-center gap-1 transition-colors"
        >
          <RotateCcw size={12} /> Đặt lại
        </button>
      </div>

      {/* Price Filter - Always available */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Khoảng giá</h4>
        <div className="space-y-3">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400 text-xs">₫</span>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
              placeholder="Từ"
              className="w-full pl-6 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
            />
          </div>
          <div className="relative">
             <span className="absolute left-3 top-2.5 text-gray-400 text-xs">₫</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
              placeholder="Đến"
              className="w-full pl-6 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Stock Filter - Always available */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
            />
            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
          </div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-green-700 transition-colors">Chỉ hiện sản phẩm còn hàng</span>
        </label>
      </div>

      {/* Category Specific Spec Filters */}
      {activeFilters && (
        <div className="space-y-6">
          {activeFilters.map((group) => (
            <div key={group.label}>
              <h4 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide border-l-2 border-green-500 pl-2">
                {group.label}
              </h4>
              <div className="space-y-2">
                {group.options.map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="appearance-none w-4 h-4 border border-gray-300 rounded checked:bg-green-600 checked:border-green-600 transition-colors cursor-pointer"
                          checked={selectedSpecs.includes(option)}
                          onChange={() => toggleSpec(option)}
                        />
                        <svg className="w-3 h-3 absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <span className={`text-sm ${selectedSpecs.includes(option) ? 'text-green-700 font-semibold' : 'text-gray-600'} group-hover:text-green-600 transition-colors`}>
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
