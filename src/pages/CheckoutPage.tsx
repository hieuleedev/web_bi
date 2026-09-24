import React, { useState, useRef } from 'react';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatVND } from '../utils/helpers';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import { Order } from '../types';
import { CustomerInfoForm } from '../components/checkout/CustomerInfoForm';
import { PaymentMethodSelector } from '../components/checkout/PaymentMethodSelector';
import { OrderSuccessCard } from '../components/checkout/OrderSuccessCard';

interface CheckoutPageProps {
  onBackToCart: () => void;
  onGoToOrderList: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onBackToCart,
  onGoToOrderList,
}) => {
  const { cartItems, subtotal, depositTotal, shippingTotal, grandTotal } = useCart();
  const { currentUser } = useAuth();
  const { createOrder } = useOrders();
  const { showToast } = useToast();

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [shippingAddress, setShippingAddress] = useState('Khối 1 - Xã Núi Thành - Thành Phố Đà Nẵng, Da Nang, Vietnam, 560000');
  const [notes, setNotes] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'shipping' | 'pickup'>('shipping');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer' | 'momo' | 'vnpay'>('bank_transfer');

  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmittingRef.current || isSubmitting) return;

    // Validation
    if (!customerName.trim()) {
      showToast('Vui lòng nhập họ và tên người nhận!', 'error');
      return;
    }

    const phoneClean = customerPhone.replace(/\s+/g, '');
    if (!phoneClean || phoneClean.length < 9) {
      showToast('Vui lòng nhập số điện thoại hợp lệ (tối thiểu 10 chữ số)!', 'error');
      return;
    }

    if (deliveryMethod === 'shipping' && !shippingAddress.trim()) {
      showToast('Vui lòng nhập địa chỉ nhận hàng chi tiết!', 'error');
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const newOrder = await createOrder({
        userId: currentUser?.id || 'guest',
        customerName: customerName.trim(),
        customerPhone: phoneClean,
        customerEmail: customerEmail.trim(),
        shippingAddress: deliveryMethod === 'shipping' ? shippingAddress.trim() : 'Nhận trực tiếp tại showroom Bi Bi (Khối 1 - Xã Núi Thành - Thành Phố Đà Nẵng)',
        deliveryMethod,
        paymentMethod,
        notes: notes.trim(),
      });

      if (newOrder) {
        setCompletedOrder(newOrder);

        // Trigger Confetti effect
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#b78978', '#d97706', '#10b981', '#6366f1']
          });
        } catch (err) {
          // ignore
        }
      }
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // SUCCESS SCREEN
  if (completedOrder) {
    return (
      <OrderSuccessCard
        order={completedOrder}
        onGoToOrderList={onGoToOrderList}
        onContinueShopping={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="bg-[#faf9f8] min-h-screen py-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-gray-900">
              Thông Tin Đặt Hàng & Thanh Toán
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Vui lòng điền thông tin người nhận và chọn hình thức thanh toán thuận tiện
            </p>
          </div>
          <button
            onClick={onBackToCart}
            className="text-xs font-semibold text-gray-600 hover:text-brand-600 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại giỏ hàng</span>
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Information - 7 cols */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Customer Recipient Info Component */}
            <CustomerInfoForm
              name={customerName}
              onNameChange={setCustomerName}
              phone={customerPhone}
              onPhoneChange={setCustomerPhone}
              email={customerEmail}
              onEmailChange={setCustomerEmail}
              address={shippingAddress}
              onAddressChange={setShippingAddress}
              deliveryMethod={deliveryMethod}
              onDeliveryMethodChange={setDeliveryMethod}
              notes={notes}
              onNotesChange={setNotes}
            />

            {/* Payment Method Selector Component */}
            <PaymentMethodSelector
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              grandTotal={grandTotal}
            />
          </div>

          {/* Checkout Review & Order Summary - 5 cols */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 sticky top-24">
              <h3 className="font-serif font-bold text-base text-gray-900 pb-3 border-b border-gray-100">
                Tóm Tắt Đơn Hàng ({cartItems.length} sản phẩm)
              </h3>

              <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 pr-1">
                {cartItems.map((item) => (
                  <div key={item.cartItemId} className="py-2.5 flex items-center gap-3">
                    <img
                      src={item.product.featuredImage}
                      alt={item.product.title}
                      className="w-12 h-14 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs text-gray-900 truncate">
                        {item.product.title}
                      </h4>
                      <div className="text-[11px] text-gray-500">
                        {item.mode === 'rent' ? (
                          <span className="text-emerald-700 font-medium">
                            Thuê {item.rentalDays} ngày ({item.selectedSize})
                          </span>
                        ) : (
                          <span>SL: {item.quantity} × {item.selectedSize}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-900 shrink-0">
                      {formatVND(item.mode === 'rent' ? item.rentalPriceTotal : (item.product.buyPrice || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Tiền hàng/tiền thuê:</span>
                  <span className="font-medium text-gray-900">{formatVND(subtotal)}</span>
                </div>

                {depositTotal > 0 && (
                  <div className="flex justify-between text-amber-700 bg-amber-50 p-2 rounded-xl">
                    <span>Tiền cọc giữ đồ (hoàn lại):</span>
                    <span className="font-bold">{formatVND(depositTotal)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Phí giao nhận:</span>
                  <span className="font-medium text-gray-900">{formatVND(shippingTotal)}</span>
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-between items-baseline text-sm font-bold text-gray-900">
                  <span>Tổng cộng thanh toán:</span>
                  <span className="text-xl font-bold text-brand-600 font-serif">
                    {formatVND(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Deposit Policy Notice */}
              {depositTotal > 0 && (
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-[11px] text-gray-600 space-y-1">
                  <p className="font-bold text-gray-800">Quy định cọc trang phục thuê:</p>
                  <p>
                    Tiền cọc <strong>{formatVND(depositTotal)}</strong> sẽ được chuyển khoản trả lại quý khách sau khi nhận lại đồ trong tình trạng không rách hoặc cháy khét.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-2xl text-white text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-brand-600 hover:bg-brand-700 shadow-xl shadow-brand-500/25 active:scale-[0.99]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý đơn hàng...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Xác Nhận Đặt Hàng Ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
