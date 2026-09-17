import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';
import { CATEGORIES } from '../data/initialCategories';
import { useProducts } from '../context/ProductContext';
import { Product, ProductType, GenderCategory } from '../types';

interface ShopPageProps {
  initialSearch?: string;
  initialCategory?: string;
  onViewProduct: (productId: string) => void;
  onOpenRentalCalendar: (product: Product) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  initialSearch = '',
  initialCategory = 'all',
  onViewProduct,
  onOpenRentalCalendar,
}) => {
  const { products } = useProducts();

  // Filter states
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Mobile filters drawer toggle
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filtered products calculation
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Must be approved status
      if (p.status !== 'approved') return false;

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchBrand = p.brand.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchBrand) return false;
      }

      // Category
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Gender
      if (selectedGender !== 'all' && p.gender !== selectedGender) {
        return false;
      }

      // Product Type
      if (selectedType !== 'all') {
        if (selectedType === 'buy' && p.type !== 'buy' && p.type !== 'both') return false;
        if (selectedType === 'rent' && p.type !== 'rent' && p.type !== 'both') return false;
      }

      // Size
      if (selectedSize !== 'all') {
        if (!p.sizes.some((s) => s.toLowerCase().includes(selectedSize.toLowerCase()))) {
          return false;
        }
      }

      // Price Range (based on buyPrice or rentPrice1Day)
      const effectivePrice = p.buyPrice || (p.rentPrice1Day || 0);
      if (priceRange === 'under-500k' && effectivePrice >= 500000) return false;
      if (priceRange === '500k-1m' && (effectivePrice < 500000 || effectivePrice > 1000000)) return false;
      if (priceRange === '1m-2m' && (effectivePrice < 1000000 || effectivePrice > 2000000)) return false;
      if (priceRange === 'above-2m' && effectivePrice <= 2000000) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'price-asc') {
        const priceA = a.buyPrice || a.rentPrice1Day || 0;
        const priceB = b.buyPrice || b.rentPrice1Day || 0;
        return priceA - priceB;
      }
      if (sortBy === 'price-desc') {
        const priceA = a.buyPrice || a.rentPrice1Day || 0;
        const priceB = b.buyPrice || b.rentPrice1Day || 0;
        return priceB - priceA;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return 0;
    });
  }, [products, search, selectedCategory, selectedGender, selectedType, selectedSize, priceRange, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedGender('all');
    setSelectedType('all');
    setSelectedSize('all');
    setPriceRange('all');
    setSortBy('newest');
  };

  return (
    <div className="bg-[#faf9f8] min-h-screen py-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-gray-900">
              Mua Sắm & Thuê Trang Phục
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Hiển thị {filteredProducts.length} sản phẩm thời trang cao cấp sẵn sàng phục vụ
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-72">
              <input
                type="text"
                placeholder="Tìm tên đồ, váy dạ hội, lụa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-full pl-9 pr-4 py-2 text-xs text-gray-900 focus:outline-none focus:border-brand-500 shadow-sm"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden p-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 text-xs font-medium"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Bộ lọc</span>
            </button>
          </div>
        </div>

        {/* Main 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Filters - Left (3 cols) */}
          <div className={`lg:col-span-3 ${mobileFilterOpen ? 'block' : 'hidden lg:block'} space-y-6`}>
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="font-bold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-brand-600" />
                  Bộ Lọc Tìm Kiếm
                </span>
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-brand-600 hover:text-brand-800 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Đặt lại</span>
                </button>
              </div>

              {/* Business Model Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-2">
                  Hình Thức Giao Dịch
                </label>
                <div className="space-y-1.5 text-xs">
                  {[
                    { id: 'all', label: 'Tất cả sản phẩm' },
                    { id: 'buy', label: 'Sản phẩm bán đứt' },
                    { id: 'rent', label: 'Sản phẩm cho thuê' },
                  ].map((t) => (
                    <label
                      key={t.id}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                        selectedType === t.id ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{t.label}</span>
                      <input
                        type="radio"
                        name="typeFilter"
                        checked={selectedType === t.id}
                        onChange={() => setSelectedType(t.id)}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-2">
                  Danh Mục Phong Cách
                </label>
                <div className="space-y-1 text-xs max-h-52 overflow-y-auto pr-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left p-1.5 rounded-lg transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-brand-50 text-brand-600 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Tất cả danh mục
                  </button>
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={`w-full text-left p-1.5 rounded-lg transition-colors truncate ${
                        selectedCategory === c.id
                          ? 'bg-brand-50 text-brand-600 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-2">
                  Đối Tượng
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'women', label: 'Nữ' },
                    { id: 'men', label: 'Nam' },
                    { id: 'unisex', label: 'Unisex' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGender(g.id)}
                      className={`py-1.5 px-3 rounded-xl border text-center transition-all ${
                        selectedGender === g.id
                          ? 'bg-brand-600 text-white border-brand-600 font-semibold'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-2">
                  Kích Thước (Size)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['all', 'XS', 'S', 'M', 'L', 'XL', 'Free size'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                        selectedSize === s
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {s === 'all' ? 'Tất cả' : s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-2">
                  Khoảng Giá
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-brand-500"
                >
                  <option value="all">Mọi mức giá</option>
                  <option value="under-500k">Dưới 500.000 ₫</option>
                  <option value="500k-1m">500.000 ₫ - 1.000.000 ₫</option>
                  <option value="1m-2m">1.000.000 ₫ - 2.000.000 ₫</option>
                  <option value="above-2m">Trên 2.000.000 ₫</option>
                </select>
              </div>

            </div>
          </div>

          {/* Products Grid & Sorting - Right (9 cols) */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Sort bar */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-xs text-gray-500">
                Tìm thấy <strong>{filteredProducts.length}</strong> sản phẩm phù hợp
              </span>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">Sắp xếp theo:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-brand-500 font-medium"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá thấp → cao</option>
                  <option value="price-desc">Giá cao → thấp</option>
                  <option value="rating">Đánh giá cao nhất</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onViewDetail={onViewProduct}
                    onOpenRentalCalendar={onOpenRentalCalendar}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-gray-800">
                  Không tìm thấy sản phẩm nào phù hợp!
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn lại các tiêu chí lọc danh mục.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
