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
  PlusCircle
} from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';
import { CATEGORIES } from '../data/initialCategories';
import { useProducts } from '../context/ProductContext';
import { Product } from '../types';

interface HomePageProps {
  onNavigate: (view: string) => void;
  onViewProduct: (productId: string) => void;
  onOpenRentalCalendar: (product: Product) => void;
  onSelectCategory: (categoryId: string) => void;
}

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
    <div className="space-y-16 lg:space-y-24 pb-20">
      
      {/* 1. HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f7f2ef] via-[#faf7f5] to-white pt-10 pb-16 lg:pt-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Copy (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-brand-100/80 border border-brand-200/80 px-3.5 py-1.5 rounded-full text-xs font-semibold text-brand-800 tracking-wide shadow-sm">
                <Sparkles className="w-4 h-4 text-brand-600 animate-spin-slow" />
                <span>Nền tảng Mua Bán & Cho Thuê Thời Trang Cao Cấp</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-950 tracking-tight leading-[1.15]">
                Thời trang của bạn – <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-500 to-amber-600">
                  Phong cách của bạn
                </span>
              </h1>

              <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Tự tin tỏa sáng trong mọi sự kiện, tiệc cưới và dạ hội với bộ sưu tập đầm thiết kế, áo dài tơ tằm và vest cao cấp. Mua sắm hoặc thuê linh hoạt theo ngày với chi phí tiết kiệm đến 80%.
              </p>

              {/* 2 Big Action CTAs */}
              <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start pt-2">
                <button
                  onClick={() => onNavigate('shop')}
                  className="px-7 py-4 rounded-2xl bg-gray-950 hover:bg-gray-800 text-white text-xs font-bold shadow-xl shadow-gray-950/20 transition-all flex items-center justify-center gap-2 group"
                >
                  <ShoppingBag className="w-4 h-4 text-brand-400 group-hover:scale-110 transition-transform" />
                  <span>Mua Quần Áo Ngay</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate('rent')}
                  className="px-7 py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center gap-2 group"
                >
                  <Calendar className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                  <span>Thuê Đồ Theo Ngày</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Trust badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-brand-200/60 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <span className="block font-serif text-xl font-bold text-gray-900">5,000+</span>
                  <span className="text-[11px] text-gray-500">Mẫu váy tiệc & áo dài</span>
                </div>
                <div>
                  <span className="block font-serif text-xl font-bold text-gray-900">100%</span>
                  <span className="text-[11px] text-gray-500">Giặt hấp UV khử khuẩn</span>
                </div>
                <div>
                  <span className="block font-serif text-xl font-bold text-gray-900">24h</span>
                  <span className="text-[11px] text-gray-500">Hoàn tiền cọc minh bạch</span>
                </div>
              </div>
            </div>

            {/* Right Visual Collage (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm lg:max-w-none">
                
                {/* Main Hero Card */}
                <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[3/4] bg-gray-100 group">
                  <img
                    src="https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80"
                    alt="Thời trang dạ hội Bi Bi"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                    <span className="bg-brand-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full w-fit mb-2">
                      Bộ Sưu Tập Mới 2026
                    </span>
                    <h3 className="font-serif text-lg font-bold">
                      Đầm Dạ Hội Sparkling Rose Gold
                    </h3>
                    <p className="text-xs text-gray-300 mt-1">
                      Giá thuê chỉ từ <strong className="text-emerald-400">450.000 ₫</strong> /ngày
                    </p>
                  </div>
                </div>

                {/* Floating mini badge top right */}
                <div className="absolute -top-4 -right-4 z-20 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 animate-bounce-slow">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-900">Đặt Lịch Thuê Ngay</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Trống lịch cuối tuần này</span>
                  </div>
                </div>

                {/* Floating mini badge bottom left */}
                <div className="absolute -bottom-6 -left-6 z-20 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
              Danh Mục Phong Cách
            </span>
            <h2 className="font-serif text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
              Khám Phá Theo Nhu Cầu
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>Xem tất cả danh mục</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                onNavigate('shop');
              }}
              className="group relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                <h3 className="font-serif text-base sm:text-lg font-bold group-hover:text-brand-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-gray-300 line-clamp-1 mt-0.5">
                  {cat.description}
                </p>
                <div className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-brand-300">
                  <span>Khám phá</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
              Sự Lựa Chọn Yêu Thích
            </span>
            <h2 className="font-serif text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
              Sản Phẩm Nổi Bật
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>Xem thêm sản phẩm</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onViewDetail={onViewProduct}
              onOpenRentalCalendar={onOpenRentalCalendar}
            />
          ))}
        </div>
      </section>

      {/* 4. RENTAL HIGHLIGHTS SECTION (GALA, WEDDING, EVENTS) */}
      <section className="bg-gradient-to-r from-dark-900 via-dark-950 to-dark-900 text-white py-16 lg:py-20 rounded-3xl mx-4 sm:mx-6 lg:mx-8 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
            <div>
              <span className="bg-brand-500/20 text-brand-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-brand-500/30">
                Bộ Sưu Tập Cho Thuê Đặc Sắc
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold mt-3">
                Thuê Trang Phục Sự Kiện & Tiệc Tùng
              </h2>
              <p className="text-xs text-gray-400 mt-1.5 max-w-xl">
                Không cần bỏ ra hàng triệu đồng cho trang phục chỉ mặc 1 lần. Đặt thuê lịch hẹn linh hoạt, giao nhận tận nơi và giặt hấp sẵn sàng.
              </p>
            </div>

            <button
              onClick={() => onNavigate('rent')}
              className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Xem Toàn Bộ Đồ Thuê</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* 5. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
              Vừa Lên Kệ
            </span>
            <h2 className="font-serif text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
              Sản Phẩm Mới Đăng Gần Đây
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* 6. SELL / RENT OUT CTA SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand-600 to-brand-800 p-8 sm:p-12 lg:p-16 text-white shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Dành Cho Người Có Đồ Muốn Chia Sẻ
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
              Bạn Có Quần Áo Không Sử Dụng Đến?
            </h2>
            <p className="text-xs sm:text-sm text-brand-100 leading-relaxed font-normal">
              Đăng sản phẩm lên sàn Bi Bi ngay hôm nay để bán lại hoặc cho thuê theo ngày. Dễ dàng tiếp cận hàng ngàn khách hàng có nhu cầu với hệ thống quản lý lịch thuê chống trùng tự động.
            </p>

            <div className="pt-3">
              <button
                onClick={() => onNavigate('sell')}
                className="px-8 py-4 rounded-2xl bg-white text-gray-900 hover:bg-gray-100 text-xs font-bold shadow-xl transition-all flex items-center gap-2 group"
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
