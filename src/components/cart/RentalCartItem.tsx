import React from 'react';
import { Calendar, Trash2 } from 'lucide-react';
import { CartItem } from '../../types';
import { formatVND, formatDateVN } from '../../utils/helpers';

interface RentalCartItemProps {
  item: CartItem;
  onRemove: (cartItemId: string) => void;
  onViewProduct: (productId: string) => void;
}

export const RentalCartItem: React.FC<RentalCartItemProps> = ({
  item,
  onRemove,
  onViewProduct,
}) => {
  return (
    <div className="py-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div
        className="flex gap-3.5 cursor-pointer"
        onClick={() => onViewProduct(item.productId)}
      >
        <img
          src={item.product.featuredImage}
          alt={item.product.title}
          className="w-16 h-20 rounded-xl object-cover shrink-0"
        />
        <div>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            Thuê {item.rentalDays} ngày
          </span>
          <h4 className="font-medium text-xs text-gray-900 hover:text-brand-600 transition-colors mt-1 line-clamp-2">
            {item.product.title}
          </h4>
          <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
            <span>Size: <strong>{item.selectedSize}</strong></span>
            <span>•</span>
            <span>Màu: <strong>{item.selectedColor}</strong></span>
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50/70 px-2 py-0.5 rounded-lg w-fit">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {formatDateVN(item.rentalStartDate)} → {formatDateVN(item.rentalEndDate)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-2">
        <div className="text-right">
          <span className="text-sm font-bold text-emerald-600 block">
            {formatVND(item.rentalPriceTotal)}
          </span>
          <span className="text-[11px] text-amber-600">
            + Cọc: {formatVND(item.depositAmount)}
          </span>
        </div>

        <button
          onClick={() => onRemove(item.cartItemId)}
          className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50"
          title="Xóa mục này"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
