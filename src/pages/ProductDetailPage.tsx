import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Calendar,
  CalendarRange,
  ShoppingBag,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  MapPin,
  ChevronRight,
  Send,
  PhoneCall,
  MessageCircle
} from 'lucide-react';
import { FEATURES } from '../config/features';
import { ZaloIcon, ZaloBadge } from '../components/common/ZaloIcon';
import { Product, Review, User } from '../types';
import { formatVND, formatDateVN, calculateRentalDays, calculateRentalPrice, checkRentalOverlap } from '../utils/helpers';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useToast } from '../context/ToastContext';
import { ProductScheduleManagerModal } from '../components/product/ProductScheduleManagerModal';

interface ProductDetailPageProps {
  productId?: string;
  onBack?: () => void;
  onGoToCart?: () => void;
  onOpenChat?: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId: propProductId,
  onBack,
  onGoToCart,
  onOpenChat,
}) => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const effectiveId = propProductId || params.id || '';

  const { getProductById, wishlistIds, toggleLike, addReview } = useProducts();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const { startProductChat } = useChat();
  const { showToast } = useToast();

  const product = getProductById(effectiveId);

  const [activeImage, setActiveImage] = useState<string>('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'buy' | 'rent'>('buy');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('Trắng');
  const [buyQuantity, setBuyQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setActiveImage(product.featuredImage);
      setActiveMode(product.type === 'rent' ? 'rent' : 'buy');
      setSelectedSize(product.sizes?.[0] || 'M');
      setSelectedColor(product.colors?.[0] || 'Trắng');
    }
  }, [product?.id]);

  const isLiked = product ? wishlistIds.includes(product.id) : false;


  // Rental Dates
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const defaultEndStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  }, []);

  const [startDate, setStartDate] = useState(tomorrowStr);
  const [endDate, setEndDate] = useState(defaultEndStr);

  // Overlap verification
  const overlapCheck = useMemo(() => {
    if (!product || activeMode !== 'rent' || !startDate || !endDate) return { hasConflict: false };
    return checkRentalOverlap(startDate, endDate, product.bookedDates);
  }, [product, activeMode, startDate, endDate]);

  const rentalDays = useMemo(() => {
    return calculateRentalDays(startDate, endDate);
  }, [startDate, endDate]);

  const rentalFee = useMemo(() => {
    if (!product) return 0;
    return calculateRentalPrice(product, rentalDays);
  }, [product, rentalDays]);

  const deposit = product?.deposit || 0;

  // Review state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/shop');
    }
  };

  const handleGoToCartAction = () => {
    if (onGoToCart) {
      onGoToCart();
    } else {
      navigate('/cart');
    }
  };

  const handleOpenChatAction = () => {
    if (onOpenChat) {
      onOpenChat();
    } else {
      navigate('/chat');
    }
  };

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 shadow-sm">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Không tìm thấy mẫu váy này!</h2>
        <p className="text-gray-500 text-sm mt-1 mb-6">Mã sản phẩm không tồn tại hoặc đã ngừng cung cấp.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-all shadow-md shadow-brand-500/20"
          >
            Xem bộ sưu tập váy
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await addReview(product.id, {
        userId: currentUser?.id || 'guest',
        userName: currentUser?.name || 'Khách hàng ẩn danh',
        userAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        rating: newRating,
        comment: newComment.trim(),
        type: activeMode,
      });

      setNewComment('');
      showToast('Cảm ơn bạn đã gửi đánh giá sản phẩm!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Gửi đánh giá thất bại!', 'error');
    }
  };

  const handleAddToCart = (instantCheckout = false) => {
    if (activeMode === 'rent') {
      if (overlapCheck.hasConflict) {
        showToast('Khoảng thời gian này đã bị trùng lịch, vui lòng chọn ngày khác!', 'error');
        return;
      }
      const ok = addToCart({
        product,
        mode: 'rent',
        selectedSize,
        selectedColor,
        rentalStartDate: startDate,
        rentalEndDate: endDate,
      });
      if (ok && instantCheckout) {
        handleGoToCartAction();
      }
    } else {
      const ok = addToCart({
        product,
        mode: 'buy',
        selectedSize,
        selectedColor,
        quantity: buyQuantity,
      });
      if (ok && instantCheckout) {
        handleGoToCartAction();
      }
    }
  };

  const handleChatWithSeller = () => {
    if (currentUser) {
      startProductChat(product, currentUser);
    }
  };

  return (
    <div className="bg-[#faf9f8] min-h-screen pb-32 sm:pb-20">
      {/* Breadcrumb & Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh mục</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleLike(product.id)}
              className={`p-2 rounded-full border transition-all ${
                isLiked
                  ? 'bg-rose-50 border-rose-200 text-rose-500'
                  : 'bg-white border-gray-200 text-gray-600 hover:text-rose-500'
              }`}
              title="Yêu thích"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                showToast('Đã sao chép liên kết sản phẩm!', 'info');
              }}
              className="p-2 rounded-full border border-gray-200 bg-white text-gray-600 hover:text-gray-900"
              title="Chia sẻ"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Gallery Section - Left (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Main Image with Zoom Effect - Optimized for all image ratios without cropping */}
              <div className="relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-auto lg:h-[620px] rounded-2xl overflow-hidden bg-gray-50/80 group border border-gray-200/80 flex items-center justify-center shadow-2xs">
                {/* Ambient blur backdrop to seamlessly blend any aspect ratio */}
                <img
                  src={activeImage}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-25 scale-110 pointer-events-none select-none"
                />

                {/* Main image: object-contain ensures tall/long dresses are completely visible without cutting */}
                <img
                  src={activeImage}
                  alt={product.title}
                  className="relative z-10 w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 select-none"
                />

                {/* Badge */}
                <div className="absolute top-4 left-4 z-20 pointer-events-none">
                  {product.type === 'both' ? (
                    <span className="bg-gradient-to-r from-amber-500 to-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      Bán & Cho Thuê
                    </span>
                  ) : product.type === 'rent' ? (
                    <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      Cho Thuê Theo Ngày
                    </span>
                  ) : (
                    <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      Sản Phẩm Bán
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail carousel */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-24 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImage === img
                        ? 'border-brand-600 ring-2 ring-brand-500/20 shadow-md'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Store & Seller Guarantee Box */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.sellerAvatar}
                      alt={product.sellerName}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-brand-500/20"
                    />
                    <div>
                      <h4 className="font-semibold text-xs text-gray-900">{product.sellerName}</h4>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {product.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const guestUser: User = currentUser || {
                          id: `guest-${Date.now()}`,
                          name: 'Khách hàng',
                          email: 'guest@bibifashion.vn',
                          phone: '0795623097',
                          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                          role: 'buyer' as const,
                          rating: 5.0,
                          ratingCount: 1,
                          location: 'Việt Nam',
                          joinedDate: new Date().toISOString(),
                        };
                        startProductChat(product, guestUser);
                        handleOpenChatAction();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 flex items-center gap-1.5 transition-colors shadow-sm shadow-brand-500/20"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Nhắn tin tư vấn</span>
                    </button>
                    <a
                      href="https://zalo.me/0795623097"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-100 flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <span>Zalo shop</span>
                    </a>
                    <a
                      href="tel:0795623097"
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <span>Gọi Hotline</span>
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200/60 text-center text-[10px] text-gray-600">
                  <div>
                    <span className="block font-bold text-gray-900 text-xs">{product.sellerRating} ★</span>
                    <span>Uy tín shop</span>
                  </div>
                  <div>
                    <span className="block font-bold text-gray-900 text-xs">100%</span>
                    <span>Form chuẩn</span>
                  </div>
                  <div>
                    <span className="block font-bold text-gray-900 text-xs">Hoàn cọc</span>
                    <span>Trong 24h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Info & Action Selection - Right (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                    {product.brand}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{product.condition}</span>
                </div>

                <h1 className="font-serif text-2xl lg:text-3xl font-bold text-gray-900 leading-snug">
                  {product.title}
                </h1>

                {/* Rating & reviews */}
                <div className="flex items-center gap-4 mt-2.5 text-xs text-gray-600">
                  <div className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                  </div>
                  <span>•</span>
                  <span>{product.reviewsCount} Đánh giá</span>
                  <span>•</span>
                  <span>{product.views} Lượt xem</span>
                </div>
              </div>

              {/* Mode Switcher: Buy vs Rent */}
              {product.type === 'both' && (
                <div className="flex p-1.5 bg-gray-100 rounded-2xl gap-2">
                  <button
                    onClick={() => setActiveMode('rent')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      activeMode === 'rent'
                        ? 'bg-white text-emerald-700 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Thuê Trang Phục (Theo Ngày)</span>
                  </button>

                  <button
                    onClick={() => setActiveMode('buy')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      activeMode === 'buy'
                        ? 'bg-white text-gray-900 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-brand-600" />
                    <span>Mua Đứt Sản Phẩm</span>
                  </button>
                </div>
              )}

              {/* Pricing Box */}
              <div className="p-5 rounded-2xl bg-brand-50/40 border border-brand-100">
                {activeMode === 'rent' ? (
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-semibold text-gray-600">Giá thuê 1 ngày:</span>
                      <div>
                        <span className="text-2xl font-serif font-bold text-emerald-600">
                          {formatVND(product.rentPrice1Day)}
                        </span>
                        <span className="text-xs text-gray-500"> /ngày</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-brand-100/80 text-xs">
                      <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-gray-500 block text-[11px] font-medium">Gói 2 ngày:</span>
                          <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">Tiết kiệm</span>
                        </div>
                        <span className="font-bold text-gray-900 text-sm">
                          {formatVND(
                            (product.rentPrice2Days && product.rentPrice2Days > 0 && product.rentPrice2Days < (product.rentPrice3Days || product.rentPrice7Days || Infinity))
                              ? product.rentPrice2Days
                              : Math.round((((product.rentPrice1Day || 0) + (product.rentPrice3Days || product.rentPrice7Days || 0)) / 2) / 1000) * 1000
                          )}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-brand-200 bg-brand-50/20 shadow-2xs">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-gray-700 block text-[11px] font-semibold">Gói 3 ngày (Chuẩn):</span>
                          <span className="text-[10px] text-brand-700 font-semibold bg-brand-100/80 px-1.5 py-0.5 rounded">Phổ biến</span>
                        </div>
                        <span className="font-bold text-brand-800 text-sm">
                          {formatVND(product.rentPrice3Days || product.rentPrice7Days || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 pt-0.5">
                      <span>Phụ thu thêm ngày (từ ngày thứ 4):</span>
                      <span className="font-semibold text-rose-600">+{formatVND(product.extraDayPrice || 20000)}/ngày</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-brand-100/60 text-gray-700">
                      <span>Tiền cọc yêu cầu (Hoàn trả khi trả đồ):</span>
                      <span className="font-bold text-amber-600">{formatVND(product.deposit)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-serif font-bold text-gray-900">
                      {formatVND(product.buyPrice)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatVND(product.originalPrice)}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Có sẵn giao ngay
                    </span>
                  </div>
                )}
              </div>

              {/* Sizes and Colors */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-2">
                    Kích Thước (Size)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s: string) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                          selectedSize === s
                            ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-2">
                    Màu Sắc
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c: string) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          selectedColor === c
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rental Date Selection & Verification or Direct Contact Card */}
              {!FEATURES.ONLINE_BOOKING ? (
                /* Khu vực tư vấn & liên hệ đặt thuê / thử đồ trực tiếp (Khi tạm ẩn đặt online) */
                <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-blue-50/70 via-white to-brand-50/50 border-2 border-blue-200/80 shadow-md shadow-blue-500/5 space-y-4 relative overflow-hidden">
                  {/* Background decorative glow */}
                  <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-start gap-3.5 relative">
                    {/* Official Zalo 3D-styled Badge */}
                    <div className="relative shrink-0">
                      <ZaloBadge size="lg" className="ring-4 ring-blue-100 shadow-lg shadow-blue-500/25" />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" title="Đang online sẵn sàng hỗ trợ" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100/90 px-2 py-0.5 rounded-full">
                          Tư Vấn & Giữ Váy Trực Tiếp
                        </span>
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Online 24/7
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-gray-900 text-base leading-snug">
                        Liên Hệ Đặt Lịch Thuê & Thử Váy
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        Shop hỗ trợ tư vấn form size, kiểm tra lịch trống và giữ đồ nhanh nhất qua Zalo hoặc mời bạn ghé thử đồ trực tiếp tại cửa hàng.
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons: Zalo Official Button + Hotline */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <a
                      href="https://zalo.me/0795623097"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#0068FF] via-[#0077FF] to-[#0091FF] hover:from-[#005ce6] hover:to-[#0080e6] text-white text-xs font-bold flex items-center justify-center gap-2.5 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 transition-all hover:scale-[1.01] active:scale-[0.99] group cursor-pointer"
                    >
                      <div className="w-5 h-5 bg-white text-[#0068FF] rounded-lg p-0.5 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition-transform">
                        <ZaloIcon className="w-full h-full fill-[#0068FF]" />
                      </div>
                      <span className="tracking-wide text-[13px]">Nhắn Zalo Giữ Váy Này</span>
                    </a>

                    <a
                      href="tel:0795623097"
                      className="flex-1 py-3.5 px-5 rounded-2xl bg-white hover:bg-gray-50 border-2 border-emerald-200 hover:border-emerald-300 text-gray-900 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <div className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <PhoneCall className="w-3.5 h-3.5" />
                      </div>
                      <span>Hotline: 0795.623.097</span>
                    </a>
                  </div>

                  {/* Location & Web Chat Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span>Thử đồ tại shop: <strong className="text-gray-800">Khối 1 - Xã Núi Thành - TP. Đà Nẵng</strong></span>
                    </span>
                    {onOpenChat && (
                      <button
                        type="button"
                        onClick={onOpenChat}
                        className="text-brand-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer ml-auto"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat trên Web</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {activeMode === 'rent' && (
                    <div className="p-4 sm:p-5 rounded-3xl bg-gray-50/90 border border-gray-200/90 space-y-3.5 shadow-2xs">
                      {/* Responsive Header: Tách 2 hàng trên Mobile, 1 hàng trên Desktop */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-gray-200/70">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Lịch Thuê & Kiểm Tra Trùng</span>
                          </h4>
                          {/* Badge ngày thuê trên Mobile (nằm góc phải tiêu đề) */}
                          <span className="sm:hidden text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                            {rentalDays} ngày thuê
                          </span>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setIsScheduleModalOpen(true)}
                            className="flex-1 sm:flex-initial text-[11px] font-semibold text-brand-700 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl border border-brand-200 transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
                          >
                            <CalendarRange className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                            <span>Xem chi tiết lịch thuê ({product.bookedDates.length})</span>
                          </button>

                          {/* Badge ngày thuê trên Desktop */}
                          <span className="hidden sm:inline-flex text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-xl shrink-0">
                            {rentalDays} ngày thuê
                          </span>
                        </div>
                      </div>

                      {/* Date Inputs: 1 cột trên điện thoại nhỏ, 2 cột trên màn lớn hơn */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                        <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-gray-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/10 shadow-2xs transition-all">
                          <label className="block text-[11px] font-semibold text-gray-500 mb-1 flex items-center justify-between">
                            <span>Ngày bắt đầu nhận váy</span>
                            <span className="text-[10px] text-brand-600 font-normal">Từ 08:00</span>
                          </label>
                          <input
                            type="date"
                            value={startDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => {
                              setStartDate(e.target.value);
                              if (new Date(e.target.value) >= new Date(endDate)) {
                                const nextDay = new Date(e.target.value);
                                nextDay.setDate(nextDay.getDate() + 1);
                                setEndDate(nextDay.toISOString().split('T')[0]);
                              }
                            }}
                            className="w-full bg-transparent text-xs sm:text-sm font-bold font-mono text-gray-900 focus:outline-none cursor-pointer"
                          />
                        </div>

                        <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-gray-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/10 shadow-2xs transition-all">
                          <label className="block text-[11px] font-semibold text-gray-500 mb-1 flex items-center justify-between">
                            <span>Ngày trả đồ cho shop</span>
                            <span className="text-[10px] text-brand-600 font-normal">Trước 21:00</span>
                          </label>
                          <input
                            type="date"
                            value={endDate}
                            min={startDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full bg-transparent text-xs sm:text-sm font-bold font-mono text-gray-900 focus:outline-none cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Overlap message & Calculated Price Banner */}
                      {overlapCheck.hasConflict ? (
                        <div className="p-3 sm:p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5 shadow-2xs">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-xs sm:text-sm">Đã có người đặt trước trong khoảng ngày này!</p>
                            <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                              Trùng lịch ({formatDateVN(overlapCheck.conflictingBooking?.startDate)} - {formatDateVN(overlapCheck.conflictingBooking?.endDate)}). Vui lòng chọn lịch khác.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 sm:p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start sm:items-center gap-2.5 shadow-2xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
                          <div className="flex-1 leading-relaxed">
                            <span className="font-bold text-emerald-800">Lịch khả dụng! </span>
                            <span className="block sm:inline">Tổng tiền thuê: <strong className="text-emerald-950 font-bold">{formatVND(rentalFee)}</strong></span>
                            <span className="text-gray-500"> + Cọc: <strong className="text-amber-700 font-bold">{formatVND(deposit)}</strong></span>
                          </div>
                        </div>
                      )}

                      {/* List of already booked dates */}
                      {product.bookedDates && product.bookedDates.length > 0 && (
                        <div className="pt-2 border-t border-gray-200/80">
                          <span className="text-[11px] font-semibold text-gray-500 block mb-1.5">
                            🔴 Các khoảng ngày váy này ĐÃ CÓ NGƯỜI THUÊ:
                          </span>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {product.bookedDates.map((b) => (
                              <span
                                key={b.id}
                                className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono font-bold bg-rose-100/80 text-rose-700 border border-rose-200 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                {formatDateVN(b.startDate)} → {formatDateVN(b.endDate)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons: Thêm giỏ + Thuê ngay + Nút Zalo chính thức */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                      <button
                        onClick={() => handleAddToCart(false)}
                        disabled={activeMode === 'rent' && overlapCheck.hasConflict}
                        className={`flex-1 py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-center gap-2 ${
                          activeMode === 'rent' && overlapCheck.hasConflict
                            ? 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'border-brand-600 text-brand-700 bg-brand-50/50 hover:bg-brand-50 active:scale-[0.99]'
                        }`}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Thêm Vào Giỏ Hàng</span>
                      </button>

                      <button
                        onClick={() => handleAddToCart(true)}
                        disabled={activeMode === 'rent' && overlapCheck.hasConflict}
                        className={`flex-1 py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2 ${
                          activeMode === 'rent' && overlapCheck.hasConflict
                            ? 'bg-gray-300 cursor-not-allowed shadow-none'
                            : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/25 active:scale-[0.99]'
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>{activeMode === 'rent' ? 'Thuê Ngay Bây Giờ' : 'Mua Ngay'}</span>
                      </button>
                    </div>

                    {/* Nút Nhắn Zalo giữ váy trực tiếp đi kèm */}
                    <a
                      href="https://zalo.me/0795623097"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#0068FF] via-[#0077FF] to-[#0091FF] hover:from-[#005ce6] hover:to-[#0080e6] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all active:scale-[0.99] group"
                    >
                      <div className="w-4 h-4 bg-white text-[#0068FF] rounded-sm p-0.2 flex items-center justify-center shrink-0">
                        <ZaloIcon className="w-full h-full fill-[#0068FF]" />
                      </div>
                      <span>Hoặc Nhắn Zalo Giữ Váy Trực Tiếp (0795.623.097)</span>
                    </a>
                  </div>
                </>
              )}

              {/* Details & Specifications Accordion / Cards */}
              <div className="pt-6 border-t border-gray-100 space-y-4 text-xs text-gray-600 leading-relaxed">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1.5">Mô Tả Sản Phẩm</h4>
                  <p>{product.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-gray-50">
                    <span className="text-gray-400 block text-[11px]">Chất liệu vải:</span>
                    <span className="font-semibold text-gray-900">{product.material}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50">
                    <span className="text-gray-400 block text-[11px]">Hướng dẫn chọn size:</span>
                    <span className="font-semibold text-gray-900">{product.sizeGuide || 'Chuẩn form Việt Nam'}</span>
                  </div>
                </div>

                {product.careInstructions && (
                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-amber-900 text-xs">
                    <span className="font-bold block mb-1">Lưu ý bảo quản trang phục:</span>
                    <span>{product.careInstructions}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="mt-14 pt-10 border-t border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-gray-900">
                  Đánh Giá & Nhận Xét Từ Khách Hàng
                </h3>
                <p className="text-xs text-gray-500">Người mua và người thuê thực tế chia sẻ trải nghiệm</p>
              </div>

              <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-amber-900 text-sm">{product.rating}</span>
                <span className="text-xs text-amber-700">/ 5.0 ({product.reviewsCount} đánh giá)</span>
              </div>
            </div>

            {/* Submit new review */}
            <form onSubmit={handleAddReview} className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 mb-8 space-y-3">
              <h4 className="text-xs font-bold text-gray-900">Viết đánh giá của bạn</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Đánh giá sao:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setNewRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${star <= newRating ? 'fill-amber-400' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về độ vừa vặn, chất liệu vải, dịch vụ giao nhận..."
                rows={3}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-brand-500"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Nhận Xét</span>
                </button>
              </div>
            </form>

            {/* Reviews List */}
            <div className="space-y-4">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev: Review) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.userAvatar}
                          alt={rev.userName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <span className="font-semibold text-xs text-gray-900">{rev.userName}</span>
                          <span className="text-[10px] text-gray-400 ml-2">
                            {formatDateVN(rev.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-gray-700 pl-11">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 text-xs">
                  Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên trải nghiệm!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Product Schedule Manager Modal */}
      {isScheduleModalOpen && (
        <ProductScheduleManagerModal
          product={product}
          onClose={() => setIsScheduleModalOpen(false)}
        />
      )}
    </div>
  );
};
