import { Heart, Sparkles, Calendar, Eye, MapPin } from 'lucide-react';
import { Product } from '../../types';
import { formatVND } from '../../utils/helpers';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { ProductBadge } from '../ui/Badge';
import { RatingStars } from '../ui/RatingStars';

interface ProductCardProps {
  product: Product;
  onViewDetail: (productId: string) => void;
  onOpenRentalCalendar?: (product: Product) => void;
  onQuickBuy?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetail,
  onOpenRentalCalendar,
  onQuickBuy,
}) => {
  const { wishlistIds, toggleLike } = useProducts();
  const { currentUser } = useAuth();
  const { startProductChat } = useChat();

  const isLiked = wishlistIds.includes(product.id);

  const handleChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUser) {
      startProductChat(product, currentUser);
    }
  };

  return (
    <div
      onClick={() => onViewDetail(product.id)}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer relative"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={product.featuredImage}
          alt={product.title}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5">
          {/* Top action: like */}
          <div className="flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(product.id);
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isLiked
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/90 text-gray-700 hover:bg-white hover:text-rose-500'
              }`}
              title={isLiked ? 'Bỏ thích' : 'Yêu thích'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Bottom hover action buttons */}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetail(product.id);
              }}
              className="flex-1 bg-white/95 hover:bg-white text-gray-900 text-xs font-semibold py-2.5 px-3 rounded-xl backdrop-blur-sm transition-colors flex items-center justify-center gap-1.5 shadow-md"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem chi tiết</span>
            </button>
            {product.type !== 'buy' && onOpenRentalCalendar && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenRentalCalendar(product);
                }}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1 shadow-md"
                title="Chọn ngày thuê"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Thuê</span>
              </button>
            )}
          </div>
        </div>

        {/* Badges on Image */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <ProductBadge type={product.type} condition={product.condition} />
        </div>
      </div>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Seller and Rating */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span className="truncate max-w-[130px] font-medium text-gray-600 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
              {product.location.split(',')[0]}
            </span>
            <RatingStars rating={product.rating} count={product.reviewsCount} size="sm" />
          </div>

          {/* Title */}
          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors mb-2">
            {product.title}
          </h3>

          {/* Sizes preview */}
          <div className="flex flex-wrap gap-1 mb-3">
            {product.sizes.slice(0, 3).map((size) => (
              <span
                key={size}
                className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono"
              >
                {size}
              </span>
            ))}
            {product.sizes.length > 3 && (
              <span className="text-[10px] text-gray-400 self-center">
                +{product.sizes.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Pricing Area */}
        <div className="pt-2 border-t border-gray-100 mt-auto">
          {/* Rental Price */}
          {(product.type === 'rent' || product.type === 'both') && product.rentPrice1Day && (
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-[11px] text-emerald-700 font-medium">Giá thuê:</span>
              <div className="text-right">
                <span className="text-sm font-bold text-emerald-600">
                  {formatVND(product.rentPrice1Day)}
                </span>
                <span className="text-[10px] text-gray-500"> /ngày</span>
              </div>
            </div>
          )}

          {/* Buy Price */}
          {(product.type === 'buy' || product.type === 'both') && product.buyPrice && (
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] text-gray-500">Giá mua:</span>
              <div className="text-right flex items-center gap-1.5">
                {product.originalPrice && (
                  <span className="text-[11px] text-gray-400 line-through">
                    {formatVND(product.originalPrice)}
                  </span>
                )}
                <span className="text-sm font-bold text-gray-900">
                  {formatVND(product.buyPrice)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
