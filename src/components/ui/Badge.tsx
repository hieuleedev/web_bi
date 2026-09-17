import React from 'react';
import { Sparkles, Calendar, ShoppingBag } from 'lucide-react';
import { ProductType } from '../../types';

interface ProductBadgeProps {
  type: ProductType;
  condition?: string;
  size?: 'sm' | 'md';
}

export const ProductBadge: React.FC<ProductBadgeProps> = ({ type, condition, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2.5 py-0.5' : 'text-xs px-3 py-1';

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {type === 'both' && (
        <span className={`bg-gradient-to-r from-amber-500 to-brand-500 text-white font-bold rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 ${sizeClasses}`}>
          <Sparkles className="w-3 h-3" />
          Bán & Thuê
        </span>
      )}
      {type === 'rent' && (
        <span className={`bg-emerald-600 text-white font-bold rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 ${sizeClasses}`}>
          <Calendar className="w-3 h-3" />
          Cho Thuê
        </span>
      )}
      {type === 'buy' && (
        <span className={`bg-purple-600 text-white font-bold rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 ${sizeClasses}`}>
          <ShoppingBag className="w-3 h-3" />
          Chỉ Bán
        </span>
      )}
      {condition && (
        <span className={`bg-dark-900/80 backdrop-blur-sm text-gray-200 font-medium rounded-full ${sizeClasses}`}>
          {condition}
        </span>
      )}
    </div>
  );
};
