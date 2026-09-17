import React from 'react';
import { Printer, X, ShieldCheck, QrCode } from 'lucide-react';
import { Order } from '../../types';
import { formatVND, formatDateVN } from '../../utils/helpers';
import { generateVietQrUrl, DEFAULT_BANK_CONFIG } from '../../utils/vietqr';

interface OrderInvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const qrUrl = order.vietqrUrl || generateVietQrUrl({
    amount: order.totalAmount,
    orderCode: order.code,
    bankId: DEFAULT_BANK_CONFIG.bankId,
    accountNo: DEFAULT_BANK_CONFIG.accountNo,
    accountName: DEFAULT_BANK_CONFIG.accountName
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Invoice Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-6 sm:p-10 my-8 z-10 border border-gray-100 max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:m-0 print:p-6">
        
        {/* Action Buttons (Ẩn khi In Bill) */}
        <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-100 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-gray-700">Phiếu In Hóa Đơn & Mã VietQR Tự Động</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>In Hóa Đơn / Xuất PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= INVOICE CONTENT (KHU VỰC IN) ================= */}
        <div className="invoice-print-area space-y-6 text-gray-800 font-sans">
          
          {/* Header Thông Tin Cửa Hàng */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-brand-800/20 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-brand-600 text-white font-serif font-black flex items-center justify-center text-sm shadow">
                  Bi
                </span>
                <h1 className="font-serif text-2xl font-black tracking-tight text-gray-900">
                  BI BI BOUTIQUE & RENTAL
                </h1>
              </div>
              <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-1 font-semibold">
                Nền Tảng Thời Trang Thiết Kế & Cho Thuê Trang Phục Cao Cấp
              </p>
              <div className="text-xs text-gray-600 mt-2 space-y-0.5">
                <p>📍 <strong>Showroom:</strong> Khối 1 - Xã Núi Thành - Thành Phố Đà Nẵng</p>
                <p>📞 <strong>Hotline:</strong> 0795 623 097 | ✉️ <strong>Email:</strong> bibi.fashion@gmail.com</p>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
                HÓA ĐƠN BÁN & CHO THUÊ
              </span>
              <p className="font-mono text-base font-black text-gray-900 mt-1">
                Mã: {order.code}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')} {new Date(order.createdAt).toLocaleTimeString('vi-VN')}
              </p>
            </div>
          </div>

          {/* Thông Tin Khách Hàng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/80 p-4 rounded-2xl border border-gray-200 text-xs">
            <div>
              <span className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                Người Nhận Hàng:
              </span>
              <p className="font-bold text-sm text-gray-900">{order.customerName}</p>
              <p className="font-mono text-gray-700 mt-0.5">SĐT: <strong>{order.customerPhone}</strong></p>
              {order.customerEmail && <p className="text-gray-500">Email: {order.customerEmail}</p>}
            </div>

            <div>
              <span className="text-[11px] uppercase font-bold text-gray-400 block mb-1">
                Giao Nhận & Thanh Toán:
              </span>
              <p className="text-gray-700">
                <strong>Địa chỉ:</strong> {order.shippingAddress}
              </p>
              <p className="text-gray-700 mt-0.5">
                <strong>Hình thức:</strong> {order.deliveryMethod === 'pickup' ? 'Nhận tại Showroom' : 'Giao tận nơi'}
              </p>
              <p className="text-gray-700 mt-0.5">
                <strong>Thanh toán:</strong>{' '}
                <span className="font-semibold text-brand-700 uppercase">
                  {order.paymentMethod === 'bank_transfer' ? 'Chuyển khoản VietQR' : order.paymentMethod.toUpperCase()}
                </span>{' '}
                ({order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Thu tiền khi giao'})
              </p>
            </div>
          </div>

          {/* Bảng Chi Tiết Sản Phẩm */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">STT</th>
                  <th className="py-2.5 px-3">Tên Trang Phục</th>
                  <th className="py-2.5 px-3">Hình Thức</th>
                  <th className="py-2.5 px-3">Size / Màu</th>
                  <th className="py-2.5 px-3 text-center">SL</th>
                  <th className="py-2.5 px-3 text-right">Giá / Tiền Thuê</th>
                  <th className="py-2.5 px-3 text-right">Tiền Cọc</th>
                  <th className="py-2.5 px-3 text-right">Thành Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-2.5 px-3 text-gray-400 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-gray-900">
                      <div>{item.productTitle}</div>
                      {item.mode === 'rent' && item.rentalStartDate && item.rentalEndDate && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-medium block mt-0.5 w-fit">
                          Lịch thuê: {formatDateVN(item.rentalStartDate)} → {formatDateVN(item.rentalEndDate)} ({item.rentalDays} ngày)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.mode === 'rent' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {item.mode === 'rent' ? 'Thuê đồ' : 'Mua đứt'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">
                      {item.size} / {item.color}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatVND(item.price)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-600">
                      {item.deposit && item.deposit > 0 ? formatVND(item.deposit) : '0 ₫'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-gray-900 font-mono">
                      {formatVND((item.price * item.quantity) + ((item.deposit || 0) * item.quantity))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phần Tổng Tiền & Mã VietQR Tự Động */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-2">
            
            {/* Cột Trái: Mã VietQR tự động khớp số tiền để quét thanh toán */}
            <div className="sm:col-span-6 bg-gradient-to-br from-brand-50/50 to-amber-50/40 p-4 rounded-2xl border border-brand-200 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-32 h-32 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm shrink-0 flex items-center justify-center">
                <img
                  src={qrUrl}
                  alt="Mã VietQR thanh toán tự động"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="text-xs space-y-1 text-center sm:text-left">
                <div className="flex items-center gap-1 justify-center sm:justify-start text-brand-800 font-bold text-xs">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Quét Mã VietQR Thanh Toán</span>
                </div>
                <p className="text-[11px] text-gray-600">
                  Ngân hàng: <strong>{DEFAULT_BANK_CONFIG.bankName}</strong>
                </p>
                <p className="text-[11px] text-gray-600">
                  STK: <strong className="font-mono text-brand-700 text-xs">{DEFAULT_BANK_CONFIG.accountNo}</strong>
                </p>
                <p className="text-[11px] text-gray-600">
                  Chủ TK: <strong>{DEFAULT_BANK_CONFIG.accountName}</strong>
                </p>
                <p className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit mx-auto sm:mx-0 mt-1">
                  ✓ Tự động điền số tiền: <strong>{formatVND(order.totalAmount)}</strong>
                </p>
              </div>
            </div>

            {/* Cột Phải: Bảng kê tính toán */}
            <div className="sm:col-span-6 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Tiền hàng (Mua & Thuê):</span>
                <span className="font-mono font-semibold">{formatVND(order.subtotal)}</span>
              </div>

              {order.depositTotal > 0 && (
                <div className="flex justify-between text-amber-700 font-medium bg-amber-50/60 px-2 py-1 rounded">
                  <span>Tiền cọc giữ đồ (Hoàn 100% khi trả):</span>
                  <span className="font-mono font-bold">+{formatVND(order.depositTotal)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển giao tận nơi:</span>
                <span className="font-mono font-semibold">+{formatVND(order.shippingFee)}</span>
              </div>

              <div className="pt-2 border-t-2 border-gray-900 flex justify-between items-baseline font-bold text-sm">
                <span className="text-gray-900">TỔNG CỘNG THANH TOÁN:</span>
                <span className="text-brand-700 font-serif text-lg font-black font-mono">
                  {formatVND(order.totalAmount)}
                </span>
              </div>
            </div>

          </div>

          {/* Cam Kết & Chính Sách */}
          <div className="text-[11px] text-gray-500 bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1">
            <p className="font-bold text-gray-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Chính sách & Quy định Bi Bi Boutique:
            </p>
            <p>1. Tiền đặt cọc sẽ được hoàn trả lại quý khách trong vòng 24 giờ sau khi nhận lại đồ nguyên vẹn.</p>
            <p>2. Trang phục được miễn phí giặt hấp chuẩn tiệm. Quý khách vui lòng không tự ý tẩy giặt bằng hóa chất mạnh.</p>
          </div>

          {/* Chữ Ký Hai Bên */}
          <div className="grid grid-cols-2 text-center text-xs pt-4 border-t border-gray-200">
            <div>
              <p className="font-bold text-gray-900 uppercase">Khách Hàng</p>
              <p className="text-[10px] text-gray-400 italic">(Ký và ghi rõ họ tên)</p>
              <div className="h-14" />
              <p className="font-semibold text-gray-800">{order.customerName}</p>
            </div>
            <div>
              <p className="font-bold text-gray-900 uppercase">Đại Diện Bi Bi Boutique</p>
              <p className="text-[10px] text-gray-400 italic">(Ký, đóng dấu hoặc xác nhận điện tử)</p>
              <div className="h-14" />
              <p className="font-semibold text-brand-700">Linh Bi (Bi Bi Fashion)</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
