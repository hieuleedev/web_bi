import React from 'react';
import { CreditCard, QrCode } from 'lucide-react';
import { formatVND } from '../../utils/helpers';
import { getActiveBankConfig } from '../../utils/vietqr';

interface PaymentMethodSelectorProps {
  paymentMethod: 'cod' | 'bank_transfer' | 'momo' | 'vnpay';
  onPaymentMethodChange: (method: 'cod' | 'bank_transfer' | 'momo' | 'vnpay') => void;
  grandTotal: number;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethod,
  onPaymentMethodChange,
  grandTotal,
}) => {
  const bankConfig = getActiveBankConfig();

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
      <h3 className="font-bold text-sm text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-brand-600" />
        <span>2. Phương Thức Thanh Toán</span>
      </h3>

      <div className="space-y-3">
        {/* Bank Transfer QR */}
        <label
          onClick={() => onPaymentMethodChange('bank_transfer')}
          className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
            paymentMethod === 'bank_transfer'
              ? 'border-brand-600 bg-brand-50/40 ring-1 ring-brand-500/30'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="payment"
            checked={paymentMethod === 'bank_transfer'}
            onChange={() => onPaymentMethodChange('bank_transfer')}
            className="mt-1 text-brand-600"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-brand-600" />
                Chuyển Khoản Ngân Hàng (Quét mã VietQR tự động)
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Khuyên dùng
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
              Quét mã QR từ bất kỳ app ngân hàng nào (Vietcombank, Techcombank, MB, BIDV...). Khớp số tiền và nội dung tự động.
            </p>

            {paymentMethod === 'bank_transfer' && (
              <div className="mt-3 p-3.5 rounded-xl bg-white border border-brand-200 text-xs space-y-1.5 animate-in fade-in duration-200">
                <div className="flex justify-between">
                  <span className="text-gray-500">Ngân hàng:</span>
                  <span className="font-bold text-gray-900">{bankConfig.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Số tài khoản / SĐT:</span>
                  <span className="font-mono font-bold text-brand-700">{bankConfig.accountNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Chủ tài khoản:</span>
                  <span className="font-bold text-gray-900 uppercase">{bankConfig.accountName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Số tiền:</span>
                  <span className="font-bold text-emerald-600">{formatVND(grandTotal)}</span>
                </div>
              </div>
            )}
          </div>
        </label>

        {/* COD */}
        <label
          onClick={() => onPaymentMethodChange('cod')}
          className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
            paymentMethod === 'cod'
              ? 'border-brand-600 bg-brand-50/40 ring-1 ring-brand-500/30'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="payment"
            checked={paymentMethod === 'cod'}
            onChange={() => onPaymentMethodChange('cod')}
            className="mt-1 text-brand-600"
          />
          <div>
            <span className="text-xs font-bold text-gray-900 block">
              Thanh toán khi nhận hàng (COD)
            </span>
            <span className="text-[11px] text-gray-500 mt-0.5 block">
              Nhận hàng, kiểm tra đồ đúng mẫu mã và thanh toán trực tiếp cho shipper.
            </span>
          </div>
        </label>

        {/* MoMo */}
        <label
          onClick={() => onPaymentMethodChange('momo')}
          className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
            paymentMethod === 'momo'
              ? 'border-brand-600 bg-brand-50/40 ring-1 ring-brand-500/30'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="payment"
            checked={paymentMethod === 'momo'}
            onChange={() => onPaymentMethodChange('momo')}
            className="mt-1 text-brand-600"
          />
          <div>
            <span className="text-xs font-bold text-gray-900 block">
              Ví điện tử MoMo
            </span>
            <span className="text-[11px] text-gray-500 mt-0.5 block">
              Thanh toán nhanh qua ví MoMo liên kết.
            </span>
          </div>
        </label>
      </div>
    </div>
  );
};
