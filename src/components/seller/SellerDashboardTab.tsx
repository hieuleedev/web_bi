import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Award, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Calendar, 
  Flame, 
  Crown, 
  Sparkles, 
  Phone, 
  History, 
  ExternalLink,
  Layers
} from 'lucide-react';
import { Order, Product } from '../../types';
import { formatVND, formatDateVN } from '../../utils/helpers';
import { CustomerHistoryModal, CustomerSummary } from '../customer/CustomerHistoryModal';

interface SellerDashboardTabProps {
  orders: Order[];
  products: Product[];
  onViewOrderDetail?: (order: Order) => void;
  onViewInvoice?: (order: Order) => void;
  onSelectProduct?: (productId: string) => void;
}

export const SellerDashboardTab: React.FC<SellerDashboardTabProps> = ({
  orders,
  products,
  onViewOrderDetail,
  onViewInvoice,
  onSelectProduct
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);

  // 1. Phân tích thống kê Váy được thuê nhiều nhất & Khách thuê nhiều nhất
  const { topDresses, topCustomers, summary } = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'cancelled');

    const dressMap = new Map<string, {
      id: string;
      title: string;
      image: string;
      rentCount: number;
      totalRevenue: number;
      price: number;
      category?: string;
      isCurrentlyRented?: boolean;
    }>();

    const customerMap = new Map<string, CustomerSummary>();

    let totalRentalCount = 0;
    let totalRentalRevenue = 0;

    validOrders.forEach((ord) => {
      const phone = (ord.customerPhone || '').trim();
      const customerName = ord.customerName || 'Khách hàng';
      const items = ord.items || [];
      const isPaid = ord.paymentStatus === 'paid';
      const orderTotal = ord.totalAmount || 0;

      // Nhóm khách hàng
      if (phone) {
        if (!customerMap.has(phone)) {
          customerMap.set(phone, {
            id: `cust-${phone}`,
            name: customerName,
            phone,
            email: ord.customerEmail || '',
            address: ord.shippingAddress || '',
            total_rent_count: 0,
            total_orders_count: 0,
            total_spent: 0,
            paid_amount: 0,
            debt: 0,
            last_order_date: ord.createdAt,
            is_vip: false,
            recent_dresses: []
          });
        }
        const cust = customerMap.get(phone)!;
        cust.total_orders_count += 1;
        cust.total_spent += orderTotal;
        if (isPaid) cust.paid_amount += orderTotal;
        else cust.debt += orderTotal;

        if (new Date(ord.createdAt || '').getTime() > new Date(cust.last_order_date || '').getTime()) {
          cust.last_order_date = ord.createdAt;
          if (ord.customerName) cust.name = ord.customerName;
        }
      }

      // Duyệt từng sản phẩm trong đơn
      items.forEach((it) => {
        if (it.mode === 'rent') {
          const qty = it.quantity || 1;
          const rentFee = (it.price || 0) * qty;

          totalRentalCount += qty;
          totalRentalRevenue += rentFee;

          if (phone && customerMap.has(phone)) {
            customerMap.get(phone)!.total_rent_count += qty;
            if (it.productTitle && !customerMap.get(phone)!.recent_dresses?.includes(it.productTitle)) {
              customerMap.get(phone)!.recent_dresses?.push(it.productTitle);
            }
          }

          const dressKey = it.productId || it.productTitle;
          if (!dressMap.has(dressKey)) {
            // Tìm thông tin sản phẩm từ kho váy
            const prod = products.find((p) => p.id === it.productId);
            dressMap.set(dressKey, {
              id: it.productId,
              title: it.productTitle,
              image: it.productImage || prod?.featuredImage || prod?.images?.[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=300&q=80',
              rentCount: 0,
              totalRevenue: 0,
              price: it.price || prod?.rentPrice1Day || 0,
              category: prod?.category,
              isCurrentlyRented: ord.status === 'rented'
            });
          }

          const d = dressMap.get(dressKey)!;
          d.rentCount += qty;
          d.totalRevenue += rentFee;
          if (ord.status === 'rented') d.isCurrentlyRented = true;
          if (!d.image && it.productImage) d.image = it.productImage;
        }
      });
    });

    const dressesSorted = Array.from(dressMap.values()).sort((a, b) => b.rentCount - a.rentCount || b.totalRevenue - a.totalRevenue);

    const customersSorted = Array.from(customerMap.values())
      .map((c) => {
        c.is_vip = c.total_rent_count >= 2 || c.total_spent >= 500000;
        return c;
      })
      .sort((a, b) => b.total_rent_count - a.total_rent_count || b.total_spent - a.total_spent);

    return {
      topDresses: dressesSorted,
      topCustomers: customersSorted,
      summary: {
        totalRentalCount,
        totalRentalRevenue,
        totalCustomers: customerMap.size,
        totalDressesRented: dressMap.size
      }
    };
  }, [orders, products]);

  const maxDressRentCount = Math.max(...topDresses.map((d) => d.rentCount), 1);
  const bestDress = topDresses[0];
  const bestCustomer = topCustomers[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-stone-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold mb-2 backdrop-blur-xs border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Báo Cáo Hiệu Suất Kinh Doanh & Độ Hot Sản Phẩm</span>
            </div>
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white">
              Dashboard Thống Kê Váy & Khách Thuê
            </h3>
            <p className="text-xs text-white/70 mt-1 max-w-xl">
              Phân tích số liệu thực tế từ toàn bộ đơn hàng: Xem mẫu váy nào đắt khách nhất và khách hàng nào gắn bó, thuê đồ nhiều nhất.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10 shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-white/60 block">Tổng Lượt Thuê</span>
              <span className="font-bold text-xl text-amber-300 font-mono">
                {summary.totalRentalCount} lượt
              </span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-right">
              <span className="text-[10px] text-white/60 block">Doanh Thu Thuê</span>
              <span className="font-bold text-xl text-white font-mono">
                {formatVND(summary.totalRentalRevenue)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Spotlight Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Top 1 Dress */}
        <div className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-sm relative overflow-hidden bg-gradient-to-br from-amber-50/40 to-white">
          <div className="flex items-center justify-between text-xs text-amber-900 font-bold mb-2">
            <span className="flex items-center gap-1">
              <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
              Váy Được Thuê Nhiều Nhất
            </span>
            <span className="p-1.5 bg-amber-100 text-amber-700 rounded-xl">#1 Hot</span>
          </div>
          {bestDress ? (
            <div className="flex items-center gap-3 mt-1">
              <img
                src={bestDress.image}
                alt={bestDress.title}
                className="w-13 h-13 rounded-2xl object-cover border border-amber-200 shrink-0 shadow-2xs"
              />
              <div className="min-w-0 flex-1">
                <h5 className="font-bold text-xs text-gray-900 truncate" title={bestDress.title}>
                  {bestDress.title}
                </h5>
                <p className="text-emerald-700 font-black font-mono text-sm mt-0.5">
                  {bestDress.rentCount} lần thuê
                </p>
                <p className="text-[10px] text-gray-400 font-mono">
                  Thu về {formatVND(bestDress.totalRevenue)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 mt-2">Chưa có dữ liệu thuê</p>
          )}
        </div>

        {/* Card 2: Top 1 Customer */}
        <div className="bg-white p-5 rounded-3xl border border-brand-200/80 shadow-sm relative overflow-hidden bg-gradient-to-br from-brand-50/40 to-white">
          <div className="flex items-center justify-between text-xs text-brand-900 font-bold mb-2">
            <span className="flex items-center gap-1">
              <Award className="w-4 h-4 text-brand-600 fill-brand-500" />
              Khách Hàng Thuê Nhiều Nhất
            </span>
            <span className="p-1.5 bg-brand-100 text-brand-700 rounded-xl">VIP #1</span>
          </div>
          {bestCustomer ? (
            <div className="mt-1">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-sm text-gray-900 truncate">{bestCustomer.name}</h5>
                <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-lg">
                  {bestCustomer.phone}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="font-black text-amber-600 font-mono">
                  👑 {bestCustomer.total_rent_count} lần thuê
                </span>
                <span className="font-bold text-gray-700 font-mono">
                  {formatVND(bestCustomer.total_spent)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 mt-2">Chưa có dữ liệu khách</p>
          )}
        </div>

        {/* Card 3: Total Dresses Rented */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Mẫu Váy Đã Được Thuê</span>
            <span className="p-1.5 bg-purple-50 text-purple-600 rounded-xl"><Layers className="w-4 h-4" /></span>
          </div>
          <h4 className="font-serif text-2xl font-bold text-gray-900">{summary.totalDressesRented} mẫu</h4>
          <p className="text-[11px] text-gray-400 mt-1">Trong tổng {products.length} mẫu trong kho</p>
        </div>

        {/* Card 4: Total Customers Count */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Tổng Khách Hàng Thuê</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-xl"><Users className="w-4 h-4" /></span>
          </div>
          <h4 className="font-serif text-2xl font-bold text-blue-600">{summary.totalCustomers} khách</h4>
          <p className="text-[11px] text-gray-400 mt-1">Đã phát sinh đơn thuê</p>
        </div>
      </div>

      {/* 2 Main Ranking Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: TOP VÁY ĐƯỢC THUÊ NHIỀU NHẤT */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h4 className="font-serif font-bold text-base text-gray-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500 fill-rose-500" />
                <span>Bảng Xếp Hạng Váy Thuê Nhiều Nhất</span>
              </h4>
              <p className="text-xs text-gray-500">Các mẫu váy đắt khách và sinh lời cao nhất cho tiệm</p>
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl">
              Top Hot
            </span>
          </div>

          {topDresses.length > 0 ? (
            <div className="space-y-3">
              {topDresses.map((dress, index) => {
                const isTop1 = index === 0;
                const isTop2 = index === 1;
                const isTop3 = index === 2;
                const percentage = Math.max(10, Math.round((dress.rentCount / maxDressRentCount) * 100));

                return (
                  <div
                    key={dress.id || index}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isTop1 
                        ? 'bg-amber-50/40 border-amber-200 ring-1 ring-amber-300/30' 
                        : 'bg-white border-gray-100 hover:border-brand-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank badge */}
                      <div className="w-7 text-center shrink-0">
                        {isTop1 ? (
                          <span className="text-lg">🥇</span>
                        ) : isTop2 ? (
                          <span className="text-lg">🥈</span>
                        ) : isTop3 ? (
                          <span className="text-lg">🥉</span>
                        ) : (
                          <span className="font-mono font-bold text-xs text-gray-400">#{index + 1}</span>
                        )}
                      </div>

                      {/* Image */}
                      <img
                        src={dress.image}
                        alt={dress.title}
                        className="w-14 h-14 rounded-2xl object-cover border border-gray-100 shrink-0 shadow-2xs cursor-pointer hover:opacity-90"
                        onClick={() => onSelectProduct && dress.id && onSelectProduct(dress.id)}
                      />

                      {/* Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h5 
                            className="font-bold text-xs text-gray-900 truncate cursor-pointer hover:text-brand-600"
                            onClick={() => onSelectProduct && dress.id && onSelectProduct(dress.id)}
                            title={dress.title}
                          >
                            {dress.title}
                          </h5>
                          {dress.isCurrentlyRented && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[9px] shrink-0">
                              Đang cho thuê
                            </span>
                          )}
                        </div>

                        {/* Progress bar of rental frequency */}
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            style={{ width: `${percentage}%` }}
                            className={`h-full rounded-full ${
                              isTop1 ? 'bg-amber-500' : isTop2 ? 'bg-brand-500' : 'bg-emerald-500'
                            }`}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-0.5">
                          <span className="font-bold text-emerald-700 font-mono">
                            👗 {dress.rentCount} lượt thuê
                          </span>
                          <span className="font-mono font-semibold text-gray-600">
                            Thu về: <strong className="text-gray-900">{formatVND(dress.totalRevenue)}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 text-xs">
              Chưa có dữ liệu thuê váy nào.
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: TOP KHÁCH HÀNG THUÊ NHIỀU NHẤT */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h4 className="font-serif font-bold text-base text-gray-900 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>Bảng Xếp Hạng Khách Hàng VIP</span>
              </h4>
              <p className="text-xs text-gray-500">Khách hàng thuê nhiều lần & đóng góp doanh thu lớn nhất</p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl">
              Top VIP
            </span>
          </div>

          {topCustomers.length > 0 ? (
            <div className="space-y-3">
              {topCustomers.map((customer, index) => {
                const isTop1 = index === 0;
                const isTop2 = index === 1;
                const isTop3 = index === 2;
                const cleanPhone = customer.phone.replace(/\s+/g, '');

                return (
                  <div
                    key={customer.phone}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isTop1 
                        ? 'bg-amber-50/40 border-amber-200 ring-1 ring-amber-300/30' 
                        : 'bg-white border-gray-100 hover:border-brand-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank badge */}
                      <div className="w-7 text-center shrink-0">
                        {isTop1 ? (
                          <span className="text-lg">👑</span>
                        ) : isTop2 ? (
                          <span className="text-lg">🥈</span>
                        ) : isTop3 ? (
                          <span className="text-lg">🥉</span>
                        ) : (
                          <span className="font-mono font-bold text-xs text-gray-400">#{index + 1}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                        {customer.name ? customer.name.charAt(0).toUpperCase() : 'K'}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-bold text-xs text-gray-900 truncate">
                              {customer.name}
                            </span>
                            {customer.is_vip && (
                              <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 font-bold text-[9px] border border-amber-300">
                                VIP
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <a
                              href={`tel:${cleanPhone}`}
                              className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50"
                              title="Gọi điện"
                            >
                              <Phone className="w-3 h-3" />
                            </a>
                            <a
                              href={`https://zalo.me/${cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold text-blue-600 hover:bg-blue-50"
                            >
                              Zalo
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono font-bold text-brand-600">
                            📞 {customer.phone}
                          </span>
                          <span className="font-mono text-gray-700 font-bold">
                            Chi tiêu: {formatVND(customer.total_spent)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold font-mono text-[10px] border border-emerald-200">
                            👗 {customer.total_rent_count} lần thuê
                          </span>

                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-0.5 hover:underline"
                          >
                            <History className="w-3 h-3" />
                            <span>Xem lịch sử</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 text-xs">
              Chưa có dữ liệu khách hàng nào.
            </div>
          )}
        </div>

      </div>

      {/* Customer History Modal */}
      {selectedCustomer && (
        <CustomerHistoryModal
          customer={selectedCustomer}
          orders={orders}
          isOpen={Boolean(selectedCustomer)}
          onClose={() => setSelectedCustomer(null)}
          onViewOrderDetail={onViewOrderDetail}
          onViewInvoice={onViewInvoice}
        />
      )}
    </div>
  );
};
