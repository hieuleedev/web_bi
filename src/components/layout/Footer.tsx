import React from 'react';
import { Sparkles, ShieldCheck, Truck, RotateCcw, Clock, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-900 text-gray-300 pt-16 pb-12 border-t border-gray-800">
      {/* Service Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-gray-800">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-dark-800/60 border border-gray-800/80">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Cam Kết Cọc Minh Bạch</h4>
              <p className="text-xs text-gray-400 mt-1">Hoàn 100% tiền cọc ngay khi nhận lại đồ trong vòng 24 giờ kiểm tra.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-dark-800/60 border border-gray-800/80">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Giặt Hấp Chuẩn 5 Sao</h4>
              <p className="text-xs text-gray-400 mt-1">Trang phục được hấp khử khuẩn tia UV, thơm tho và thẳng thớm từng đường ly.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-dark-800/60 border border-gray-800/80">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Giao Nhận Tận Nơi</h4>
              <p className="text-xs text-gray-400 mt-1">Giao trước ngày sự kiện 1 ngày để khách thử vừa vặn, ship hỏa tốc toàn quốc.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-dark-800/60 border border-gray-800/80">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Đổi Size Miễn Phí</h4>
              <p className="text-xs text-gray-400 mt-1">Hỗ trợ đổi size khẩn cấp trong vòng 4 giờ nếu không vừa vặn.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Intro */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-white">
                  Bi Bi
                </span>
                <span className="block text-[10px] uppercase tracking-widest text-brand-400 font-semibold -mt-1">
                  Boutique & Rental
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed pr-6">
              Nền tảng thương mại điện tử thời trang kết hợp bán và cho thuê trang phục cao cấp đầu tiên với công nghệ quản lý lịch thuê thông minh, cam kết thẩm mỹ, tiện ích và tối ưu chi phí cho người yêu thời trang.
            </p>

            <div className="pt-2 space-y-2 text-xs text-gray-300">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Khối 1 - Xã Núi Thành - Thành Phố Đà Nẵng, Da Nang, Vietnam, 560000</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Hotline: (+84) 79 562 3097 (8:00 - 22:00 hàng ngày)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>contact@bibifashion.vn</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase font-sans">
              Khám Phá
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#shop" className="hover:text-brand-400 transition-colors">Mua Quần Áo Thiết Kế</a></li>
              <li><a href="#rent" className="hover:text-brand-400 transition-colors">Thuê Đầm Dạ Hội & Gala</a></li>
              <li><a href="#rent" className="hover:text-brand-400 transition-colors">Thuê Áo Dài Kỷ Yếu & Cưới</a></li>
              <li><a href="#rent" className="hover:text-brand-400 transition-colors">Thuê Vest Nam & Suit Lịch Lãm</a></li>
              <li><a href="#sell" className="hover:text-brand-400 transition-colors">Đăng Đồ Bán & Cho Thuê</a></li>
            </ul>
          </div>

          {/* Rental Policy */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase font-sans">
              Chính Sách Thuê
            </h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-gray-400">Quy định đặt cọc & hoàn cọc</span></li>
              <li><span className="text-gray-400">Hướng dẫn nhận & trả đồ</span></li>
              <li><span className="text-gray-400">Bảo hiểm hư hại trang phục</span></li>
              <li><span className="text-gray-400">Gia hạn thời gian thuê</span></li>
              <li><span className="text-gray-400">Chính sách giặt hấp chuẩn</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase font-sans">
              Nhận Ưu Đãi Mới
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Đăng ký nhận voucher giảm giá 15% cho đơn thuê hoặc mua đầu tiên tại Bi Bi.
            </p>
            <div className="flex gap-1.5">
              <input
                type="email"
                placeholder="Email của bạn..."
                className="bg-dark-800 border border-gray-700 text-xs px-3 py-2 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-500 w-full"
              />
              <button className="bg-brand-500 hover:bg-brand-600 text-white text-xs px-3 py-2 rounded-lg font-medium transition-colors shrink-0">
                Gửi
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800/80 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-gray-500">
          <p>© 2026 Bi Bi Fashion Boutique & Rental Marketplace. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Điều khoản sử dụng</span>
            <span>Chính sách bảo mật</span>
            <span>Hợp đồng dịch vụ thuê</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
