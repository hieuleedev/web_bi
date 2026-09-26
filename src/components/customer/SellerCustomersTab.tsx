import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Award, 
  Phone, 
  Calendar, 
  ShoppingBag, 
  ArrowUpDown, 
  History, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Order } from '../../types';
import { formatVND, formatDateVN } from '../../utils/helpers';
import { CustomerHistoryModal, CustomerSummary } from './CustomerHistoryModal';

interface SellerCustomersTabProps {
  orders: Order[];
  onViewOrderDetail?: (order: Order) => void;
  onViewInvoice?: (order: Order) => void;
}

export const SellerCustomersTab: React.FC<SellerCustomersTabProps> = ({
  orders,
  onViewOrderDetail,
  onViewInvoice
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'rentCount' | 'spent' | 'recent' | 'debt'>('rentCount');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);

  // Nhóm toàn bộ đơn hàng theo Số Điện Thoại duy nhất
  const customersList: CustomerSummary[] = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'cancelled');
    const map = new Map<string, CustomerSummary>();

    validOrders.forEach((ord) => {
      const phone = (ord.customerPhone || '').trim();
      if (!phone) return;

      const items = ord.items || [];
      const hasRent = items.some((i) => i.mode === 'rent');
      const orderTotal = ord.totalAmount || 0;
      const isPaid = ord.paymentStatus === 'paid';

      if (!map.has(phone)) {
        map.set(phone, {
          id: `cust-${phone}`,
          name: ord.customerName || 'Khách hàng',
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
          notes: ord.notes || '',
          recent_dresses: []
        });
      }

      const c = map.get(phone)!;
      c.total_orders_count += 1;
      if (hasRent) c.total_rent_count += 1;
      c.total_spent += orderTotal;
      if (isPaid) {
        c.paid_amount += orderTotal;
      } else {
        c.debt += orderTotal;
      }

      // Giữ tên mới nhất
      if (ord.customerName) c.name = ord.customerName;
      if (ord.shippingAddress) c.address = ord.shippingAddress;

      // Cập nhật ngày đơn gần nhất
      if (!c.last_order_date || new Date(ord.createdAt || '').getTime() > new Date(c.last_order_date).getTime()) {
        c.last_order_date = ord.createdAt;
      }

      // Danh sách váy đã thuê
      items.forEach((it) => {
        if (it.productTitle && !c.recent_dresses?.includes(it.productTitle)) {
          c.recent_dresses?.push(it.productTitle);
        }
      });
    });

    return Array.from(map.values()).map((c) => {
      c.is_vip = c.total_rent_count >= 2 || c.total_spent >= 500000;
      return c;
    });
  }, [orders]);

  // Bộ lọc & Tìm kiếm
  const filteredCustomers = useMemo(() => {
    let result = [...customersList];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (c) => c.phone.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'spent') {
      result.sort((a, b) => b.total_spent - a.total_spent);
    } else if (sortBy === 'recent') {
      result.sort(
        (a, b) => new Date(b.last_order_date || '').getTime() - new Date(a.last_order_date || '').getTime()
      );
    } else if (sortBy === 'debt') {
      result.sort((a, b) => b.debt - a.debt);
    } else {
      // Mặc định: Thuê nhiều nhất
      result.sort((a, b) => b.total_rent_count - a.total_rent_count || b.total_spent - a.total_spent);
    }

    return result;
  }, [customersList, searchTerm, sortBy]);

  // Chỉ số KPI
  const stats = useMemo(() => {
    const totalCustomers = customersList.length;
    const vipCount = customersList.filter((c) => c.is_vip).length;
    const hasDebtCount = customersList.filter((c) => c.debt > 0).length;
    const totalRentals = customersList.reduce((sum, c) => sum + c.total_rent_count, 0);

    return { totalCustomers, vipCount, hasDebtCount, totalRentals };
  }, [customersList]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl text-gray-900">Quản Lý Khách Hàng Của Shop</h3>
            <p className="text-xs text-gray-500">
              Thống kê tự động theo số điện thoại • Theo dõi khách thuê nhiều nhất & xem lịch sử từng khách
            </p>
          </div>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Customers */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Tổng Khách Hàng</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-xl"><Users className="w-4 h-4" /></span>
          </div>
          <h4 className="font-serif text-2xl font-bold text-gray-900">{stats.totalCustomers}</h4>
          <p className="text-[11px] text-gray-400 mt-1">Đã lưu theo SĐT</p>
        </div>

        {/* Top VIP */}
        <div className="bg-gradient-to-br from-amber-500/10 to-white p-5 rounded-3xl border border-amber-200/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-amber-800 font-medium mb-2">
            <span>Khách VIP Thân Thiết</span>
            <span className="p-1.5 bg-amber-100 text-amber-700 rounded-xl"><Award className="w-4 h-4" /></span>
          </div>
          <h4 className="font-serif text-2xl font-bold text-amber-900">{stats.vipCount}</h4>
          <p className="text-[11px] text-amber-700 mt-1">Thuê ≥ 2 lần tại shop</p>
        </div>

        {/* Total Rental Count */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Tổng Lượt Thuê Váy</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-xl"><ShoppingBag className="w-4 h-4" /></span>
          </div>
          <h4 className="font-serif text-2xl font-bold text-emerald-700">{stats.totalRentals}</h4>
          <p className="text-[11px] text-gray-400 mt-1">Lượt thuê toàn bộ khách</p>
        </div>

        {/* Debt warning */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Khách Chưa Trả Hết Tiền</span>
            <span className="p-1.5 bg-rose-50 text-rose-600 rounded-xl"><AlertCircle className="w-4 h-4" /></span>
          </div>
          <h4 className="font-serif text-2xl font-bold text-rose-600">{stats.hasDebtCount}</h4>
          <p className="text-[11px] text-gray-400 mt-1">Đơn chưa thanh toán</p>
        </div>
      </div>

      {/* Search & Sort Filters */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo số điện thoại hoặc tên khách..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
        </div>

        {/* Sort Pill Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
          <span className="text-gray-400 text-[11px] whitespace-nowrap mr-1 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" /> Sắp xếp:
          </span>
          <button
            onClick={() => setSortBy('rentCount')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              sortBy === 'rentCount'
                ? 'bg-brand-600 text-white shadow-xs font-bold'
                : 'bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            🏆 Thuê nhiều nhất
          </button>
          <button
            onClick={() => setSortBy('spent')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              sortBy === 'spent'
                ? 'bg-brand-600 text-white shadow-xs font-bold'
                : 'bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            💰 Chi tiêu cao nhất
          </button>
          <button
            onClick={() => setSortBy('recent')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              sortBy === 'recent'
                ? 'bg-brand-600 text-white shadow-xs font-bold'
                : 'bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            🕒 Mới thuê gần đây
          </button>
          <button
            onClick={() => setSortBy('debt')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              sortBy === 'debt'
                ? 'bg-brand-600 text-white shadow-xs font-bold'
                : 'bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            ⏳ Còn nợ tiền
          </button>
        </div>
      </div>

      {/* Customer List Table */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h4 className="font-serif font-bold text-base text-gray-900">
            Danh Sách Khách Hàng ({filteredCustomers.length})
          </h4>
          <span className="text-xs text-gray-400">Bấm vào khách hàng để xem toàn bộ lịch sử thuê</span>
        </div>

        {filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200/80 text-gray-500 font-semibold bg-gray-50/50">
                  <th className="py-3 px-3 rounded-l-xl w-14 text-center">Hạng</th>
                  <th className="py-3 px-3">Khách Hàng & SĐT</th>
                  <th className="py-3 px-3 text-center">Số Lần Thuê</th>
                  <th className="py-3 px-3 text-right">Tổng Chi Tiêu</th>
                  <th className="py-3 px-3 text-center">Thanh Toán</th>
                  <th className="py-3 px-3">Lần Thuê Gần Nhất</th>
                  <th className="py-3 px-3 text-center rounded-r-xl">Lịch Sử</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((c, index) => {
                  const cleanPhone = c.phone.replace(/\s+/g, '');
                  const isTop1 = index === 0;
                  const isTop2 = index === 1;
                  const isTop3 = index === 2;

                  return (
                    <tr
                      key={c.phone}
                      onClick={() => setSelectedCustomer(c)}
                      className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                    >
                      {/* Rank badge */}
                      <td className="py-3.5 px-3 text-center">
                        {isTop1 ? (
                          <span className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black text-xs inline-flex items-center justify-center shadow-xs">
                            🥇
                          </span>
                        ) : isTop2 ? (
                          <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-black text-xs inline-flex items-center justify-center">
                            🥈
                          </span>
                        ) : isTop3 ? (
                          <span className="w-7 h-7 rounded-full bg-amber-700/20 text-amber-800 font-black text-xs inline-flex items-center justify-center">
                            🥉
                          </span>
                        ) : (
                          <span className="font-mono text-gray-400 font-semibold">
                            #{index + 1}
                          </span>
                        )}
                      </td>

                      {/* Customer info */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors">
                            {c.name ? c.name.charAt(0).toUpperCase() : 'K'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                                {c.name}
                              </span>
                              {c.is_vip && (
                                <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 font-bold text-[9px] flex items-center gap-0.5 border border-amber-300">
                                  <Sparkles className="w-2.5 h-2.5 text-amber-600 fill-amber-600" />
                                  VIP
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5" onClick={(e) => e.stopPropagation()}>
                              <span className="font-mono text-brand-600 font-bold text-[11px]">
                                {c.phone}
                              </span>
                              <a
                                href={`tel:${cleanPhone}`}
                                className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50"
                                title="Gọi"
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
                        </div>
                      </td>

                      {/* Rental count */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold font-mono text-xs border border-emerald-200">
                          👗 {c.total_rent_count} lần
                        </span>
                      </td>

                      {/* Total spent */}
                      <td className="py-3.5 px-3 text-right">
                        <span className="font-bold text-gray-900 font-mono text-xs">
                          {formatVND(c.total_spent)}
                        </span>
                      </td>

                      {/* Payment status / Debt */}
                      <td className="py-3.5 px-3 text-center">
                        {c.debt > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-bold text-[10px]">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Nợ {formatVND(c.debt)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Đã thu đủ
                          </span>
                        )}
                      </td>

                      {/* Last order info */}
                      <td className="py-3.5 px-3">
                        <div className="text-gray-600 text-[11px] whitespace-nowrap">
                          {c.last_order_date ? formatDateVN(c.last_order_date) : 'Chưa có'}
                        </div>
                        {c.recent_dresses && c.recent_dresses.length > 0 && (
                          <div className="text-[10px] text-gray-400 truncate max-w-[180px]">
                            {c.recent_dresses[0]}
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-3 text-center" onClick={(e) => { e.stopPropagation(); setSelectedCustomer(c); }}>
                        <button
                          className="px-2.5 py-1 rounded-xl bg-brand-50 group-hover:bg-brand-600 text-brand-700 group-hover:text-white font-bold text-[11px] transition-all flex items-center gap-1 mx-auto"
                          title="Xem lịch sử thuê đồ"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>Lịch sử</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 text-xs">
            Không tìm thấy khách hàng nào khớp với từ khóa tìm kiếm.
          </div>
        )}
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
