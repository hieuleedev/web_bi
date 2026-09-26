import React, { useState } from 'react';
import { X, Building2, CreditCard, User, Check, RefreshCw, QrCode } from 'lucide-react';
import { SUPPORTED_BANKS, BankConfig, getActiveBankConfig, saveActiveBankConfig, DEFAULT_BANK_CONFIG, generateVietQrUrl } from '../../utils/vietqr';
import { useToast } from '../../context/ToastContext';

interface BankConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export const BankConfigModal: React.FC<BankConfigModalProps> = ({
  isOpen,
  onClose,
  onUpdated,
}) => {
  const { showToast } = useToast();
  const currentConfig = getActiveBankConfig();

  const [bankId, setBankId] = useState(currentConfig.bankId);
  const [accountNo, setAccountNo] = useState(currentConfig.accountNo);
  const [accountName, setAccountName] = useState(currentConfig.accountName);
  const [template, setTemplate] = useState<BankConfig['template']>(currentConfig.template || 'compact2');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNo.trim()) {
      showToast('Vui lòng nhập số tài khoản ngân hàng!', 'error');
      return;
    }
    if (!accountName.trim()) {
      showToast('Vui lòng nhập tên chủ tài khoản!', 'error');
      return;
    }

    const selectedBank = SUPPORTED_BANKS.find((b) => b.id === bankId);
    const newConfig: BankConfig = {
      bankId,
      bankName: selectedBank ? selectedBank.name : bankId,
      accountNo: accountNo.trim(),
      accountName: accountName.trim().toUpperCase(),
      template,
    };

    saveActiveBankConfig(newConfig);
    showToast('Đã lưu cấu hình tài khoản VietQR và In Bill thành công!', 'success');
    if (onUpdated) onUpdated();
    onClose();
  };

  const handleResetDefault = () => {
    setBankId(DEFAULT_BANK_CONFIG.bankId);
    setAccountNo(DEFAULT_BANK_CONFIG.accountNo);
    setAccountName(DEFAULT_BANK_CONFIG.accountName);
    setTemplate(DEFAULT_BANK_CONFIG.template || 'compact2');
    saveActiveBankConfig(DEFAULT_BANK_CONFIG);
    showToast('Đã khôi phục thông tin tài khoản mặc định!', 'info');
    if (onUpdated) onUpdated();
  };

  // Preview QR
  const previewQrUrl = accountNo.trim() ? generateVietQrUrl({
    bankId,
    accountNo: accountNo.trim(),
    accountName: accountName.trim() || 'TEN CHU TAI KHOAN',
    amount: 500000,
    orderCode: 'BILL-TEST',
    template,
  }) : '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 lg:p-8 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-200 shadow-xs">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-gray-900">Cấu Hình Tài Khoản VietQR In Bill</h2>
            <p className="text-xs text-gray-500">Thiết lập số tài khoản ngân hàng để tự sinh mã QR thanh toán trên hóa đơn</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Form setup (7 cols) */}
          <form onSubmit={handleSave} className="md:col-span-7 space-y-4">
            {/* Bank Select */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-brand-600" />
                <span>1. Ngân Hàng Thụ Hưởng</span>
              </label>
              <select
                value={bankId}
                onChange={(e) => setBankId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {SUPPORTED_BANKS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-brand-600" />
                <span>2. Số Tài Khoản Ngân Hàng</span>
              </label>
              <input
                type="text"
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value.replace(/\s+/g, ''))}
                placeholder="Nhập số tài khoản ngân hàng của bạn..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 tracking-wider"
                required
              />
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-brand-600" />
                <span>3. Tên Chủ Tài Khoản (In hoa không dấu)</span>
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                placeholder="VD: NGUYEN VAN A..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold uppercase text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                required
              />
            </div>

            {/* QR Template style */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-brand-600" />
                <span>4. Mẫu Giao Diện VietQR</span>
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setTemplate('compact2')}
                  className={`p-2 rounded-xl border text-center font-medium transition-all ${
                    template === 'compact2'
                      ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Khung Logo Đẹp (compact2)
                </button>
                <button
                  type="button"
                  onClick={() => setTemplate('qr_only')}
                  className={`p-2 rounded-xl border text-center font-medium transition-all ${
                    template === 'qr_only'
                      ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Mã QR Thuần (qr_only)
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Lưu Cấu Hình STK</span>
              </button>
              <button
                type="button"
                onClick={handleResetDefault}
                className="px-3 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-medium flex items-center gap-1 transition-colors"
                title="Khôi phục thông tin tài khoản ngân hàng mặc định"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Mặc định</span>
              </button>
            </div>
          </form>

          {/* Realtime QR Preview (5 cols) */}
          <div className="md:col-span-5 bg-gray-50 rounded-2xl p-4 border border-gray-200 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Xem Trước Mã VietQR</span>
            {accountNo.trim() ? (
              <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-gray-100 max-w-[220px]">
                <img
                  src={previewQrUrl}
                  alt="VietQR Preview"
                  className="w-full h-auto rounded-xl object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="w-40 h-40 rounded-2xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center p-4 text-gray-400">
                <QrCode className="w-10 h-10 mb-2 text-gray-300" />
                <span className="text-[11px] leading-snug">Vui lòng nhập Số Tài Khoản để tạo mã QR</span>
              </div>
            )}
            <div className="mt-3 text-[11px] text-gray-600 space-y-0.5">
              <p>Ngân hàng: <strong className="text-gray-900">{bankId}</strong></p>
              <p>Số TK: <strong className="text-brand-700 font-mono">{accountNo || '(Chưa nhập)'}</strong></p>
              <p>Chủ TK: <strong className="text-gray-900 uppercase">{accountName || '(Chưa nhập)'}</strong></p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
