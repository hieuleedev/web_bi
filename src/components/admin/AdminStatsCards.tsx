import React from 'react';
import { TrendingUp, Package, Calendar, Layers } from 'lucide-react';
import { formatVND } from '../../utils/helpers';

interface AdminStatsCardsProps {
  totalRevenue: number;
  ordersCount: number;
  totalRentals: number;
  productsCount: number;
}

export const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({
  totalRevenue,
  ordersCount,
  totalRentals,
  productsCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[11px] text-gray-500 font-medium">Doanh Số Toàn Sàn</span>
          <h3 className="font-serif text-lg font-bold text-gray-900">{formatVND(totalRevenue)}</h3>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[11px] text-gray-500 font-medium">Tổng Số Đơn Hàng</span>
          <h3 className="font-serif text-lg font-bold text-gray-900">{ordersCount} đơn</h3>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[11px] text-gray-500 font-medium">Lượt Thuê Trang Phục</span>
          <h3 className="font-serif text-lg font-bold text-gray-900">{totalRentals} lượt</h3>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[11px] text-gray-500 font-medium">Sản Phẩm Đang Bán/Thuê</span>
          <h3 className="font-serif text-lg font-bold text-gray-900">{productsCount} mẫu</h3>
        </div>
      </div>
    </div>
  );
};
