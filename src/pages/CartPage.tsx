import React from 'react';
import { ShoppingBag, ArrowLeft, PhoneCall } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { RentalCartItem } from '../components/cart/RentalCartItem';
import { BuyCartItem } from '../components/cart/BuyCartItem';
import { CartSummaryCard } from '../components/cart/CartSummaryCard';
import { FEATURES } from '../config/features';

interface CartPageProps {
  onContinueShopping: () => void;
  onProceedCheckout: () => void;
  onViewProduct: (productId: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  onContinueShopping,
  onProceedCheckout,
  onViewProduct,
}) => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    subtotal,
    depositTotal,
    shippingTotal,
    grandTotal,
  } = useCart();

  const buyItems = cartItems.filter((i) => i.mode === 'buy');
  const rentItems = cartItems.filter((i) => i.mode === 'rent');

  if (!FEATURES.ONLINE_BOOKING) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <PhoneCall className="w-10 h-10" />
        </div>
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">
            Đặt Thuê & Tư Vấn Trực Tiếp
          </h2>
          <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
            Shop Bi Bi hiện nhận tư vấn size, kiểm tra lịch trống và giữ đồ trực tiếp qua Zalo / Hotline hoặc ghé thử đồ tại cửa hàng để phục vụ chu đáo nhất.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <a
            href="https://zalo.me/0795623097"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-[#0068FF] hover:bg-[#0052cc] text-white text-xs font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Nhắn Zalo: 0795.623.097</span>
          </a>
          <a
            href="tel:0795623097"
            className="px-6 py-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 text-xs font-bold rounded-2xl shadow-2xs transition-all flex items-center justify-center gap-2"
          >
            <span>Gọi Hotline: 0795.623.097</span>
          </a>
        </div>
        <div className="pt-4">
          <button
            onClick={onContinueShopping}
            className="text-xs text-brand-600 font-semibold hover:underline inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại xem thêm các mẫu váy</span>
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-5">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">
          Giỏ Hàng Của Bạn Đang Trống
        </h2>
        <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
          Khám phá hàng trăm mẫu đầm dạ hội, áo dài truyền thống và vest cao cấp đang sẵn sàng để mua hoặc thuê tại Bi Bi Boutique.
        </p>
        <button
          onClick={onContinueShopping}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-brand-500/20 transition-all"
        >
          Khám Phá Thời Trang Ngay
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#faf9f8] min-h-screen py-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-gray-900">
              Giỏ Hàng & Đơn Đặt Thuê
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Bạn có {cartItems.length} mục trong giỏ hàng
            </p>
          </div>
          <button
            onClick={onContinueShopping}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tiếp tục chọn đồ</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Items List - 8 cols */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* RENTAL ITEMS SECTION */}
            {rentItems.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="font-bold text-sm text-gray-900">
                      Trang Phục Thuê Theo Lịch ({rentItems.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                    Đã kiểm tra lịch trống
                  </span>
                </div>

                <div className="divide-y divide-gray-100">
                  {rentItems.map((item) => (
                    <RentalCartItem
                      key={item.cartItemId}
                      item={item}
                      onRemove={removeFromCart}
                      onViewProduct={onViewProduct}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* BUY ITEMS SECTION */}
            {buyItems.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-brand-500" />
                    <h3 className="font-bold text-sm text-gray-900">
                      Sản Phẩm Mua Đứt ({buyItems.length})
                    </h3>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {buyItems.map((item) => (
                    <BuyCartItem
                      key={item.cartItemId}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                      onViewProduct={onViewProduct}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Box - 4 cols */}
          <div className="lg:col-span-4 space-y-4">
            <CartSummaryCard
              subtotal={subtotal}
              depositTotal={depositTotal}
              shippingTotal={shippingTotal}
              grandTotal={grandTotal}
              onProceedCheckout={onProceedCheckout}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
