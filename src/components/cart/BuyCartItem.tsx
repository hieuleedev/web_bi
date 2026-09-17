import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { CartItem } from '../../types';
import { formatVND } from '../../utils/helpers';

interface BuyCartItemProps {
  item: CartItem;
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemove: (cartItemId: string) => void;
  onViewProduct: (productId: string) => void;
}

export const BuyCartItem: React.FC<BuyCartItemProps> = ({
  item,
  onUpdateQuantity,
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
          <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
            Hàng Mua
          </span>
          <h4 className="font-medium text-xs text-gray-900 hover:text-brand-600 transition-colors mt-1 line-clamp-2">
            {item.product.title}
          </h4>
          <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
            <span>Size: <strong>{item.selectedSize}</strong></span>
            <span>•</span>
            <span>Màu: <strong>{item.selectedColor}</strong></span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between w-full sm:w-auto gap-4">
        {/* Quantity Counter */}
        <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
          <button
            onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
            className="p-1 hover:bg-white rounded-lg transition-colors"
          >
            <Minus className="w-3 h-3 text-gray-600" />
          </button>
          <span className="px-3 text-xs font-semibold text-gray-900">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
            className="p-1 hover:bg-white rounded-lg transition-colors"
          >
            <Plus className="w-3 h-3 text-gray-600" />
          </button>
        </div>

        <div className="text-right">
          <span className="text-sm font-bold text-gray-900 block">
            {formatVND((item.product.buyPrice || 0) * item.quantity)}
          </span>
        </div>

        <button
          onClick={() => onRemove(item.cartItemId)}
          className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
