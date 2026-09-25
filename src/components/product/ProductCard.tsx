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
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer relative"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={product.featuredImage}
          alt={product.title}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Quick Like Button (Always touchable on mobile & desktop) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(product.id);
          }}
          className={`absolute top-2 right-2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all shadow-xs ${
            isLiked
              ? 'bg-rose-500 text-white shadow-rose-500/30 scale-105'
              : 'bg-white/80 backdrop-blur-xs text-gray-700 hover:text-rose-500 hover:bg-white active:scale-90'
          }`}
          title={isLiked ? 'Bỏ thích' : 'Yêu thích'}
          aria-label="Thả tim yêu thích"
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Desktop Overlay gradient on hover */}
        <div className="hidden sm:flex absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col justify-end p-3 pointer-events-none">
          {/* Bottom hover action buttons */}
          <div className="flex gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetail(product.id);
              }}
              className="flex-1 bg-white/95 hover:bg-white text-gray-900 text-xs font-semibold py-2 px-2.5 rounded-xl backdrop-blur-sm transition-colors flex items-center justify-center gap-1 shadow-md"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Chi tiết</span>
            </button>
            {product.type !== 'buy' && onOpenRentalCalendar && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenRentalCalendar(product);
                }}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold py-2 px-2.5 rounded-xl transition-colors flex items-center justify-center gap-1 shadow-md"
                title="Chọn ngày thuê"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Thuê</span>
              </button>
            )}
          </div>
        </div>

        {/* Badges on Image */}
        <div className="absolute top-2 left-2 z-10 pointer-events-none scale-90 sm:scale-100 origin-top-left">
          <ProductBadge type={product.type} condition={product.condition} />
        </div>
      </div>

      {/* Product Content */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Location and Rating */}
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-500 mb-1">
            <span className="truncate max-w-[75px] sm:max-w-[120px] font-medium text-gray-500 flex items-center gap-0.5">
              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
              <span>{product.location.split(',')[0]}</span>
            </span>
            <RatingStars rating={product.rating} count={product.reviewsCount} size="sm" />
          </div>

          {/* Title */}
          <h3 className="font-medium text-gray-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors mb-1.5 min-h-[2rem] sm:min-h-[2.5rem]">
            {product.title}
          </h3>

          {/* Sizes preview */}
          <div className="flex flex-wrap gap-1 mb-2">
            {product.sizes.slice(0, 3).map((size) => (
              <span
                key={size}
                className="text-[9px] sm:text-[10px] bg-gray-50 border border-gray-100 text-gray-600 px-1 sm:px-1.5 py-0.2 rounded font-mono"
              >
                {size}
              </span>
            ))}
            {product.sizes.length > 3 && (
              <span className="text-[9px] sm:text-[10px] text-gray-400 self-center">
                +{product.sizes.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Pricing Area */}
        <div className="pt-2 border-t border-gray-100 mt-auto space-y-0.5 sm:space-y-1">
          {/* Rental Price */}
          {(product.type === 'rent' || product.type === 'both') && product.rentPrice1Day && (
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold whitespace-nowrap">
                Thuê:
              </span>
              <div className="text-right whitespace-nowrap">
                <span className="text-xs sm:text-sm font-bold text-emerald-600">
                  {formatVND(product.rentPrice1Day)}
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-400 font-normal"> /ngày</span>
              </div>
            </div>
          )}

          {/* Buy Price */}
          {(product.type === 'buy' || product.type === 'both') && product.buyPrice && (
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-[10px] sm:text-[11px] text-gray-500 whitespace-nowrap">
                Mua:
              </span>
              <div className="text-right flex items-center justify-end gap-1 whitespace-nowrap">
                {product.originalPrice && (
                  <span className="hidden sm:inline text-[10px] text-gray-400 line-through">
                    {formatVND(product.originalPrice)}
                  </span>
                )}
                <span className="text-xs sm:text-sm font-bold text-gray-900">
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
