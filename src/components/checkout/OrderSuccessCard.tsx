import React from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { Order } from '../../types';
import { formatVND } from '../../utils/helpers';

interface OrderSuccessCardProps {
  order: Order;
  onGoToOrderList: () => void;
  onContinueShopping: () => void;
}

export const OrderSuccessCard: React.FC<OrderSuccessCardProps> = ({
  order,
  onGoToOrderList,
  onContinueShopping,
}) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-14">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            Đặt hàng thành công!
          </span>
          <h2 className="font-serif text-2xl lg:text-3xl font-bold text-gray-900 mt-2">
            Cảm Ơn Bạn Đã Mua Sắm Tại Bi Bi
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Mã vận đơn của bạn: <strong className="text-brand-600 font-mono text-sm">{order.code}</strong>
          </p>
        </div>

        {/* Details summary */}
        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 text-left text-xs space-y-2.5">
          <div className="flex justify-between">
            <span className="text-gray-500">Khách hàng:</span>
            <span className="font-semibold text-gray-900">{order.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Số điện thoại:</span>
            <span className="font-semibold text-gray-900 font-mono">{order.customerPhone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Địa chỉ giao:</span>
            <span className="font-semibold text-gray-900 text-right max-w-xs truncate">{order.shippingAddress}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Hình thức thanh toán:</span>
            <span className="font-semibold text-gray-900 uppercase">
              {order.paymentMethod === 'bank_transfer' ? 'Chuyển khoản VietQR' : order.paymentMethod}
            </span>
          </div>
          <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-sm">
            <span>Tổng thanh toán:</span>
            <span className="text-brand-600">{formatVND(order.totalAmount)}</span>
          </div>
        </div>

        {order.depositTotal > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900">
            <h4 className="font-bold flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Chính Sách Hoàn Cọc Tự Động:
            </h4>
            <p className="leading-relaxed">
              Khoản cọc <strong>{formatVND(order.depositTotal)}</strong> sẽ được chuyển khoản trả lại quý khách trong vòng 24 giờ sau khi nhân viên Bi Bi tiếp nhận đồ hoàn trả nguyên vẹn.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onGoToOrderList}
            className="flex-1 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-lg shadow-brand-500/25 transition-all"
          >
            Theo Dõi Tiến Độ Đơn Hàng
          </button>
          <button
            onClick={onContinueShopping}
            className="px-6 py-3.5 rounded-2xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors"
          >
            Tiếp Tục Mua Sắm
          </button>
        </div>
      </div>
    </div>
  );
};
