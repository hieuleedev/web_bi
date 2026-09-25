import React, { useState, useMemo } from 'react';
import { X, Calendar as CalendarIcon, AlertCircle, CheckCircle2, ShieldAlert, Sparkles, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { formatVND, calculateRentalDays, calculateRentalPrice, checkRentalOverlap, formatDateVN } from '../../utils/helpers';
import { useCart } from '../../context/CartContext';

interface RentalCalendarModalProps {
  product: Product;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RentalCalendarModal: React.FC<RentalCalendarModalProps> = ({
  product,
  onClose,
  onSuccess,
}) => {
  const { addToCart } = useCart();

  // Tomorrow as default min start date
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const defaultEndStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  }, []);

  const [startDate, setStartDate] = useState(tomorrowStr);
  const [endDate, setEndDate] = useState(defaultEndStr);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || 'Mặc định');

  // Check overlap with existing product bookings
  const overlapCheck = useMemo(() => {
    if (!startDate || !endDate) return { hasConflict: false };
    return checkRentalOverlap(startDate, endDate, product.bookedDates);
  }, [startDate, endDate, product.bookedDates]);

  // Calculations
  const days = useMemo(() => {
    return calculateRentalDays(startDate, endDate);
  }, [startDate, endDate]);

  const rentalFee = useMemo(() => {
    return calculateRentalPrice(product, days);
  }, [product, days]);

  const deposit = product.deposit || 0;
  const grandTotal = rentalFee + deposit;

  const handleAddToCart = () => {
    if (overlapCheck.hasConflict) return;

    const ok = addToCart({
      product,
      mode: 'rent',
      selectedSize,
      selectedColor,
      rentalStartDate: startDate,
      rentalEndDate: endDate,
    });

    if (ok) {
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-brand-50/50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-gray-900">
                Đặt Lịch Thuê Trang Phục
              </h3>
              <p className="text-xs text-gray-500">Kiểm tra lịch trống tự động & tính phí thuê</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Product quick info */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-50 border border-gray-200/60">
            <img
              src={product.featuredImage}
              alt={product.title}
              className="w-16 h-20 object-cover rounded-xl shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                {product.brand}
              </span>
              <h4 className="font-medium text-xs text-gray-900 line-clamp-2 mt-1">
                {product.title}
              </h4>
              <div className="mt-1 flex items-baseline gap-2 text-xs">
                <span className="font-bold text-emerald-600">
                  {formatVND(product.rentPrice1Day)}/ngày
                </span>
                {(product.rentPrice2Days || product.rentPrice3Days) && (
                  <span className="text-[11px] text-gray-500">
                    {product.rentPrice2Days ? `(2 ngày: ${formatVND(product.rentPrice2Days)} • 3 ngày: ${formatVND(product.rentPrice3Days || 0)})` : `(Gói 3 ngày: ${formatVND(product.rentPrice3Days || 0)})`}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Size & Color Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Chọn Size
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {product.sizes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Chọn Màu Sắc
              </label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {product.colors.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700">
                Chọn Khoảng Thời Gian Thuê
              </label>
              <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                {days} ngày sử dụng
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Ngày nhận đồ (Start)</label>
                <input
                  type="date"
                  value={startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (new Date(e.target.value) >= new Date(endDate)) {
                      const nextDay = new Date(e.target.value);
                      nextDay.setDate(nextDay.getDate() + 1);
                      setEndDate(nextDay.toISOString().split('T')[0]);
                    }
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Ngày trả đồ (End)</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Conflict Alert OR Availability confirmation */}
          {overlapCheck.hasConflict ? (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs">
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Lịch thuê bị trùng lặp!</p>
                <p className="mt-0.5 text-rose-700 leading-relaxed">
                  Sản phẩm đã được khách hàng khác đặt từ ngày{' '}
                  <span className="font-semibold underline">
                    {formatDateVN(overlapCheck.conflictingBooking?.startDate)}
                  </span>{' '}
                  đến{' '}
                  <span className="font-semibold underline">
                    {formatDateVN(overlapCheck.conflictingBooking?.endDate)}
                  </span>
                  . Vui lòng chọn khoảng ngày khác!
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Lịch trống khả dụng từ <strong>{formatDateVN(startDate)}</strong> đến <strong>{formatDateVN(endDate)}</strong> ({days} ngày).
              </span>
            </div>
          )}

          {/* Existing Booked Dates Preview */}
          {product.bookedDates && product.bookedDates.length > 0 && (
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900">
              <p className="font-semibold flex items-center gap-1.5 mb-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Các khoảng thời gian đã có người thuê trước:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {product.bookedDates.map((b) => (
                  <span
                    key={b.id}
                    className="bg-white/80 border border-amber-300 px-2 py-0.5 rounded-md font-mono text-[10px]"
                  >
                    {formatDateVN(b.startDate)} → {formatDateVN(b.endDate)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Breakdown */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Tiền thuê ({days} ngày):</span>
              <span className="font-medium text-gray-900">{formatVND(rentalFee)}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span className="flex items-center gap-1">
                Tiền đặt cọc (hoàn lại 100%):
                <span className="text-[10px] text-brand-600 font-medium">ⓘ</span>
              </span>
              <span className="font-medium text-amber-600">{formatVND(deposit)}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Phí giặt hấp & khử khuẩn:</span>
              <span className="text-emerald-600 font-medium">Miễn phí (Trị giá 150.000₫)</span>
            </div>

            <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline text-sm font-bold text-gray-900">
              <span>Tổng thanh toán ban đầu:</span>
              <span className="text-base text-brand-600 font-bold">{formatVND(grandTotal)}</span>
            </div>

            <p className="text-[10px] text-gray-400 italic pt-1 leading-relaxed">
              * Tiền cọc {formatVND(deposit)} sẽ được hoàn trả tự động vào tài khoản ngân hàng của bạn ngay khi shop nhận lại đồ nguyên vẹn.
            </p>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-5 border-t border-gray-100 bg-white flex gap-3">
          <button
            onClick={onClose}
            className="w-1/3 py-3 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Hủy Bỏ
          </button>
          <button
            onClick={handleAddToCart}
            disabled={overlapCheck.hasConflict}
            className={`flex-1 py-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
              overlapCheck.hasConflict
                ? 'bg-gray-300 cursor-not-allowed shadow-none'
                : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/25 active:scale-[0.99]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Thêm Vào Giỏ Hàng Thuê</span>
          </button>
        </div>
      </div>
    </div>
  );
};
