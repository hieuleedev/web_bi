import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Search,
  Filter,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';
import { Pagination } from '../components/ui/Pagination';
import { CATEGORIES } from '../data/initialCategories';
import { useProducts } from '../context/ProductContext';
import { Product } from '../types';
import { checkRentalOverlap, formatVND, formatDateVN } from '../utils/helpers';

interface RentPageProps {
  onViewProduct: (productId: string) => void;
  onOpenRentalCalendar: (product: Product) => void;
}

export const RentPage: React.FC<RentPageProps> = ({
  onViewProduct,
  onOpenRentalCalendar,
}) => {
  const { products } = useProducts();

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [maxDeposit, setMaxDeposit] = useState<string>('all');

  // Filter only products that allow rental
  const rentalProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.status !== 'approved') return false;
      if (p.type !== 'rent' && p.type !== 'both') return false;

      // Text search
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q)) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Deposit range
      if (maxDeposit === 'under-1m' && (p.deposit || 0) > 1000000) return false;
      if (maxDeposit === 'under-2m' && (p.deposit || 0) > 2000000) return false;

      // Date availability filter: If user specifies dates, exclude items that have overlap!
      if (filterDateStart && filterDateEnd) {
        const { hasConflict } = checkRentalOverlap(
          filterDateStart,
          filterDateEnd,
          p.bookedDates
        );
        if (hasConflict) {
          return false; // exclude unavailable items
        }
      }

      return true;
    });
  }, [products, search, selectedCategory, filterDateStart, filterDateEnd, maxDeposit]);

  // Pagination state (8 sản phẩm/trang)
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  // Reset về trang 1 khi đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, filterDateStart, filterDateEnd, maxDeposit]);

  const totalPages = Math.ceil(rentalProducts.length / PAGE_SIZE);
  const paginatedRentalProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rentalProducts.slice(start, start + PAGE_SIZE);
  }, [rentalProducts, currentPage, PAGE_SIZE]);

  return (
    <div className="bg-[#faf9f8] min-h-screen py-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-emerald-900 via-dark-900 to-dark-950 text-white rounded-3xl p-8 sm:p-12 mb-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-500/30">
              Dịch Vụ Cho Thuê Đẳng Cấp
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold">
              Thuê Trang Phục Theo Lịch Hẹn
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Mỗi sản phẩm có bảng giá chi tiết theo ngày, 3 ngày, 7 ngày và minh bạch tiền cọc. Chọn khoảng ngày bạn cần để lọc các mẫu trang phục còn trống lịch ngay tức thì!
            </p>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden md:block">
            <Calendar className="w-full h-full text-emerald-400" />
          </div>
        </div>

        {/* Date Availability Search Bar */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-md mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Ngày nhận đồ (Start)
            </label>
            <input
              type="date"
              value={filterDateStart}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFilterDateStart(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-800 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Ngày trả đồ (End)
            </label>
            <input
              type="date"
              value={filterDateEnd}
              min={filterDateStart || new Date().toISOString().split('T')[0]}
              onChange={(e) => setFilterDateEnd(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-800 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Danh mục đồ thuê
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-brand-500"
            >
              <option value="all">Tất cả trang phục thuê</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={() => {
                setFilterDateStart('');
                setFilterDateEnd('');
                setSelectedCategory('all');
                setSearch('');
              }}
              className="w-full py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Xóa Lọc Lịch Hẹn
            </button>
          </div>
        </div>

        {/* Date Filter Confirmation Message */}
        {filterDateStart && filterDateEnd && (
          <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Đang lọc các mẫu váy/trang phục <strong>còn trống lịch</strong> từ ngày{' '}
              <strong>{formatDateVN(filterDateStart)}</strong> đến <strong>{formatDateVN(filterDateEnd)}</strong>.
            </span>
          </div>
        )}

        {/* Results Counter */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs text-gray-600">
            Có <strong>{rentalProducts.length}</strong> trang phục cho thuê sẵn sàng
          </span>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cam kết hoàn cọc 100% khi nhận lại đồ</span>
          </div>
        </div>

        {/* Rental Products Grid */}
        {rentalProducts.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedRentalProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onViewDetail={onViewProduct}
                  onOpenRentalCalendar={onOpenRentalCalendar}
                />
              ))}
            </div>

            {/* Phân trang */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={rentalProducts.length}
              pageSize={PAGE_SIZE}
              itemsName="trang phục thuê"
              onPageChange={setCurrentPage}
            />
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-gray-800">
              Không có trang phục nào trống lịch trong khoảng thời gian này!
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Vui lòng thử chọn khoảng ngày khác hoặc liên hệ shop để hỗ trợ ưu tiên đổi mẫu tương tự.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
