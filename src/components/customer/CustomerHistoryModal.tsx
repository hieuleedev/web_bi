import React from 'react';
import { 
  X, 
  Phone, 
  ShoppingBag, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Printer, 
  Eye, 
  Award
} from 'lucide-react';
import { Order } from '../../types';
import { formatVND, formatDateVN } from '../../utils/helpers';
import { PrintReceiptButton } from '../order/PrintReceiptButton';

export interface CustomerSummary {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  total_rent_count: number;
  total_orders_count: number;
  total_spent: number;
  paid_amount: number;
  debt: number;
  last_order_date?: string;
  is_vip?: boolean;
  notes?: string;
  recent_dresses?: string[];
}

interface CustomerHistoryModalProps {
  customer: CustomerSummary | null;
  orders: Order[];
  isOpen: boolean;
  onClose: () => void;
  onViewOrderDetail?: (order: Order) => void;
  onViewInvoice?: (order: Order) => void;
}

export const CustomerHistoryModal: React.FC<CustomerHistoryModalProps> = ({
  customer,
  orders,
  isOpen,
  onClose,
  onViewOrderDetail,
  onViewInvoice
}) => {
  if (!isOpen || !customer) return null;

  // Lọc tất cả đơn hàng của khách theo số điện thoại
  const customerOrders = orders.filter(
    (o) => (o.customerPhone || '').replace(/\s+/g, '') === customer.phone.replace(/\s+/g, '')
  ).sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());

  const cleanPhone = customer.phone.replace(/\s+/g, '');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-5 sm:p-7 z-10 border border-gray-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-brand-500 to-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
              {customer.name ? customer.name.charAt(0).toUpperCase() : 'K'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-xl text-gray-900">{customer.name}</h3>
                {customer.is_vip && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] flex items-center gap-1 border border-amber-300">
                    <Award className="w-3 h-3 text-amber-600 fill-amber-600" />
                    Khách VIP
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-0.5">
                <span className="font-mono font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                  📞 {customer.phone}
                </span>
                {customer.address && (
                  <span className="text-gray-600 truncate max-w-[280px]">📍 {customer.address}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href={`tel:${cleanPhone}`}
              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
              title="Gọi điện"
            >
              <Phone className="w-4 h-4" />
            </a>
            <a
              href={`https://zalo.me/${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
              title="Nhắn Zalo"
            >
              Zalo
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4 Summary Stats Cards for this customer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-4 shrink-0 border-b border-gray-100">
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <span className="text-[10px] text-gray-500 block">Số lần thuê váy</span>
            <span className="font-bold text-base text-gray-900 font-mono">
              {customer.total_rent_count || customerOrders.length} lần
            </span>
          </div>

          <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
            <span className="text-[10px] text-emerald-700 block">Tổng chi tiêu</span>
            <span className="font-bold text-base text-emerald-900 font-mono">
              {formatVND(customer.total_spent)}
            </span>
          </div>

          <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-100">
            <span className="text-[10px] text-blue-700 block">Đã thanh toán</span>
            <span className="font-bold text-base text-blue-900 font-mono">
              {formatVND(customer.paid_amount || 0)}
            </span>
          </div>

          <div className={`p-3 rounded-2xl border ${customer.debt > 0 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
            <span className={`text-[10px] block ${customer.debt > 0 ? 'text-amber-800 font-bold' : 'text-gray-500'}`}>
              Công nợ chưa thu
            </span>
            <span className={`font-bold text-base font-mono ${customer.debt > 0 ? 'text-amber-700' : 'text-gray-700'}`}>
              {formatVND(customer.debt || 0)}
            </span>
          </div>
        </div>

        {/* Orders Timeline & Rental History */}
        <div className="flex-1 overflow-y-auto pt-4 space-y-4 pr-1">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-sm text-gray-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-600" />
              <span>Lịch Sử Các Lần Thuê Đồ ({customerOrders.length} đơn)</span>
            </h4>
            <span className="text-[11px] text-gray-400">Xếp theo mới nhất</span>
          </div>

          {customerOrders.length > 0 ? (
            <div className="space-y-3">
              {customerOrders.map((ord) => {
                const rentItem = ord.items.find((i) => i.mode === 'rent');
                const isPaid = ord.paymentStatus === 'paid';

                return (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl border border-gray-100 bg-white hover:border-brand-200 transition-all shadow-2xs space-y-3"
                  >
                    {/* Top row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-brand-700 text-xs bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-200">
                          {ord.code}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {formatDateVN(ord.createdAt || '')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Trạng thái thanh toán */}
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isPaid ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3" />}
                          <span>{isPaid ? 'Đã thanh toán' : 'Chưa thu tiền'}</span>
                        </span>

                        {/* Trạng thái đơn */}
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                          {ord.status === 'completed'
                            ? 'Hoàn thành'
                            : ord.status === 'rented'
                            ? 'Đang thuê'
                            : ord.status === 'returned'
                            ? 'Đã trả đồ'
                            : ord.status}
                        </span>
                      </div>
                    </div>

                    {/* Items row */}
                    <div className="space-y-2">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <img
                            src={it.productImage || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=200&q=80'}
                            alt={it.productTitle}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">{it.productTitle}</p>
                            <p className="text-[11px] text-gray-500">
                              {it.mode === 'rent' ? (
                                <span className="text-emerald-700 font-medium">
                                  👗 Thuê: {it.rentalStartDate ? formatDateVN(it.rentalStartDate) : ''} ➔ {it.rentalEndDate ? formatDateVN(it.rentalEndDate) : ''} ({it.rentalDays || 1} ngày)
                                </span>
                              ) : (
                                <span>Mua đứt</span>
                              )}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-gray-800 font-mono">
                            {formatVND(it.price * (it.quantity || 1))}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Total & Action buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100/60 text-xs">
                      <div>
                        <span className="text-gray-400 text-[11px]">Tổng hóa đơn: </span>
                        <span className="font-bold text-sm text-brand-600 font-mono">
                          {formatVND(ord.totalAmount)}
                        </span>
                        {ord.depositTotal > 0 && (
                          <span className="text-[11px] text-amber-700 ml-2">
                            (Cọc: {formatVND(ord.depositTotal)})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 ml-auto">
                        {onViewOrderDetail && (
                          <button
                            onClick={() => {
                              onClose();
                              onViewOrderDetail(ord);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-[11px] flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>Chi tiết</span>
                          </button>
                        )}

                        <PrintReceiptButton order={ord} size="sm" />

                        {onViewInvoice && (
                          <button
                            onClick={() => {
                              onClose();
                              onViewInvoice(ord);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-[11px] flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3 text-indigo-600" />
                            <span>Xem bill</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 text-xs">
              Chưa có dữ liệu đơn thuê nào cho khách hàng này.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 mt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
