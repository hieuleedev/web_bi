import React, { useState, useEffect } from 'react';
import { Printer, X, Loader2, CheckCircle, CheckCircle2, AlertTriangle, Monitor, DollarSign } from 'lucide-react';
import { Order } from '../../types';
import { formatVND, formatDateVN } from '../../utils/helpers';
import { generateVietQrUrl, getActiveBankConfig } from '../../utils/vietqr';
import { checkPrintServer, printReceipt, orderToPrintPayload } from '../../lib/printService';
import { useOrders } from '../../context/OrderContext';

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

  const { updateOrderPaymentStatus } = useOrders();
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

  useEffect(() => {
    if (order) setCurrentOrder(order);
  }, [order]);

  const [isPrinting, setIsPrinting] = useState(false);
  const [printStatus, setPrintStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  const bankConfig = getActiveBankConfig();
  const hasBank = Boolean(bankConfig.accountNo && bankConfig.accountNo.trim());

  useEffect(() => {
    checkPrintServer().then(setServerOnline);
  }, []);

  const qrUrl = currentOrder.vietqrUrl || (hasBank ? generateVietQrUrl({
    amount: currentOrder.totalAmount,
    orderCode: currentOrder.code,
    bankId: bankConfig.bankId,
    accountNo: bankConfig.accountNo,
    accountName: bankConfig.accountName,
    template: 'qr_only'
  }) : '');

  // Xác nhận hoàn thành thanh toán để ghi nhận doanh thu
  const handleCompletePayment = async () => {
    if (!currentOrder || isUpdatingPayment) return;
    setIsUpdatingPayment(true);
    try {
      await updateOrderPaymentStatus(currentOrder.id, 'paid');
      setCurrentOrder((prev) => ({ ...prev, paymentStatus: 'paid' }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  // In trực tiếp qua Local Print Server (API localhost:8080)
  const handlePrintLocalAPI = async () => {
    if (isPrinting) return;
    setIsPrinting(true);
    setPrintStatus(null);

    const isOnline = await checkPrintServer();
    setServerOnline(isOnline);

    if (!isOnline) {
      setIsPrinting(false);
      setPrintStatus({
        ok: false,
        msg: 'Server in chưa mở! Hãy mở MayIn_BiBi_Debug.exe trên máy tính này để in tự động.'
      });
      return;
    }

    const payload = orderToPrintPayload(currentOrder);
    if (hasBank) {
      payload.enableBankQr = true;
      payload.bankName = bankConfig.bankId;
      payload.bankAccount = bankConfig.accountNo;
    }

    const res = await printReceipt(payload);
    setIsPrinting(false);
    setPrintStatus({ ok: res.success, msg: res.message });

    if (res.success) {
      setTimeout(() => setPrintStatus(null), 4000);
    }
  };

  // Dự phòng: in qua cửa sổ trình duyệt nếu máy in không có server
  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* POS Receipt Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-[460px] w-full p-4 sm:p-6 my-6 z-10 border border-gray-100 max-h-[95vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:m-0 print:p-0 print:w-[80mm] print:max-w-[80mm]">
        
        {/* Modal Controls (Hidden when printing) */}
        <div className="pb-3 mb-3 border-b border-gray-100 print:hidden space-y-2.5">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${serverOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-xs font-bold text-gray-800">
                Hóa Đơn POS {serverOnline ? '(Máy in Online)' : '(Offline)'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              {/* NÚT HOÀN THÀNH THANH TOÁN (GHI NHẬN DOANH THU) */}
              {currentOrder.paymentStatus !== 'paid' ? (
                <button
                  onClick={handleCompletePayment}
                  disabled={isUpdatingPayment}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-60"
                  title="Xác nhận khách đã trả tiền đủ để đưa vào doanh thu"
                >
                  {isUpdatingPayment ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Thu Tiền Xong</span>
                </button>
              ) : (
                <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đã Thu Tiền</span>
                </div>
              )}

              {/* Nút in gọi trực tiếp API local print server */}
              <button
                onClick={handlePrintLocalAPI}
                disabled={isPrinting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-60"
                title="Bắn lệnh in trực tiếp ra máy in nhiệt (không mở hộp thoại)"
              >
                {isPrinting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Printer className="w-3.5 h-3.5" />
                )}
                <span>{isPrinting ? 'Đang gửi...' : 'In Bill POS'}</span>
              </button>

              {/* Nút dự phòng in trình duyệt */}
              <button
                onClick={handleBrowserPrint}
                className="p-1.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                title="In qua hộp thoại trình duyệt (Ctrl + P)"
              >
                <Monitor className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Banner nhắc nhở thanh toán nếu chưa thu tiền */}
          {currentOrder.paymentStatus !== 'paid' && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Đơn này <strong>chưa xác nhận thanh toán</strong> (chưa tính vào doanh thu).</span>
              </div>
              <button
                onClick={handleCompletePayment}
                disabled={isUpdatingPayment}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors"
              >
                Xác nhận đã thu
              </button>
            </div>
          )}

          {/* Thông báo trạng thái in */}
          {printStatus && (
            <div className={`p-2 rounded-xl text-xs flex items-center gap-2 ${
              printStatus.ok ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}>
              {printStatus.ok ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
              <span className="flex-1">{printStatus.msg}</span>
            </div>
          )}
        </div>

        {/* ================= POS RECEIPT AREA (KHỔ NHIỆT 80MM) ================= */}
        <div className="pos-bill bg-white p-3 sm:p-4 text-gray-900 font-mono text-xs leading-tight print:p-2">
          {/* Header */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-400">
            <div className="flex justify-center mb-1">
              <img src="/logo.jpg" alt="Logo Bi Bi" className="w-12 h-12 rounded-full object-cover border border-gray-300" />
            </div>
            <h2 className="font-serif font-black text-base uppercase tracking-tight text-gray-950">
              BI BI - CHO THUÊ ĐỒ
            </h2>
            <p className="text-[11px] text-gray-600 font-semibold">Núi Thành</p>
            <p className="text-[11px] text-gray-600">Đ/C: Khối 1 - Xã Núi Thành - TP. Đà Nẵng</p>
            <p className="text-[11px] font-bold text-gray-900">Hotline / Zalo: 0795.623.097</p>
          </div>

          {/* Title & Order info */}
          <div className="py-2.5 text-center space-y-1 border-b border-dashed border-gray-400">
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900">
              PHIẾU CHO THUÊ ĐỒ
            </h3>
            <p className="text-xs font-bold text-gray-900">
              Số: <span className="font-mono">{currentOrder.code}</span>
            </p>
            <p className="text-[10px] text-gray-500">
              {new Date(currentOrder.createdAt).toLocaleDateString('vi-VN')} {new Date(currentOrder.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Customer info */}
          <div className="py-2 space-y-1 border-b border-dashed border-gray-400 text-[11px]">
            <p>
              Khách hàng: <strong className="text-gray-950 text-xs">{currentOrder.customerName}</strong>
            </p>
            <p>
              Điện thoại: <strong className="font-mono text-gray-950">{currentOrder.customerPhone}</strong>
            </p>
            {currentOrder.shippingAddress && (
              <p className="text-[10px] text-gray-600">
                Địa chỉ: {currentOrder.shippingAddress}
              </p>
            )}
            {currentOrder.deliveryMethod && (
              <p className="text-[10px] text-gray-600">
                Nhận đồ: {currentOrder.deliveryMethod === 'pickup' ? 'Lấy tại tiệm' : 'Giao tận nơi'}
              </p>
            )}
          </div>

          {/* Items List */}
          <div className="py-2 space-y-2 border-b border-dashed border-gray-400">
            <div className="flex justify-between font-bold text-[10px] text-gray-500 uppercase pb-1 border-b border-gray-200">
              <span>Sản phẩm</span>
              <span>T.Tiền</span>
            </div>

            {currentOrder.items.map((item, idx) => (
              <div key={idx} className="space-y-1 text-[11px] pb-1.5 border-b border-gray-100 last:border-b-0">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-gray-950 flex-1">
                    {idx + 1}. {item.productTitle}
                  </span>
                  <span className="font-bold text-gray-950 shrink-0">
                    {formatVND(item.price * item.quantity)}
                  </span>
                </div>

                <div className="flex justify-between text-[10px] text-gray-600 font-semibold">
                  <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-900">
                    {item.mode === 'rent' ? 'THUÊ' : 'MUA'} • Size: {item.size} • SL: {item.quantity}
                  </span>
                  <span>Tổng: {formatVND(item.price)}</span>
                </div>

                {item.mode === 'rent' && item.rentalStartDate && item.rentalEndDate && (
                  <div className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded font-medium space-y-0.5">
                    <div>📅 {formatDateVN(item.rentalStartDate)} → {formatDateVN(item.rentalEndDate)} ({item.rentalDays || 1} ngày)</div>
                    {item.extraDays && item.extraDays > 0 ? (
                      <div className="text-rose-700 font-semibold">
                        + Phụ thu {item.extraDays} ngày thêm: {formatVND(item.extraDayFee || 0)}
                      </div>
                    ) : null}
                  </div>
                )}

                {item.accessories && item.accessories.length > 0 && (
                  <div className="text-[10px] text-purple-800 bg-purple-50 px-2 py-0.5 rounded">
                    + Phụ kiện: {item.accessories.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Totals Calculation */}
          <div className="py-2.5 space-y-1.5 border-b-2 border-dashed border-gray-900 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Tiền thuê đồ:</span>
              <span>{formatVND(currentOrder.subtotal)}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Tiền cọc giữ đồ:</span>
              <span className={currentOrder.depositTotal > 0 ? 'font-bold text-amber-700' : 'text-gray-500'}>
                {currentOrder.depositMethod === 'id_card'
                  ? 'Giữ CCCD / Bằng lái xe gốc'
                  : currentOrder.depositTotal > 0
                  ? formatVND(currentOrder.depositTotal)
                  : '0 đ (Miễn cọc)'}
              </span>
            </div>

            {currentOrder.shippingFee > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Phí giao hàng:</span>
                <span>+{formatVND(currentOrder.shippingFee)}</span>
              </div>
            )}

            {Boolean(currentOrder.cashAmount || currentOrder.transferAmount) && (
              <div className="pt-1 text-[10px] text-gray-500 flex justify-between">
                <span>Thanh toán:</span>
                <span>
                  {currentOrder.cashAmount ? `Tiền mặt: ${formatVND(currentOrder.cashAmount)} ` : ''}
                  {currentOrder.transferAmount ? `| Chuyển khoản: ${formatVND(currentOrder.transferAmount)}` : ''}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-dashed border-gray-300 flex justify-between items-baseline">
              <span className="font-bold text-sm uppercase text-gray-950">TỔNG CỘNG:</span>
              <span className="font-black text-base text-gray-950 font-mono">
                {formatVND(currentOrder.totalAmount)}
              </span>
            </div>

            <div className="flex justify-between text-[11px] pt-1">
              <span>Trạng thái:</span>
              <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                currentOrder.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {currentOrder.paymentStatus === 'paid' ? '✓ ĐÃ THANH TOÁN' : '⏳ CHƯA THANH TOÁN'}
              </span>
            </div>
          </div>

          {/* VietQR Code on POS receipt */}
          {hasBank && qrUrl && (
            <div className="py-3 text-center space-y-1.5 border-b border-dashed border-gray-400">
              <p className="text-[10px] font-bold uppercase text-gray-700">
                Quét QR Chuyển Khoản Nhanh
              </p>
              <div className="w-28 h-28 mx-auto bg-white p-1 border border-gray-300 rounded-lg flex items-center justify-center">
                <img
                  src={qrUrl}
                  alt="VietQR"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-[10px] text-gray-600 leading-none space-y-0.5">
                <p>NH: <strong>{bankConfig.bankName}</strong></p>
                <p>STK: <strong className="font-mono text-gray-900">{bankConfig.accountNo}</strong></p>
                <p>Tên: <strong className="uppercase">{bankConfig.accountName}</strong></p>
              </div>
            </div>
          )}

          {/* Footer Notice & Thank You (NO SIGNATURES) */}
          <div className="pt-3 text-center space-y-1 text-[10px] text-gray-600">
            <p className="italic">✓ Quý khách vui lòng giữ gìn trang phục và trả đồ đúng hạn.</p>
            <p className="italic">✓ Miễn phí giặt hấp chuẩn tiệm sau khi trả đồ.</p>
            <p className="font-bold text-xs pt-1 text-gray-950 tracking-wider">
              *** CẢM ƠN QUÝ KHÁCH ***
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
