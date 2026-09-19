import React, { useState } from 'react';
import { X, ShoppingBag, Calendar, User, Phone, MapPin, DollarSign, Check, FileText, AlertTriangle } from 'lucide-react';
import { Product, Order, OrderItem } from '../../types';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { useToast } from '../../context/ToastContext';
import { formatVND, formatDateVN, generateOrderCode, checkRentalOverlap } from '../../utils/helpers';
import { generateVietQrUrl, getActiveBankConfig } from '../../utils/vietqr';

interface QuickCreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
  initialProductId?: string;
}

export const QuickCreateOrderModal: React.FC<QuickCreateOrderModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
  initialProductId,
}) => {
  const { products, addRentalBookingToProduct } = useProducts();
  const { createOrder } = useOrders();
  const { showToast } = useToast();

  const activeBank = getActiveBankConfig();

  // Selected Product
  const [selectedProductId, setSelectedProductId] = useState(initialProductId || (products[0]?.id || ''));
  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Mode: rent or buy
  const [mode, setMode] = useState<'rent' | 'buy'>('rent');

  // Rent dates
  const todayStr = new Date().toISOString().split('T')[0];
  const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(threeDaysLater);

  // Price & Deposit overrides
  const [customPrice, setCustomPrice] = useState<number>(
    selectedProduct?.rentPrice3Days || selectedProduct?.rentPrice1Day || 350000
  );
  const [customDeposit, setCustomDeposit] = useState<number>(selectedProduct?.deposit || 0);
  const [quantity, setQuantity] = useState(1);

  // Customer Info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('Khách nhận & thử đồ trực tiếp tại Shop Bi Bi (Núi Thành)');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'shipping'>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cod'>('bank_transfer');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  // Calculate rental days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const rentalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Calculate totals
  const itemTotal = mode === 'rent' ? customPrice : (selectedProduct?.buyPrice || customPrice) * quantity;
  const depositTotal = mode === 'rent' ? customDeposit : 0;
  const shippingFee = deliveryMethod === 'shipping' ? 30000 : 0;
  const grandTotal = itemTotal + depositTotal + shippingFee;

  // Check rental dates conflict with existing bookings on the selected dress
  const rentalConflict = mode === 'rent' && selectedProduct
    ? checkRentalOverlap(startDate, endDate, selectedProduct.bookedDates || [])
    : { hasConflict: false };
  const hasRentalConflict = rentalConflict.hasConflict;

  // Handle product selection change
  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      if (mode === 'rent') {
        setCustomPrice(prod.rentPrice3Days || prod.rentPrice1Day || 300000);
        setCustomDeposit(prod.deposit || 0);
      } else {
        setCustomPrice(prod.buyPrice || 1200000);
        setCustomDeposit(0);
      }
    }
  };

  const handleModeToggle = (newMode: 'rent' | 'buy') => {
    setMode(newMode);
    if (selectedProduct) {
      if (newMode === 'rent') {
        setCustomPrice(selectedProduct.rentPrice3Days || selectedProduct.rentPrice1Day || 300000);
        setCustomDeposit(selectedProduct.deposit || 0);
      } else {
        setCustomPrice(selectedProduct.buyPrice || 1200000);
        setCustomDeposit(0);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) {
      showToast('Vui lòng chọn sản phẩm trong kho!', 'error');
      return;
    }
    if (mode === 'rent' && hasRentalConflict) {
      showToast(
        `Không thể tạo đơn! Váy đã có lịch trùng từ ${formatDateVN(rentalConflict.conflictingBooking?.startDate!)} đến ${formatDateVN(rentalConflict.conflictingBooking?.endDate!)} (${rentalConflict.conflictingBooking?.renterName || 'Đã khóa'})!`,
        'error'
      );
      return;
    }
    if (!customerName.trim()) {
      showToast('Vui lòng nhập tên khách hàng!', 'error');
      return;
    }
    if (!customerPhone.trim()) {
      showToast('Vui lòng nhập số điện thoại khách hàng!', 'error');
      return;
    }

    const orderCode = generateOrderCode();
    const orderId = `ord-${Date.now()}`;

    const orderItem: OrderItem = {
      productId: selectedProduct.id,
      productTitle: selectedProduct.title,
      productImage: selectedProduct.featuredImage,
      mode,
      size: selectedProduct.sizes[0] || 'M',
      color: selectedProduct.colors[0] || 'Mặc định',
      quantity,
      price: itemTotal,
      deposit: depositTotal,
      rentalStartDate: mode === 'rent' ? startDate : undefined,
      rentalEndDate: mode === 'rent' ? endDate : undefined,
      rentalDays: mode === 'rent' ? rentalDays : undefined,
      sellerId: selectedProduct.sellerId,
      sellerName: selectedProduct.sellerName,
    };

    const newOrder: Order = {
      id: orderId,
      code: orderCode,
      userId: 'offline-customer',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: '',
      shippingAddress: shippingAddress.trim(),
      deliveryMethod,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'unpaid' : 'paid',
      items: [orderItem],
      subtotal: itemTotal,
      depositTotal,
      shippingFee,
      serviceFee: 0,
      totalAmount: grandTotal,
      status: mode === 'rent' ? 'rented' : 'completed',
      notes: notes.trim(),
      vietqrUrl: generateVietQrUrl({
        amount: grandTotal,
        orderCode,
        bankId: activeBank.bankId,
        accountNo: activeBank.accountNo,
        accountName: activeBank.accountName,
      }),
      vietqrBank: activeBank.bankName,
      vietqrAccountNo: activeBank.accountNo,
      vietqrAccountName: activeBank.accountName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Lock booked dates on product if rental
    if (mode === 'rent') {
      try {
        await addRentalBookingToProduct(selectedProduct.id, {
          id: `book-${Date.now()}`,
          startDate,
          endDate,
          renterName: customerName.trim(),
          status: 'confirmed',
        });
      } catch (e: any) {
        console.warn('Lỗi lưu lịch thuê khi tạo đơn nhanh:', e);
      }
    }

    showToast(`Tạo đơn hàng ${orderCode} thành công!`, 'success');
    onOrderCreated(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 lg:p-8 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-200 shadow-xs">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-gray-900">Tạo Đơn Hàng Mới (Tại Quầy / Online)</h2>
            <p className="text-xs text-gray-500">Lên đơn cho khách thuê hoặc mua đồ, tự động sinh mã VietQR và In Bill</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Column: Product & Rental Specs (6 cols) */}
            <div className="md:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">1. Thông tin sản phẩm</span>
                {/* Rent / Buy Toggle */}
                <div className="inline-flex p-0.5 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleModeToggle('rent')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      mode === 'rent' ? 'bg-brand-600 text-white shadow-xs' : 'text-gray-600'
                    }`}
                  >
                    Cho Thuê
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeToggle('buy')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      mode === 'buy' ? 'bg-brand-600 text-white shadow-xs' : 'text-gray-600'
                    }`}
                  >
                    Bán Mua Đứt
                  </button>
                </div>
              </div>

              {/* Product Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Chọn Mẫu Váy / Quần Áo</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.sku || p.id.replace('prod-', 'BB-')}] {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Product Preview Card */}
              {selectedProduct && (
                <div className="flex items-center gap-3 p-3 bg-brand-50/50 rounded-2xl border border-brand-100">
                  <img
                    src={selectedProduct.featuredImage}
                    alt={selectedProduct.title}
                    className="w-14 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="text-xs space-y-0.5">
                    <span className="text-[10px] font-mono font-bold bg-white text-brand-700 px-1.5 py-0.5 rounded border border-brand-200">
                      Mã: {selectedProduct.sku || selectedProduct.id.replace('prod-', 'BB-')}
                    </span>
                    <h4 className="font-semibold text-gray-900 line-clamp-1">{selectedProduct.title}</h4>
                    <p className="text-gray-500 text-[11px]">
                      Giá thuê 3 ngày: <strong>{formatVND(selectedProduct.rentPrice3Days || 0)}</strong> • Cọc: <strong>{formatVND(selectedProduct.deposit || 0)}</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Rental Dates (if mode === 'rent') */}
              {mode === 'rent' && (
                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-800">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-brand-600" />
                      <span>Thời Gian Khách Thuê:</span>
                    </span>
                    <span className="text-brand-700 font-bold bg-white px-2 py-0.5 rounded-full border border-gray-200">
                      {rentalDays} ngày
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[11px] text-gray-500 block mb-1">Ngày nhận đồ</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={`w-full px-2.5 py-2 bg-white border rounded-xl text-xs font-semibold focus:outline-none ${
                          hasRentalConflict ? 'border-rose-400 text-rose-800 bg-rose-50/30' : 'border-gray-200'
                        }`}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-500 block mb-1">Ngày trả đồ</label>
                      <input
                        type="date"
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={`w-full px-2.5 py-2 bg-white border rounded-xl text-xs font-semibold focus:outline-none ${
                          hasRentalConflict ? 'border-rose-400 text-rose-800 bg-rose-50/30' : 'border-gray-200'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  {/* Conflict Warning */}
                  {hasRentalConflict && (
                    <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-2 text-xs text-rose-900 animate-pulse">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">
                          ⚠️ TRÙNG LỊCH: Váy đã có lịch thuê trong khoảng ngày này!
                        </p>
                        <p className="text-[11px] text-rose-700 mt-0.5">
                          Đã có khách đặt từ <strong>{formatDateVN(rentalConflict.conflictingBooking?.startDate!)}</strong> đến <strong>{formatDateVN(rentalConflict.conflictingBooking?.endDate!)}</strong> ({rentalConflict.conflictingBooking?.renterName || 'Đã khóa'}). Không thể tạo trùng đơn!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Existing bookings on this dress */}
                  {selectedProduct && (selectedProduct.bookedDates || []).filter((b) => b.status !== 'cancelled').length > 0 && (
                    <div className="text-[11px] bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80 space-y-1">
                      <span className="font-bold text-amber-900 flex items-center gap-1">
                        <span>🔒 Các khoảng ngày váy đã bận / đã có người đặt:</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {(selectedProduct.bookedDates || [])
                          .filter((b) => b.status !== 'cancelled')
                          .map((b, i) => (
                            <span key={i} className="bg-white px-2 py-0.5 rounded-md border border-amber-200 text-amber-900 text-[10px] font-medium shadow-2xs">
                              {formatDateVN(b.startDate)} → {formatDateVN(b.endDate)} ({b.renterName})
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Price & Deposit Inputs */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    {mode === 'rent' ? 'Tiền Thuê (VNĐ)' : 'Giá Bán (VNĐ)'}
                  </label>
                  <input
                    type="number"
                    value={customPrice}
                    step={10000}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    required
                  />
                </div>
                {mode === 'rent' ? (
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Tiền Cọc (Hoàn lại)</label>
                    <input
                      type="number"
                      value={customDeposit}
                      step={50000}
                      onChange={(e) => setCustomDeposit(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Số Lượng</label>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Customer Details & Payment (6 cols) */}
            <div className="md:col-span-6 space-y-4">
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block">2. Thông tin khách hàng</span>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-brand-600" />
                  <span>Tên Khách Hàng</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="VD: Chị Mai Phương"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-brand-600" />
                  <span>Số Điện Thoại</span>
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="VD: 0912 345 678"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  <span>Địa Chỉ Giao / Nhận Đồ</span>
                </label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              {/* Delivery & Payment Method */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Hình Thức Nhận</label>
                  <select
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                  >
                    <option value="pickup">Nhận tại Shop (0đ)</option>
                    <option value="shipping">Giao tận nơi (+30k)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Thanh Toán</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                  >
                    <option value="bank_transfer">Chuyển khoản VietQR</option>
                    <option value="cod">Tiền mặt / Trực tiếp</option>
                  </select>
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Ghi chú đơn hàng</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="VD: Khách lấy thêm phụ kiện cài tóc..."
                  className="w-full px-3.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                />
              </div>

              {/* Order Total Summary Box */}
              <div className="bg-dark-900 text-white p-4 rounded-2xl space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-300">
                  <span>Tiền {mode === 'rent' ? 'thuê đồ' : 'mua đồ'}:</span>
                  <span className="font-semibold text-white">{formatVND(itemTotal)}</span>
                </div>
                {mode === 'rent' && (
                  <div className="flex justify-between text-gray-300">
                    <span>Tiền cọc giữ đồ:</span>
                    <span className="font-semibold text-white">{formatVND(depositTotal)}</span>
                  </div>
                )}
                {shippingFee > 0 && (
                  <div className="flex justify-between text-gray-300">
                    <span>Phí giao hàng:</span>
                    <span className="font-semibold text-white">{formatVND(shippingFee)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-700 flex justify-between items-center text-sm font-bold">
                  <span className="text-brand-300">Tổng Cần Thu:</span>
                  <span className="text-brand-300 font-mono text-base">{formatVND(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={hasRentalConflict}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all ${
                hasRentalConflict
                  ? 'bg-rose-400 text-white cursor-not-allowed shadow-none opacity-80'
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{hasRentalConflict ? '⚠️ Trùng Lịch Thuê (Không Thể Tạo Đơn)' : 'Tạo Đơn Hàng & Mở In Bill Ngay'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
