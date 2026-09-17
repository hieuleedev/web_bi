import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, Printer, QrCode } from 'lucide-react';
import { Order } from '../../types';
import { formatVND } from '../../utils/helpers';
import { generateVietQrUrl, DEFAULT_BANK_CONFIG } from '../../utils/vietqr';
import { OrderInvoiceModal } from '../order/OrderInvoiceModal';

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
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const qrUrl = order.vietqrUrl || generateVietQrUrl({
    amount: order.totalAmount,
    orderCode: order.code,
    bankId: DEFAULT_BANK_CONFIG.bankId,
    accountNo: DEFAULT_BANK_CONFIG.accountNo,
    accountName: DEFAULT_BANK_CONFIG.accountName
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            Đặt hàng thành công!
          </span>
          <h2 className="font-serif text-2xl lg:text-3xl font-bold text-gray-900 mt-2">
            Cảm Ơn Bạn Đã Đặt Đồ Tại Bi Bi
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Mã đơn hàng: <strong className="text-brand-600 font-mono text-sm">{order.code}</strong>
          </p>
        </div>

        {/* Khối VietQR tự động kèm số tiền chính xác khi chọn chuyển khoản */}
        {order.paymentMethod === 'bank_transfer' && (
          <div className="bg-gradient-to-br from-brand-50/60 via-white to-amber-50/50 p-5 rounded-2xl border border-brand-200 text-left">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-brand-100">
              <QrCode className="w-4 h-4 text-brand-600" />
              <span className="font-bold text-xs text-brand-900">Mã VietQR Tự Động Sinh Kèm Số Tiền Đơn Hàng</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="w-36 h-36 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm shrink-0 flex items-center justify-center">
                <img
                  src={qrUrl}
                  alt="Mã VietQR"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-1.5 text-xs text-gray-700 flex-1">
                <p>Ngân hàng: <strong>{DEFAULT_BANK_CONFIG.bankName}</strong></p>
                <p>Số tài khoản: <strong className="font-mono text-brand-700 text-sm">{DEFAULT_BANK_CONFIG.accountNo}</strong></p>
                <p>Chủ tài khoản: <strong>{DEFAULT_BANK_CONFIG.accountName}</strong></p>
                <p>Số tiền chính xác: <strong className="text-emerald-700 font-bold">{formatVND(order.totalAmount)}</strong></p>
                <p>Nội dung chuyển khoản: <strong className="font-mono text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">{order.code}</strong></p>
                <p className="text-[11px] text-gray-500 italic mt-1">
                  💡 Bạn chỉ cần mở ứng dụng ngân hàng và quét mã, hệ thống đã điền sẵn 100% số tiền và mã đơn.
                </p>
              </div>
            </div>
          </div>
        )}

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
            <span className="text-gray-500">Địa chỉ nhận hàng:</span>
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
            <span className="text-brand-600 font-mono">{formatVND(order.totalAmount)}</span>
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

        {/* Nút In Bill & Điều Hướng */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-gray-900 hover:bg-black text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Xem & In Hóa Đơn (Bill)</span>
          </button>
          
          <button
            onClick={onGoToOrderList}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-lg shadow-brand-500/25 transition-all"
          >
            Theo Dõi Đơn Hàng
          </button>

          <button
            onClick={onContinueShopping}
            className="px-5 py-3.5 rounded-2xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors"
          >
            Mua Sắm Tiếp
          </button>
        </div>
      </div>

      {/* Modal In Bill & Hóa Đơn */}
      <OrderInvoiceModal
        order={order}
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
      />
    </div>
  );
};
