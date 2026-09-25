import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Calendar,
  ShoppingBag,
  Heart,
  TrendingUp,
  ShieldCheck,
  RotateCcw,
  Clock,
  Star,
  PlusCircle,
  PackageOpen,
  Briefcase,
  Crown,
  Smile,
  Gem,
  Layers,
  Footprints
} from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';
import { CATEGORIES } from '../data/initialCategories';
import { useProducts } from '../context/ProductContext';
import { Product } from '../types';
import { formatVND } from '../utils/helpers';

interface HomePageProps {
  onNavigate: (view: string) => void;
  onViewProduct: (productId: string) => void;
  onOpenRentalCalendar: (product: Product) => void;
  onSelectCategory: (categoryId: string) => void;
}

const renderCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Sparkles': return <Sparkles className="w-6 h-6" />;
    case 'Heart': return <Heart className="w-6 h-6" />;
    case 'Layers': return <Layers className="w-6 h-6" />;
    case 'ShoppingBag': return <ShoppingBag className="w-6 h-6" />;
    case 'Footprints': return <Footprints className="w-6 h-6" />;
    case 'Gem': return <Gem className="w-6 h-6" />;
    case 'Briefcase': return <Briefcase className="w-6 h-6" />;
    case 'Crown': return <Crown className="w-6 h-6" />;
    case 'Smile': return <Smile className="w-6 h-6" />;
    default: return <Sparkles className="w-6 h-6" />;
  }
};

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onViewProduct,
  onOpenRentalCalendar,
  onSelectCategory,
}) => {
  const { products } = useProducts();

  const approvedProducts = products.filter((p) => p.status === 'approved');

  // Featured items (both buy and rent)
  const featuredProducts = approvedProducts.slice(0, 4);

  // Rental highlights (specifically tailored for gala, wedding, events)
  const rentalProducts = approvedProducts.filter((p) => p.type === 'rent' || p.type === 'both').slice(0, 4);

  // New arrivals
  const newProducts = [...approvedProducts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);

  return (
    <div className="space-y-10 sm:space-y-16 lg:space-y-24 pb-20">
      
      {/* 1. HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f7f2ef] via-[#faf7f5] to-white pt-6 pb-10 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-12 items-center">
            
            {/* Left Copy (7 cols) */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-brand-100/80 border border-brand-200/80 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold text-brand-800 tracking-wide shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600 animate-spin-slow shrink-0" />
                <span>Nền tảng Mua Bán & Cho Thuê Thời Trang Cao Cấp</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-950 tracking-tight leading-[1.18] sm:leading-[1.15]">
                Thời trang của bạn – <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-500 to-amber-600">
                  Phong cách của bạn
                </span>
              </h1>

              <p className="text-xs sm:text-base text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Tự tin tỏa sáng trong mọi sự kiện, tiệc cưới và dạ hội với bộ sưu tập đầm thiết kế, áo dài tơ tằm và vest cao cấp. Mua sắm hoặc thuê linh hoạt theo ngày với chi phí tiết kiệm.
              </p>

              {/* 2 Big Action CTAs */}
              <div className="flex flex-row gap-2 sm:gap-3.5 justify-center lg:justify-start pt-1 sm:pt-2">
                <button
                  onClick={() => onNavigate('shop')}
                  className="flex-1 sm:flex-initial px-4 py-3 sm:px-7 sm:py-4 rounded-xl sm:rounded-2xl bg-gray-950 hover:bg-gray-800 text-white text-xs font-bold shadow-lg shadow-gray-950/20 transition-all flex items-center justify-center gap-1.5 sm:gap-2 group active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4 text-brand-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="whitespace-nowrap">Mua Đồ Ngay</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform shrink-0 hidden sm:inline" />
                </button>

                <button
                  onClick={() => onNavigate('rent')}
                  className="flex-1 sm:flex-initial px-4 py-3 sm:px-7 sm:py-4 rounded-xl sm:rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-1.5 sm:gap-2 group active:scale-95"
                >
                  <Calendar className="w-4 h-4 text-white group-hover:scale-110 transition-transform shrink-0" />
                  <span className="whitespace-nowrap">Thuê Theo Ngày</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform shrink-0 hidden sm:inline" />
                </button>
              </div>

              {/* Trust badges */}
              <div className="pt-4 sm:pt-6 grid grid-cols-3 gap-2 sm:gap-4 border-t border-brand-200/60 max-w-lg mx-auto lg:mx-0 text-center sm:text-left">
                <div>
                  <span className="block font-serif text-sm sm:text-lg font-bold text-gray-900">Chuẩn 5 Sao</span>
                  <span className="text-[10px] sm:text-[11px] text-gray-500">Giặt hấp tiệt trùng UV</span>
                </div>
                <div>
                  <span className="block font-serif text-sm sm:text-lg font-bold text-gray-900">Linh Hoạt</span>
                  <span className="text-[10px] sm:text-[11px] text-gray-500">Thuê & mua theo ngày</span>
                </div>
                <div>
                  <span className="block font-serif text-sm sm:text-lg font-bold text-gray-900">Minh Bạch</span>
                  <span className="text-[10px] sm:text-[11px] text-gray-500">Hoàn tiền cọc an tâm</span>
                </div>
              </div>
            </div>

            {/* Right Visual Collage (5 cols) */}
            <div className="lg:col-span-5 relative mt-2 sm:mt-0">
              <div className="relative mx-auto max-w-xs sm:max-w-sm lg:max-w-none">
                
                {/* Main Hero Card */}
                {approvedProducts.length > 0 ? (
                  <div
                    onClick={() => onViewProduct(approvedProducts[0].id)}
                    className="relative z-10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl border-2 sm:border-4 border-white aspect-[3/4] bg-gray-100 group cursor-pointer"
                  >
                    <img
                      src={approvedProducts[0].featuredImage}
                      alt={approvedProducts[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 sm:p-6 text-white">
                      <span className="bg-brand-500 text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full w-fit mb-1.5 sm:mb-2">
                        {approvedProducts[0].brand || 'Bộ Sưu Tập Mới'}
                      </span>
                      <h3 className="font-serif text-base sm:text-lg font-bold line-clamp-2">
                        {approvedProducts[0].title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-gray-300 mt-1">
                        {approvedProducts[0].rentPrice1Day ? (
                          <>Giá thuê từ <strong className="text-emerald-400">{formatVND(approvedProducts[0].rentPrice1Day)}</strong> /ngày</>
                        ) : (
                          <>Giá bán <strong className="text-emerald-400">{formatVND(approvedProducts[0].buyPrice || 0)}</strong></>
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl border-2 sm:border-4 border-white aspect-[3/4] bg-gradient-to-br from-brand-950 via-gray-900 to-brand-900 flex flex-col justify-between p-6 sm:p-8 text-white">
                    <div className="flex items-center justify-between">
                      <span className="bg-brand-500/30 text-brand-200 border border-brand-500/40 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Bi Bi Boutique
                      </span>
                      <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                    </div>
                    <div className="space-y-3">
                      <div className="w-12 h-1 bg-brand-500 rounded-full"></div>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold leading-snug">
                        Không Gian Thời Trang & Cho Thuê Váy Thiết Kế
                      </h3>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        Hệ thống mua sắm và cho thuê trang phục dạ tiệc, sự kiện, áo dài theo ngày chuyên nghiệp.
                      </p>
                    </div>
                  </div>
                )}

                {/* Floating mini badge top right (hidden on tiny screens to avoid overflow) */}
                <div className="hidden sm:flex absolute -top-4 -right-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-gray-100 items-center gap-3 animate-bounce-slow">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-900">Đặt Lịch Thuê Ngay</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Tự động chống trùng lịch</span>
                  </div>
                </div>

                {/* Floating mini badge bottom left (hidden on tiny screens to avoid overflow) */}
                <div className="hidden sm:flex absolute -bottom-6 -left-6 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-gray-100 items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-900">An Tâm Hoàn Cọc</span>
                    <span className="text-[10px] text-gray-500">Bảo hiểm trang phục</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 sm:gap-3 mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
              Danh Mục Phong Cách
            </span>
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
              Khám Phá Theo Nhu Cầu
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>Xem tất cả danh mục</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                onNavigate('shop');
              }}
              className="group p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-gray-100/90 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 sm:space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                  {renderCategoryIcon(cat.icon)}
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-50 group-hover:bg-brand-50 flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
              <div>
                <h3 className="font-serif text-xs sm:text-base font-bold text-gray-900 group-hover:text-brand-700 transition-colors">
                  {cat.name}
                </h3>
                <p className="hidden sm:block text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
                <div className="mt-2 sm:mt-3 flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                  <span>Khám phá ngay</span>
                  <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 sm:gap-3 mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
              Sự Lựa Chọn Yêu Thích
            </span>
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
              Sản Phẩm Nổi Bật
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>Xem thêm sản phẩm</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {featuredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onViewDetail={onViewProduct}
                onOpenRentalCalendar={onOpenRentalCalendar}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-8 sm:p-12 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 shadow-xs">
              <PackageOpen className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-gray-800">Chưa có sản phẩm nào trên hệ thống</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              Dữ liệu mẫu đã được dọn sạch. Bạn có thể vào Quản Lý Shop để thêm sản phẩm thật của mình bất kỳ lúc nào!
            </p>
            <div className="mt-5 flex items-center justify-center gap-2.5 sm:gap-3">
              <button
                onClick={() => onNavigate('sell')}
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Đăng Mẫu Váy Đầu Tiên</span>
              </button>
              <button
                onClick={() => onNavigate('quan-ly-shop')}
                className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-all active:scale-95"
              >
                Quản Lý Kho Shop
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 4. RENTAL HIGHLIGHTS SECTION (GALA, WEDDING, EVENTS) */}
      {rentalProducts.length > 0 && (
        <section className="bg-gradient-to-r from-dark-900 via-dark-950 to-dark-900 text-white py-8 sm:py-16 lg:py-20 rounded-2xl sm:rounded-3xl mx-2 sm:mx-6 lg:mx-8 px-3.5 sm:px-6 lg:px-12 shadow-xl">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 sm:gap-4 mb-6 sm:mb-10">
              <div>
                <span className="bg-brand-500/20 text-brand-400 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider border border-brand-500/30">
                  Bộ Sưu Tập Cho Thuê Đặc Sắc
                </span>
                <h2 className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold mt-2 sm:mt-3">
                  Thuê Trang Phục Sự Kiện & Tiệc Tùng
                </h2>
                <p className="text-xs text-gray-400 mt-1.5 max-w-xl">
                  Không cần bỏ ra hàng triệu đồng cho trang phục chỉ mặc 1 lần. Đặt thuê lịch hẹn linh hoạt, giao nhận tận nơi và giặt hấp sẵn sàng.
                </p>
              </div>

              <button
                onClick={() => onNavigate('rent')}
                className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 sm:gap-2 active:scale-95 shadow-md shadow-brand-500/20"
              >
                <Calendar className="w-4 h-4" />
                <span>Xem Toàn Bộ Đồ Thuê</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
              {rentalProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onViewDetail={onViewProduct}
                  onOpenRentalCalendar={onOpenRentalCalendar}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. NEW ARRIVALS */}
      {newProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 sm:gap-3 mb-6 sm:mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
                Vừa Lên Kệ
              </span>
              <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                Sản Phẩm Mới Đăng Gần Đây
              </h2>
            </div>
            <button
              onClick={() => onNavigate('shop')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {newProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onViewDetail={onViewProduct}
                onOpenRentalCalendar={onOpenRentalCalendar}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. SELL / RENT OUT CTA SECTION */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-brand-600 to-brand-800 p-6 sm:p-12 lg:p-16 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4">
            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Dành Cho Người Có Đồ Muốn Chia Sẻ
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
              Bạn Có Quần Áo Không Sử Dụng Đến?
            </h2>
            <p className="text-xs sm:text-sm text-brand-100 leading-relaxed font-normal">
              Đăng sản phẩm lên sàn Bi Bi ngay hôm nay để bán lại hoặc cho thuê theo ngày. Dễ dàng tiếp cận hàng ngàn khách hàng có nhu cầu với hệ thống quản lý lịch thuê chống trùng tự động.
            </p>

            <div className="pt-2 sm:pt-3">
              <button
                onClick={() => onNavigate('sell')}
                className="px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl bg-white text-gray-900 hover:bg-gray-100 text-xs font-bold shadow-xl transition-all flex items-center gap-2 group active:scale-95"
              >
                <PlusCircle className="w-4 h-4 text-brand-600 group-hover:rotate-90 transition-transform" />
                <span>Đăng Sản Phẩm Ngay</span>
              </button>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-20 pointer-events-none hidden lg:block">
            <Sparkles className="w-full h-full text-white" />
          </div>
        </div>
      </section>

    </div>
  );
};
