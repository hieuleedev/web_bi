import React from 'react';
import { ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { formatVND } from '../../utils/helpers';

interface CartSummaryCardProps {
  subtotal: number;
  depositTotal: number;
  shippingTotal: number;
  grandTotal: number;
  onProceedCheckout: () => void;
}

export const CartSummaryCard: React.FC<CartSummaryCardProps> = ({
  subtotal,
  depositTotal,
  shippingTotal,
  grandTotal,
  onProceedCheckout,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 sticky top-24">
      <h3 className="font-serif font-bold text-base text-gray-900 pb-3 border-b border-gray-100">
        Tóm Tắt Chi Phí Đơn Hàng
      </h3>

      <div className="space-y-2.5 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Tiền hàng & tiền thuê:</span>
          <span className="font-semibold text-gray-900">{formatVND(subtotal)}</span>
        </div>

        {depositTotal > 0 && (
          <div className="flex justify-between text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60">
            <div>
              <span className="font-semibold block">Tiền cọc giữ đồ:</span>
              <span className="text-[10px] text-amber-600">* Hoàn 100% khi trả đồ</span>
            </div>
            <span className="font-bold">{formatVND(depositTotal)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Phí vận chuyển dự kiến:</span>
          <span className="font-semibold text-gray-900">{formatVND(shippingTotal)}</span>
        </div>

        <div className="flex justify-between text-emerald-600">
          <span>Khử khuẩn UV & giặt hấp:</span>
          <span className="font-semibold">Miễn phí</span>
        </div>

        <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline text-sm font-bold text-gray-900">
          <span>Tổng thanh toán:</span>
          <span className="text-xl font-bold text-brand-600 font-serif">
            {formatVND(grandTotal)}
          </span>
        </div>
      </div>

      <button
        onClick={onProceedCheckout}
        className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
      >
        <span>Tiến Hành Đặt Hàng & Thanh Toán</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="pt-2 text-[11px] text-gray-500 space-y-1.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Hoàn cọc nhanh chóng qua số tài khoản sau 24h</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-brand-600 shrink-0" />
          <span>Hỗ trợ kiểm tra hàng trước khi thanh toán COD</span>
        </div>
      </div>
    </div>
  );
};
