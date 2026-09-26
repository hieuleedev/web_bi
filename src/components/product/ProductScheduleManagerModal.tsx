import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  User,
  Sparkles
} from 'lucide-react';
import { Product, RentalBookingDate } from '../../types';
import { formatDateVN, formatVND, calculateRentalDays, checkRentalOverlap } from '../../utils/helpers';
import { useProducts } from '../../context/ProductContext';
import { useToast } from '../../context/ToastContext';

interface ProductScheduleManagerModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductScheduleManagerModal: React.FC<ProductScheduleManagerModalProps> = ({
  product,
  onClose,
}) => {
  const { addRentalBookingToProduct, removeRentalBookingFromProduct } = useProducts();
  const { showToast } = useToast();

  // Manual block form state
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [newStartDate, setNewStartDate] = useState(tomorrowStr);
  const [newEndDate, setNewEndDate] = useState(tomorrowStr);
  const [blockReason, setBlockReason] = useState('Bảo trì & giặt hấp khử khuẩn');
  const [isAddingBlock, setIsAddingBlock] = useState(false);

  // Month navigation (current year & month)
  const [viewDate, setViewDate] = useState(new Date());

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth(); // 0-indexed

  // Days in current month
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const monthName = useMemo(() => {
    return `Tháng ${currentMonth + 1} / ${currentYear}`;
  }, [currentMonth, currentYear]);

  // Check if a specific date (YYYY-MM-DD) is booked
  const getBookingForDay = (dayNum: number): RentalBookingDate | undefined => {
    const dayStr = String(dayNum).padStart(2, '0');
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const targetDateStr = `${currentYear}-${monthStr}-${dayStr}`;
    const targetTime = new Date(targetDateStr).getTime();

    return (product.bookedDates || []).find((b) => {
      if (b.status === 'cancelled' || b.status === 'completed' || b.status === 'returned') return false;
      const startTime = new Date(b.startDate).getTime();
      const endTime = new Date(b.endDate).getTime();
      return targetTime >= startTime && targetTime <= endTime;
    });
  };

  const handleAddManualBlock = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newStartDate || !newEndDate) {
      showToast('Vui lòng chọn ngày bắt đầu và kết thúc!', 'error');
      return;
    }

    if (new Date(newStartDate) > new Date(newEndDate)) {
      showToast('Ngày bắt đầu không được lớn hơn ngày kết thúc!', 'error');
      return;
    }

    // Check overlap
    const { hasConflict, conflictingBooking } = checkRentalOverlap(
      newStartDate,
      newEndDate,
      product.bookedDates
    );

    if (hasConflict) {
      showToast(
        `Khoảng ngày này đã có lịch (${conflictingBooking?.startDate} → ${conflictingBooking?.endDate})!`,
        'error'
      );
      return;
    }

    const newBooking: RentalBookingDate = {
      id: `block-${Date.now()}`,
      startDate: newStartDate,
      endDate: newEndDate,
      renterName: `[Khóa lịch] ${blockReason}`,
      status: 'confirmed',
    };

    try {
      await addRentalBookingToProduct(product.id, newBooking);
      showToast(`Đã khóa lịch cho "${product.title}" từ ${formatDateVN(newStartDate)} đến ${formatDateVN(newEndDate)} (Đã lưu Database)!`, 'success');
      setIsAddingBlock(false);
    } catch (err: any) {
      showToast(`Lỗi khóa lịch: ${err.message || 'Không thể lưu vào Database'}`, 'error');
    }
  };

  const handleRemoveBooking = async (bookingId: string, renterName?: string) => {
    try {
      await removeRentalBookingFromProduct(product.id, bookingId);
      showToast(`Đã mở lại lịch (${renterName || 'Lịch đã chọn'})!`, 'info');
    } catch (err: any) {
      showToast(`Lỗi mở lại lịch: ${err.message || 'Không thể xóa trên Database'}`, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-brand-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-gray-900">
                  Quản Lý Lịch Thuê Từng Sản Phẩm
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Real-time
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Xem ngày khách đặt, khóa ngày bảo trì hoặc mở lại lịch hẹn
              </p>
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
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Product Quick Info Card */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center gap-4">
            <img
              src={product.featuredImage}
              alt={product.title}
              className="w-16 h-20 rounded-xl object-cover shrink-0 shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-100 text-brand-700 px-2 py-0.5 rounded">
                  {product.brand}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-emerald-700 font-bold">
                  {formatVND(product.rentPrice1Day)} /ngày
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-amber-600 font-medium">
                  Cọc: {formatVND(product.deposit)}
                </span>
              </div>
              <h4 className="font-semibold text-xs text-gray-900 line-clamp-1">{product.title}</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Tổng cộng có <strong>{(product.bookedDates || []).length}</strong> khoảng lịch đã ghi nhận
              </p>
            </div>
          </div>

          {/* Interactive Month Grid View */}
          <div className="p-5 rounded-2xl border border-gray-200 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" />
                <h4 className="font-bold text-xs text-gray-900">
                  Lịch Thuê Trong {monthName}
                </h4>
              </div>

              {/* Month navigation buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  ← Tháng trước
                </button>
                <button
                  type="button"
                  onClick={() => setViewDate(new Date())}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700"
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  Tháng sau →
                </button>
              </div>
            </div>

            {/* Visual Days Grid */}
            <div className="grid grid-cols-7 gap-2 pt-1 text-center">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
                <span key={d} className="text-[11px] font-bold text-gray-400 py-1">
                  {d}
                </span>
              ))}

              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const booking = getBookingForDay(day);

                return (
                  <div
                    key={day}
                    className={`relative p-2 rounded-xl text-xs font-mono font-semibold border transition-all flex flex-col items-center justify-center min-h-[46px] ${
                      booking
                        ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm'
                        : 'bg-emerald-50/40 border-emerald-100 text-gray-800 hover:bg-emerald-50'
                    }`}
                    title={booking ? `Đã có lịch: ${booking.renterName} (${formatDateVN(booking.startDate)} → ${formatDateVN(booking.endDate)})` : `Ngày ${day} còn trống sẵn sàng cho thuê`}
                  >
                    <span>{day}</span>
                    {booking ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 opacity-40" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px]">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-gray-600 font-medium">Đã có khách thuê / Khóa lịch</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-gray-600 font-medium">Ngày trống</span>
                </div>
              </div>
            </div>
          </div>

          {/* List of Bookings for this Product */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-brand-600" />
                <span>Danh Sách Các Khoảng Ngày Đã Khóa / Đã Đặt ({(product.bookedDates || []).length})</span>
              </h4>

              <button
                onClick={() => setIsAddingBlock(!isAddingBlock)}
                className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1 bg-brand-50 px-3 py-1 rounded-xl border border-brand-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingBlock ? 'Đóng Form' : '+ Khóa Lịch Mới'}</span>
              </button>
            </div>

            {/* Manual block form toggle */}
            {isAddingBlock && (
              <form onSubmit={handleAddManualBlock} className="p-4 bg-brand-50/60 rounded-2xl border border-brand-200 space-y-3 animate-in fade-in duration-150">
                <div className="font-semibold text-xs text-brand-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  <span>Khóa ngày sử dụng cho sản phẩm này</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1 font-medium">Từ ngày</label>
                    <input
                      type="date"
                      required
                      value={newStartDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-full bg-white border border-brand-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1 font-medium">Đến ngày</label>
                    <input
                      type="date"
                      required
                      value={newEndDate}
                      min={newStartDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className="w-full bg-white border border-brand-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-600 mb-1 font-medium">Lý do khóa lịch</label>
                  <input
                    type="text"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Ví dụ: Giặt hấp khử khuẩn, chụp Lookbook..."
                    className="w-full bg-white border border-brand-200 rounded-xl px-3 py-2 text-xs text-gray-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingBlock(false)}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-600"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20"
                  >
                    Xác Nhận Khóa Lịch
                  </button>
                </div>
              </form>
            )}

            {/* List */}
            {product.bookedDates && product.bookedDates.length > 0 ? (
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-white">
                {product.bookedDates.map((b) => {
                  const isCompleted = b.status === 'completed' || b.status === 'returned';
                  return (
                    <div
                      key={b.id}
                      className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                        isCompleted ? 'bg-emerald-50/40 opacity-80' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-gray-900 block">
                              {b.renterName || 'Khách đặt qua web'}
                            </span>
                            {isCompleted && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Đã trả đồ - Đã mở lịch
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-500 font-mono">
                            {formatDateVN(b.startDate)} → {formatDateVN(b.endDate)} ({calculateRentalDays(b.startDate, b.endDate)} ngày)
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveBooking(b.id, b.renterName)}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Xóa bản ghi lịch này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hủy khóa</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                Sản phẩm này hiện đang hoàn toàn trống lịch cả tháng!
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-colors"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </div>
  );
};
