import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, DollarSign, Calendar, FileText, Check, Printer } from 'lucide-react';
import { Order, OrderStatus, OrderItem } from '../../types';
import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext';
import { useToast } from '../../context/ToastContext';
import { formatVND, formatDateVN, calculateRentalDays, checkRentalOverlap } from '../../utils/helpers';

interface EditOrderModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onSaved?: (updatedOrder: Order) => void;
  onPrintBill?: (order: Order) => void;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  isOpen,
  order,
  onClose,
  onSaved,
  onPrintBill,
}) => {
  const { updateOrder } = useOrders();
  const { products, refreshProducts } = useProducts();
  const { showToast } = useToast();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [paymentStatus, setPaymentStatus] = useState<'unpaid' | 'paid'>('unpaid');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cod' | 'momo' | 'vnpay' | 'split'>('bank_transfer');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'shipping'>('pickup');
  
  // Amounts
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [depositTotal, setDepositTotal] = useState<number>(0);

  // Editable items
  const [items, setItems] = useState<OrderItem[]>([]);

  // Rental Dates (if any item is rental)
  const firstRentalItem = order?.items.find((i) => i.mode === 'rent');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (order) {
      setCustomerName(order.customerName || '');
      setCustomerPhone(order.customerPhone || '');
      setShippingAddress(order.shippingAddress || '');
      setNotes(order.notes || '');
      setStatus(order.status || 'pending');
      setPaymentStatus(order.paymentStatus || 'unpaid');
      setPaymentMethod(order.paymentMethod || 'bank_transfer');
      setDeliveryMethod(order.deliveryMethod || 'pickup');
      setTotalAmount(order.totalAmount || 0);
      setDepositTotal(order.depositTotal || 0);
      setItems(order.items ? JSON.parse(JSON.stringify(order.items)) : []);

      const rentItem = order.items.find((i) => i.mode === 'rent');
      if (rentItem) {
        setStartDate(rentItem.rentalStartDate || '');
        setEndDate(rentItem.rentalEndDate || '');
      } else {
        setStartDate('');
        setEndDate('');
      }
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleItemSizeChange = (index: number, newSize: string) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, size: newSize } : item))
    );
  };

  const handleItemColorChange = (index: number, newColor: string) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, color: newColor } : item))
    );
  };

  const handleSave = async (printAfterSave = false) => {
    if (!customerName.trim()) {
      showToast('Vui lòng nhập tên khách hàng!', 'error');
      return;
    }
    if (!customerPhone.trim()) {
      showToast('Vui lòng nhập số điện thoại khách!', 'error');
      return;
    }

    // Update item rental dates and keep any modified sizes
    const updatedItems = items.map((item) => {
      if (item.mode === 'rent' && startDate && endDate) {
        const days = calculateRentalDays(startDate, endDate);
        return {
          ...item,
          rentalStartDate: startDate,
          rentalEndDate: endDate,
          rentalDays: days,
        };
      }
      return item;
    });

    const updatedData: Partial<Order> = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      shippingAddress: shippingAddress.trim(),
      notes: notes.trim(),
      status,
      paymentStatus,
      paymentMethod,
      deliveryMethod,
      totalAmount: Number(totalAmount) || 0,
      depositTotal: Number(depositTotal) || 0,
      items: updatedItems,
    };

    await updateOrder(order.id, updatedData);
    if (refreshProducts) {
      await refreshProducts();
    }

    const completeUpdatedOrder: Order = {
      ...order,
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };

    if (onSaved) {
      onSaved(completeUpdatedOrder);
    }

    if (printAfterSave && onPrintBill) {
      onClose();
      onPrintBill(completeUpdatedOrder);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-brand-50 via-white to-brand-50/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-gray-900">
                Chỉnh Sửa Đơn Hàng
              </h3>
              <p className="text-xs text-brand-700 font-mono font-bold">
                {order.code} • Tạo ngày: {formatDateVN(order.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Products Summary */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-700 uppercase tracking-wider text-[11px]">
                Sản phẩm trong đơn ({items.length})
              </span>
              <span className="text-[11px] font-semibold text-brand-600">
                {items.some((i) => i.mode === 'rent') ? 'Đơn thuê đồ' : 'Đơn bán đứt'}
              </span>
            </div>
            {items.map((it, idx) => {
              const product = products.find((p) => p.id === it.productId);
              const defaultSizes = ['S', 'M', 'L', 'XL', 'FreeSize'];
              const baseSizes = product?.sizes && product.sizes.length > 0 ? product.sizes : defaultSizes;
              const availableSizes = Array.from(new Set([...baseSizes, it.size].filter(Boolean)));
              const availableColors = product?.colors && product.colors.length > 0
                ? Array.from(new Set([...product.colors, it.color].filter(Boolean)))
                : (it.color ? [it.color] : []);

              return (
                <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-200/80 shadow-xs">
                  <img
                    src={it.productImage}
                    alt={it.productTitle}
                    style={{ width: '60px', height: '76px', minWidth: '60px', maxWidth: '60px' }}
                    className="object-cover rounded-xl shrink-0 border border-gray-100 shadow-2xs"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-xs truncate">{it.productTitle}</p>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        it.mode === 'rent' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {it.mode === 'rent' ? 'Thuê đồ' : 'Bán đứt'}
                      </span>

                      {/* Chọn Size */}
                      <div className="flex items-center gap-1.5 bg-amber-50/90 border border-amber-200/90 px-2 py-0.5 rounded-lg shadow-2xs">
                        <label className="text-[10px] font-bold text-amber-900">Size:</label>
                        <select
                          value={it.size || ''}
                          onChange={(e) => handleItemSizeChange(idx, e.target.value)}
                          className="bg-transparent text-amber-950 font-black text-xs focus:outline-none cursor-pointer pr-0.5"
                        >
                          {availableSizes.map((s) => {
                            const sConflict = (it.mode === 'rent' && startDate && endDate && product?.bookedDates)
                              ? checkRentalOverlap(
                                  startDate,
                                  endDate,
                                  product.bookedDates.filter((b) => b.orderId !== order.id),
                                  undefined,
                                  s
                                )
                              : { hasConflict: false };

                            return (
                              <option key={s} value={s}>
                                Size {s} {sConflict.hasConflict ? '⚠️ (Đã có khách)' : '✓ (Trống)'}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* Chọn Màu */}
                      {availableColors.length > 1 ? (
                        <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-lg">
                          <label className="text-[10px] font-bold text-gray-700">Màu:</label>
                          <select
                            value={it.color || ''}
                            onChange={(e) => handleItemColorChange(idx, e.target.value)}
                            className="bg-transparent text-gray-800 text-xs font-semibold focus:outline-none cursor-pointer pr-0.5"
                          >
                            {availableColors.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : it.color ? (
                        <span className="text-gray-500 text-[11px]">Màu: {it.color}</span>
                      ) : null}
                    </div>

                    {it.mode === 'rent' && it.rentalStartDate && it.rentalEndDate && (
                      <div className="mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                          <Calendar className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{formatDateVN(it.rentalStartDate)} → {formatDateVN(it.rentalEndDate)}</span>
                          <span className="text-emerald-600 font-medium">({calculateRentalDays(it.rentalStartDate, it.rentalEndDate)} ngày)</span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-right border-l pl-3 border-gray-100 flex flex-col justify-center items-end shrink-0 min-w-[70px]">
                    <span className="font-bold text-gray-900 block text-xs">{formatVND(it.price)}</span>
                    {it.deposit ? <span className="text-[10px] text-gray-500">Cọc: {formatVND(it.deposit)}</span> : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Customer Information */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5 border-b pb-1.5">
              <User className="w-4 h-4 text-brand-600" />
              <span>Thông Tin Khách Hàng</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Họ và tên khách *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500"
                  placeholder="Ví dụ: Nguyễn Thị Mai"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Số điện thoại khách *</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500"
                  placeholder="0795xxxxxx"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Địa chỉ nhận đồ / Giao hàng</label>
              <input
                type="text"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500"
                placeholder="Địa chỉ nhận hàng hoặc ghi: Thử tại tiệm Núi Thành"
              />
            </div>
          </div>

          {/* Rental Dates (if rental order) */}
          {firstRentalItem && (
            <div className="space-y-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
              <h4 className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Thời Gian Cho Thuê</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Ngày nhận váy</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Ngày trả váy</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Financials & Status */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5 border-b pb-1.5">
              <DollarSign className="w-4 h-4 text-brand-600" />
              <span>Tiền Hàng & Trạng Thái</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tổng tiền thuê / Tiền bán (₫)</label>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-700 focus:bg-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tiền cọc giữ đồ (₫)</label>
                <input
                  type="number"
                  value={depositTotal}
                  onChange={(e) => setDepositTotal(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-amber-700 focus:bg-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Trạng thái đơn hàng</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-brand-500"
                >
                  <option value="pending">Chờ xác nhận</option>
                  <option value="preparing">Đang chuẩn bị đồ</option>
                  <option value="shipping">Đang giao hàng</option>
                  <option value="rented">🟢 Đang trong thời gian thuê</option>
                  <option value="returned">📦 Đã nhận lại đồ (Chờ hoàn cọc)</option>
                  <option value="completed">✅ Hoàn thành (Đã hoàn cọc)</option>
                  <option value="cancelled">❌ Đã hủy đơn</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Trạng thái thanh toán</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as 'unpaid' | 'paid')}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-brand-500"
                >
                  <option value="unpaid">Chưa thanh toán</option>
                  <option value="paid">Đã thanh toán đủ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Ghi chú đơn hàng (size, yêu cầu riêng...)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500"
                placeholder="Ghi chú thêm cho đơn hàng này..."
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-600">
            Tổng thu (gồm cọc): <strong className="text-brand-700 font-bold text-sm">{formatVND(Number(totalAmount) + Number(depositTotal))}</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition-colors"
            >
              Đóng
            </button>

            {onPrintBill && (
              <button
                onClick={() => handleSave(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Lưu & In Lại Bill</span>
              </button>
            )}

            <button
              onClick={() => handleSave(false)}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-brand-500/20"
            >
              <Check className="w-4 h-4" />
              <span>Lưu Cập Nhật</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
