import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  ShoppingBag, 
  Layers, 
  CreditCard, 
  Clock 
} from 'lucide-react';
import { Order } from '../../types';
import { formatVND, formatDateVN } from '../../utils/helpers';

interface SellerRevenueTabProps {
  orders: Order[];
}

export const SellerRevenueTab: React.FC<SellerRevenueTabProps> = ({ orders }) => {
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('week');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const startOfWeek = new Date(now);
  const dayOfWeek = startOfWeek.getDay() || 7;
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  const validOrders = useMemo(() => {
    return orders.filter(o => o.status !== 'cancelled');
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return validOrders.filter(o => {
      const orderDate = new Date(o.createdAt || o.updatedAt || Date.now());
      if (timeFilter === 'today') return (o.createdAt || '').startsWith(todayStr);
      if (timeFilter === 'week') return orderDate >= startOfWeek;
      if (timeFilter === 'month') return orderDate >= startOfMonth;
      return true;
    });
  }, [validOrders, timeFilter, todayStr, startOfWeek, startOfMonth]);

  const stats = useMemo(() => {
    const calc = (list: Order[]) => {
      let revenue = 0;
      let rentRevenue = 0;
      let buyRevenue = 0;
      let depositTotal = 0;

      list.forEach(o => {
        revenue += (o.totalAmount || 0);
        depositTotal += (o.depositTotal || 0);
        o.items.forEach(i => {
          if (i.mode === 'rent') {
            rentRevenue += ((i.price || 0) * (i.quantity || 1));
          } else {
            buyRevenue += ((i.price || 0) * (i.quantity || 1));
          }
        });
      });

      return { revenue, rentRevenue, buyRevenue, depositTotal, count: list.length };
    };

    const todayOrders = validOrders.filter(o => (o.createdAt || '').startsWith(todayStr));
    const weekOrders = validOrders.filter(o => new Date(o.createdAt || o.updatedAt || Date.now()) >= startOfWeek);
    const monthOrders = validOrders.filter(o => new Date(o.createdAt || o.updatedAt || Date.now()) >= startOfMonth);

    return {
      today: calc(todayOrders),
      week: calc(weekOrders),
      month: calc(monthOrders),
      total: calc(validOrders),
      current: calc(filteredOrders)
    };
  }, [validOrders, filteredOrders, todayStr, startOfWeek, startOfMonth]);

  const weekDaysData = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      const dStr = d.toISOString().split('T')[0];
      const dayOrders = validOrders.filter(o => (o.createdAt || '').startsWith(dStr));
      const amount = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      days.push({
        label: i === 6 ? 'CN' : 'T' + (i + 2),
        dateStr: dStr,
        amount,
        count: dayOrders.length
      });
    }
    return days;
  }, [startOfWeek, validOrders]);

  const maxDayAmount = Math.max(...weekDaysData.map(d => d.amount), 1);

  return (
    <div className="space-y-6">
      {/* Top Banner & Filter */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-gray-900">Thống Kê Doanh Thu Của Shop</h3>
              <p className="text-xs text-gray-500">Theo dõi chi tiết dòng tiền bán váy, cho thuê và cọc khách hàng</p>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-gray-100 p-1 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setTimeFilter('today')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              timeFilter === 'today' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Hôm nay
          </button>
          <button
            onClick={() => setTimeFilter('week')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              timeFilter === 'week' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tuần này
          </button>
          <button
            onClick={() => setTimeFilter('month')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              timeFilter === 'month' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tháng này
          </button>
          <button
            onClick={() => setTimeFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              timeFilter === 'all' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tất cả
          </button>
        </div>
      </div>

      {/* 4 Cards: Today, This Week, This Month, Total */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Doanh thu Hôm nay</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-xl"><Clock className="w-4 h-4" /></span>
          </div>
          <h4 className="font-serif text-xl font-bold text-gray-900">{formatVND(stats.today.revenue)}</h4>
          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
            <span>{stats.today.count} đơn hàng</span>
            <span className="text-blue-600 font-medium">Hôm nay</span>
          </div>
        </div>

        {/* This Week */}
        <div className="bg-gradient-to-br from-brand-50 to-white p-5 rounded-3xl border border-brand-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-brand-700 font-medium mb-2">
            <span>Doanh thu Tuần này</span>
            <span className="p-1.5 bg-brand-100 text-brand-700 rounded-xl"><Calendar className="w-4 h-4" /></span>
          </div>
          <h4 className="font-serif text-xl font-bold text-brand-900">{formatVND(stats.week.revenue)}</h4>
          <div className="mt-2 flex items-center justify-between text-[11px] text-brand-700">
            <span>{stats.week.count} đơn hàng</span>
            <span className="font-bold">T2 - CN</span>
          </div>
        </div>

        {/* This Month */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Doanh thu Tháng {now.getMonth() + 1}</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp className="w-4 h-4" /></span>
          </div>
          <h4 className="font-serif text-xl font-bold text-gray-900">{formatVND(stats.month.revenue)}</h4>
          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
            <span>{stats.month.count} đơn hàng</span>
            <span className="text-emerald-600 font-medium">Tháng hiện tại</span>
          </div>
        </div>

        {/* Total Accumulation */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Tổng tích lũy toàn bộ</span>
            <span className="p-1.5 bg-purple-50 text-purple-600 rounded-xl"><Layers className="w-4 h-4" /></span>
          </div>
          <h4 className="font-serif text-xl font-bold text-gray-900">{formatVND(stats.total.revenue)}</h4>
          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
            <span>{stats.total.count} đơn toàn shop</span>
            <span className="text-purple-600 font-medium">Tích lũy</span>
          </div>
        </div>
      </div>

      {/* Week Breakdown Bar Chart & Category Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Bar Chart in This Week */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h4 className="font-serif font-bold text-base text-gray-900">Biến Động Doanh Thu 7 Ngày Trong Tuần</h4>
              <p className="text-xs text-gray-500">Dòng tiền bán & cho thuê thực tế phát sinh trong tuần</p>
            </div>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-xl border border-brand-200">
              {formatVND(stats.week.revenue)}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-6 items-end h-48">
            {weekDaysData.map((d, idx) => {
              const heightPct = Math.max(8, Math.round((d.amount / maxDayAmount) * 100));
              const isToday = d.dateStr === todayStr;
              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] text-gray-500 font-semibold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.amount > 0 ? formatVND(d.amount) : '0đ'}
                  </span>
                  <div className="w-full max-w-[36px] bg-gray-100 rounded-xl h-full flex items-end p-1">
                    <div 
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-lg transition-all duration-500 ${
                        isToday 
                          ? 'bg-brand-600 shadow-md shadow-brand-500/30' 
                          : d.amount > 0 ? 'bg-amber-400 hover:bg-amber-500' : 'bg-transparent'
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-bold mt-2 ${isToday ? 'text-brand-600 underline' : 'text-gray-600'}`}>
                    {d.label}
                  </span>
                  <span className="text-[9px] text-gray-400">
                    {d.count} đơn
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Composition (Rent vs Buy & Deposit) */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h4 className="font-serif font-bold text-base text-gray-900">Cơ Cấu Nguồn Thu</h4>
            <p className="text-xs text-gray-500">Phân loại theo hình thức giao dịch ({timeFilter === 'week' ? 'Tuần này' : timeFilter === 'month' ? 'Tháng này' : timeFilter === 'today' ? 'Hôm nay' : 'Tất cả'})</p>
          </div>

          <div className="space-y-4 pt-2">
            {/* Rent Revenue */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Doanh thu Cho Thuê
                </span>
                <span className="font-bold text-emerald-900">{formatVND(stats.current.rentRevenue)}</span>
              </div>
              <p className="text-[11px] text-emerald-700">Tiền thuê váy theo ngày của khách</p>
            </div>

            {/* Buy Revenue */}
            <div className="p-3.5 rounded-2xl bg-brand-50/70 border border-brand-100">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-brand-800 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-brand-600" /> Doanh thu Bán Đứt
                </span>
                <span className="font-bold text-brand-900">{formatVND(stats.current.buyRevenue)}</span>
              </div>
              <p className="text-[11px] text-brand-700">Khách mua váy thanh lý & mẫu mới</p>
            </div>

            {/* Deposit Holding */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-amber-800 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-600" /> Tiền Cọc Đang Quản Lý
                </span>
                <span className="font-bold text-amber-900">{formatVND(stats.current.depositTotal)}</span>
              </div>
              <p className="text-[11px] text-amber-700">Cọc của khách (hoàn trả khi nhận đồ)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Contributing to this Period */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-3">
          <div>
            <h4 className="font-serif font-bold text-base text-gray-900">
              Danh Sách Đơn Hàng Góp Doanh Thu ({filteredOrders.length} đơn)
            </h4>
            <p className="text-xs text-gray-500">
              Các đơn hàng thực tế ghi nhận doanh thu trong kỳ lọc
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
            Tổng: {formatVND(stats.current.revenue)}
          </span>
        </div>

        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200/80 text-gray-500 font-semibold bg-gray-50/50">
                  <th className="py-3 px-3 rounded-l-xl">Mã Đơn</th>
                  <th className="py-3 px-3">Khách Hàng</th>
                  <th className="py-3 px-3">Sản Phẩm</th>
                  <th className="py-3 px-3">Hình Thức</th>
                  <th className="py-3 px-3">Ngày Tạo</th>
                  <th className="py-3 px-3">Trạng Thái</th>
                  <th className="py-3 px-3 text-right rounded-r-xl">Doanh Thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map(order => {
                  const hasRent = order.items.some(i => i.mode === 'rent');
                  const hasBuy = order.items.some(i => i.mode === 'buy');
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-brand-600">
                        {order.code}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-[10px] text-gray-400">{order.customerPhone}</div>
                      </td>
                      <td className="py-3 px-3 max-w-[200px] truncate text-gray-700">
                        {order.items.map(i => i.productTitle).join(', ')}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          hasRent && hasBuy 
                            ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                            : hasRent 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-brand-50 text-brand-700 border border-brand-200'
                        }`}>
                          {hasRent && hasBuy ? 'Thuê + Mua' : hasRent ? 'Thuê đồ' : 'Mua đứt'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                        {formatDateVN(order.createdAt || '')}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {order.status === 'completed' ? 'Hoàn thành' : order.status === 'rented' ? 'Đang thuê' : order.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-brand-600 font-mono">
                        {formatVND(order.totalAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400 text-xs">
            Không có đơn hàng nào phát sinh trong kỳ lọc này.
          </div>
        )}
      </div>
    </div>
  );
};
