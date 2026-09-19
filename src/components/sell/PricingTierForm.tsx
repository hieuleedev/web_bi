import React from 'react';
import { Sparkles, Calendar, ShoppingBag } from 'lucide-react';
import { ProductType } from '../../types';

interface PricingTierFormProps {
  productType: ProductType;
  onProductTypeChange: (type: ProductType) => void;
  buyPrice: number;
  onBuyPriceChange: (val: number) => void;
  originalPrice: number;
  onOriginalPriceChange: (val: number) => void;
  rentPrice1Day: number;
  onRentPrice1DayChange: (val: number) => void;
  rentPrice2Days?: number;
  onRentPrice2DaysChange?: (val: number) => void;
  rentPrice3Days: number;
  onRentPrice3DaysChange: (val: number) => void;
  rentPrice7Days: number;
  onRentPrice7DaysChange: (val: number) => void;
  extraDayPrice?: number;
  onExtraDayPriceChange?: (val: number) => void;
  deposit: number;
  onDepositChange: (val: number) => void;
}

export const PricingTierForm: React.FC<PricingTierFormProps> = ({
  productType,
  onProductTypeChange,
  buyPrice,
  onBuyPriceChange,
  originalPrice,
  onOriginalPriceChange,
  rentPrice1Day,
  onRentPrice1DayChange,
  rentPrice2Days = 0,
  onRentPrice2DaysChange,
  rentPrice3Days,
  onRentPrice3DaysChange,
  rentPrice7Days,
  onRentPrice7DaysChange,
  extraDayPrice = 50000,
  onExtraDayPriceChange,
  deposit,
  onDepositChange,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-100 shadow-sm space-y-5">
      <h3 className="font-serif font-bold text-base text-gray-900 pb-3 border-b border-gray-100">
        3. Hình Thức Kinh Doanh & Giá Bán / Cho Thuê
      </h3>

      {/* Type selector */}
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => onProductTypeChange('both')}
          className={`p-3.5 rounded-2xl border text-center font-bold text-xs transition-all ${
            productType === 'both'
              ? 'border-brand-600 bg-brand-50/50 text-brand-700 shadow-sm ring-1 ring-brand-500/30'
              : 'border-gray-200 text-gray-700 hover:border-gray-300'
          }`}
        >
          <Sparkles className="w-4 h-4 mx-auto mb-1 text-brand-600" />
          <span>Bán & Cho Thuê (Cả Hai)</span>
        </button>

        <button
          type="button"
          onClick={() => onProductTypeChange('rent')}
          className={`p-3.5 rounded-2xl border text-center font-bold text-xs transition-all ${
            productType === 'rent'
              ? 'border-emerald-600 bg-emerald-50/50 text-emerald-700 shadow-sm ring-1 ring-emerald-500/30'
              : 'border-gray-200 text-gray-700 hover:border-gray-300'
          }`}
        >
          <Calendar className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
          <span>Chỉ Cho Thuê</span>
        </button>

        <button
          type="button"
          onClick={() => onProductTypeChange('buy')}
          className={`p-3.5 rounded-2xl border text-center font-bold text-xs transition-all ${
            productType === 'buy'
              ? 'border-purple-600 bg-purple-50/50 text-purple-700 shadow-sm ring-1 ring-purple-500/30'
              : 'border-gray-200 text-gray-700 hover:border-gray-300'
          }`}
        >
          <ShoppingBag className="w-4 h-4 mx-auto mb-1 text-purple-600" />
          <span>Chỉ Bán Đứt</span>
        </button>
      </div>

      {/* Buy pricing */}
      {(productType === 'buy' || productType === 'both') && (
        <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-3">
          <h4 className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-purple-600" />
            <span>Cấu hình giá bán</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">Giá bán thực tế (VNĐ)</label>
              <input
                type="number"
                value={buyPrice}
                onChange={(e) => onBuyPriceChange(Number(e.target.value))}
                className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-900"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">Giá gốc niêm yết (nếu có giảm giá)</label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => onOriginalPriceChange(Number(e.target.value))}
                className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* Rental pricing */}
      {(productType === 'rent' || productType === 'both') && (
        <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-3">
          <h4 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Cấu hình gói giá cho thuê (1 ngày, 2 ngày, 3 ngày) & Phụ thu thêm ngày</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">Giá thuê 1 ngày (VNĐ)</label>
              <input
                type="number"
                value={rentPrice1Day}
                onChange={(e) => onRentPrice1DayChange(Number(e.target.value))}
                className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-700"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">Giá thuê 2 ngày (VNĐ)</label>
              <input
                type="number"
                value={rentPrice2Days || ''}
                placeholder={String(Math.round((rentPrice3Days || rentPrice1Day * 2) * 0.75))}
                onChange={(e) => onRentPrice2DaysChange && onRentPrice2DaysChange(Number(e.target.value))}
                className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-900"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">Giá thuê gói 3 ngày</label>
              <input
                type="number"
                value={rentPrice3Days}
                onChange={(e) => onRentPrice3DaysChange(Number(e.target.value))}
                className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-800"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">Phí thêm ngày (VNĐ/ngày)</label>
              <input
                type="number"
                value={extraDayPrice}
                onChange={(e) => onExtraDayPriceChange && onExtraDayPriceChange(Number(e.target.value))}
                className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-rose-700"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">Tiền cọc giữ đồ (hoàn trả)</label>
              <input
                type="number"
                value={deposit}
                onChange={(e) => onDepositChange(Number(e.target.value))}
                className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-700"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
