import React from 'react';
import { User, Phone, Mail, MapPin, Truck, Building } from 'lucide-react';

interface CustomerInfoFormProps {
  name: string;
  onNameChange: (val: string) => void;
  phone: string;
  onPhoneChange: (val: string) => void;
  email: string;
  onEmailChange: (val: string) => void;
  address: string;
  onAddressChange: (val: string) => void;
  deliveryMethod: 'shipping' | 'pickup';
  onDeliveryMethodChange: (method: 'shipping' | 'pickup') => void;
  notes: string;
  onNotesChange: (val: string) => void;
}

export const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
  name,
  onNameChange,
  phone,
  onPhoneChange,
  email,
  onEmailChange,
  address,
  onAddressChange,
  deliveryMethod,
  onDeliveryMethodChange,
  notes,
  onNotesChange,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
      <h3 className="font-bold text-sm text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
        <User className="w-4 h-4 text-brand-600" />
        <span>1. Thông Tin Người Nhận Hàng</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Họ và tên người nhận <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Ví dụ: Hoàng Mai Yến"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Số điện thoại liên hệ <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="Ví dụ: 079 562 3097"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Email nhận thông báo đơn hàng
        </label>
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="maiyen.hoang@gmail.com"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Delivery Method */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Hình thức giao nhận
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onDeliveryMethodChange('shipping')}
            className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
              deliveryMethod === 'shipping'
                ? 'border-brand-600 bg-brand-50/50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <Truck className={`w-5 h-5 mt-0.5 ${deliveryMethod === 'shipping' ? 'text-brand-600' : 'text-gray-400'}`} />
            <div>
              <span className="text-xs font-bold block text-gray-900">Giao hàng tận nơi</span>
              <span className="text-[11px] text-gray-500">Hỏa tốc hoặc tiêu chuẩn</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onDeliveryMethodChange('pickup')}
            className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
              deliveryMethod === 'pickup'
                ? 'border-brand-600 bg-brand-50/50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <Building className={`w-5 h-5 mt-0.5 ${deliveryMethod === 'pickup' ? 'text-brand-600' : 'text-gray-400'}`} />
            <div>
              <span className="text-xs font-bold block text-gray-900">Nhận tại showroom</span>
              <span className="text-[11px] text-gray-500">Thử đồ trực tiếp tại shop</span>
            </div>
          </button>
        </div>
      </div>

      {deliveryMethod === 'shipping' && (
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Địa chỉ giao hàng chi tiết <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Ghi chú cho shipper hoặc chủ shop
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Ví dụ: Giao trước 11h trưa, hoặc gọi trước khi giao 15 phút..."
          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        />
      </div>
    </div>
  );
};
