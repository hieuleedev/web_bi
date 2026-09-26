import React from 'react';
import { X, Printer, Phone, Eye, Calendar, MapPin, User, ShieldCheck, FileText, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Order } from '../../types';
import { formatVND, formatDateVN } from '../../utils/helpers';
import { PrintReceiptButton } from './PrintReceiptButton';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenInvoiceModal?: (order: Order) => void;
  onStatusChange?: (orderId: string, status: any) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onOpenInvoiceModal,
  onStatusChange,
}) => {
  if (!isOpen || !order) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'rented':
        return { label: 'Đang cho thuê', color: 'bg-brand-50 text-brand-700 border-brand-200' };
      case 'returned':
        return { label: 'Đã nhận lại đồ', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'completed':
        return { label: 'Hoàn tất đơn', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'pending':
        return { label: 'Chờ xác nhận', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'cancelled':
        return { label: 'Đã hủy', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { label: status, color: 'bg-gray-50 text-gray-700 border-gray-200' };
    }
  };

  const statusInfo = getStatusBadge(order.status);
  const rentItem = order.items.find((i) => i.mode === 'rent' && i.rentalStartDate && i.rentalEndDate);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-5 sm:p-7 z-10 border border-gray-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-base">Đơn hàng {order.code}</h3>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Tạo lúc: {new Date(order.createdAt).toLocaleDateString('vi-VN')} {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs">
          {/* Thông tin khách hàng */}
          <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 space-y-2">
            <h4 className="font-bold text-gray-800 text-[13px] flex items-center gap-1.5 pb-1 border-b border-gray-200/60">
              <User className="w-4 h-4 text-brand-600" />
              <span>Thông tin khách hàng</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <p><strong>Họ tên:</strong> <span className="text-gray-900 font-semibold">{order.customerName}</span></p>
              <p>
                <strong>Số điện thoại:</strong>{' '}
                <a href={`tel:${order.customerPhone}`} className="text-emerald-700 font-bold hover:underline">
                  {order.customerPhone}
                </a>
              </p>
              <p className="sm:col-span-2">
                <strong>Địa chỉ:</strong> <span className="text-gray-700">{order.shippingAddress || 'Khách nhận tại shop'}</span>
              </p>
              <p>
                <strong>Hình thức nhận:</strong>{' '}
                <span className="font-medium text-gray-800">
                  {order.deliveryMethod === 'pickup' ? 'Lấy tại tiệm' : 'Giao tận nơi'}
                </span>
              </p>
              {order.notes && (
                <p className="sm:col-span-2 text-gray-600 bg-white p-2 rounded-xl border border-gray-100 italic">
                  <strong>Ghi chú đơn:</strong> {order.notes}
                </p>
              )}
            </div>
          </div>

          {/* Danh sách váy / sản phẩm */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 space-y-3">
            <h4 className="font-bold text-gray-800 text-[13px] flex items-center justify-between pb-1 border-b border-gray-100">
              <span>Sản phẩm trong đơn ({order.items.length})</span>
              <span className="text-gray-400 font-normal text-[11px]">Khổ thuê & phụ phí</span>
            </h4>

            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-3 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                  {item.productImage && (
                    <img
                      src={item.productImage}
                      alt={item.productTitle}
                      className="w-16 h-20 rounded-xl object-cover border border-gray-100 shrink-0"
                    />
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <h5 className="font-bold text-gray-900 text-xs">{item.productTitle}</h5>
                      <span className="font-bold text-brand-700 text-sm">{formatVND(item.price * item.quantity)}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[11px] text-gray-600">
                      <span className="px-2 py-0.5 bg-gray-100 rounded-md font-semibold">
                        {item.mode === 'rent' ? 'Thuê đồ' : 'Mua đồ'}
                      </span>
                      {item.size && <span className="px-2 py-0.5 bg-gray-100 rounded-md">Size: {item.size}</span>}
                      {item.color && <span className="px-2 py-0.5 bg-gray-100 rounded-md">Màu: {item.color}</span>}
                      <span className="px-2 py-0.5 bg-gray-100 rounded-md">SL: {item.quantity}</span>
                    </div>

                    {item.mode === 'rent' && item.rentalStartDate && item.rentalEndDate && (
                      <div className="mt-1.5 p-2 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-100 space-y-0.5 text-[11px]">
                        <div className="font-semibold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            {formatDateVN(item.rentalStartDate)} ➔ {formatDateVN(item.rentalEndDate)} ({item.rentalDays || 1} ngày)
                          </span>
                        </div>
                        {item.extraDays && item.extraDays > 0 ? (
                          <div className="text-rose-700 font-medium">
                            + Phụ thu thêm {item.extraDays} ngày: {formatVND(item.extraDayFee || 0)}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chi tiết thanh toán & cọc */}
          <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 space-y-2">
            <h4 className="font-bold text-gray-800 text-[13px] pb-1 border-b border-gray-200/60 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Thanh toán & Đặt cọc</span>
            </h4>
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Tiền thuê sản phẩm:</span>
                <span className="font-semibold text-gray-900">{formatVND(order.subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span>Tiền cọc giữ đồ:</span>
                <span className={order.depositTotal > 0 ? 'font-bold text-amber-700' : 'text-gray-500'}>
                  {order.depositMethod === 'id_card'
                    ? 'Giữ CCCD / Bằng lái xe gốc'
                    : order.depositTotal > 0
                    ? formatVND(order.depositTotal)
                    : '0 đ (Miễn cọc)'}
                </span>
              </div>

              {order.shippingFee > 0 && (
                <div className="flex justify-between">
                  <span>Phí giao hàng:</span>
                  <span className="font-semibold text-gray-900">+{formatVND(order.shippingFee)}</span>
                </div>
              )}

              {Boolean(order.cashAmount || order.transferAmount) && (
                <div className="flex justify-between pt-1 border-t border-gray-200/60 text-[11px] text-gray-500">
                  <span>Phương thức:</span>
                  <span>
                    {order.cashAmount ? `Tiền mặt: ${formatVND(order.cashAmount)} ` : ''}
                    {order.transferAmount ? `| Chuyển khoản: ${formatVND(order.transferAmount)}` : ''}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-2 border-t-2 border-dashed border-gray-300 text-sm">
                <span className="font-bold text-gray-900">TỔNG CỘNG:</span>
                <span className="font-black text-brand-700 text-base font-mono">{formatVND(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-gray-100 shrink-0 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Nút in nhanh trực tiếp qua API */}
            <PrintReceiptButton order={order} size="md" />

            {/* Nút xem hóa đơn POS nhiệt 80mm */}
            {onOpenInvoiceModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenInvoiceModal(order);
                }}
                className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Mở xem hóa đơn POS nhiệt 80mm"
              >
                <Eye className="w-4 h-4" />
                <span>Xem Hóa Đơn (80mm)</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${order.customerPhone}`}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Gọi khách</span>
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
