import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  Calendar,
  User,
  Phone,
  MapPin,
  Sparkles,
  AlertTriangle,
  FileText,
  QrCode,
  Plus,
  ShieldCheck,
  Tag,
  Clock,
  Shirt,
  Loader2,
} from 'lucide-react';
import { Product, Order, OrderItem } from '../../types';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { useToast } from '../../context/ToastContext';
import { formatVND, formatDateVN, generateOrderCode, checkRentalOverlap, calculateRentalPricingDetails } from '../../utils/helpers';
import { generateVietQrUrl, getActiveBankConfig } from '../../utils/vietqr';

interface QuickCreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
  initialProductId?: string;
}

const AVAILABLE_ACCESSORIES = [
  { id: 'cai-toc', name: 'Cài tóc / Vương miện lấp lánh', price: 0 },
  { id: 'khan-voan', name: 'Khăn voan cài đầu cô dâu', price: 30000 },
  { id: 'tui-clutch', name: 'Túi xách / Clutch cầm tay dự tiệc', price: 50000 },
  { id: 'giay-cao-got', name: 'Giày / Sandal cao gót 7-9cm', price: 50000 },
  { id: 'gang-tay', name: 'Găng tay ren tiểu thư', price: 20000 },
];

export const QuickCreateOrderModal: React.FC<QuickCreateOrderModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
  initialProductId,
}) => {
  const { products, addRentalBookingToProduct } = useProducts();
  const { addDirectOrder, orders } = useOrders();
  const { showToast } = useToast();

  const activeBank = getActiveBankConfig();

  // Khóa chống bấm đúp tạo trùng đơn hàng
  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Customer State
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('Khách nhận & thử đồ trực tiếp tại Shop Bi Bi (Núi Thành)');
  const [isNewCustomerForm, setIsNewCustomerForm] = useState(false);

  // 2. Order Type & Deposit
  const [orderType, setOrderType] = useState<'instant' | 'preorder' | 'shipping'>('instant');
  const [depositMethod, setDepositMethod] = useState<'cash' | 'transfer' | 'id_card' | 'none'>('cash');
  const [customDeposit, setCustomDeposit] = useState<number>(0);

  // 3. Rental Dates
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const threeDaysLater = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2); // 3 ngày bao gồm hôm nay
    return d.toISOString().split('T')[0];
  }, []);

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(threeDaysLater);
  const [isTetHoliday, setIsTetHoliday] = useState(false);

  // 4. Product Selection & Search
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProductId || (products[0]?.id || '')
  );

  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0];
  }, [products, selectedProductId]);

  // Selected Size
  const [selectedSize, setSelectedSize] = useState<string>('S');
  const [selectedPackage, setSelectedPackage] = useState<'1day' | '2days' | '3days' | 'custom'>('3days');

  // Custom Extra Day Price
  const [customExtraDayPrice, setCustomExtraDayPrice] = useState<number>(50000);
  const [customBasePrice, setCustomBasePrice] = useState<number | null>(null);

  // 5. Accessories Selection & Custom Prices
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [accessoryPrices, setAccessoryPrices] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    AVAILABLE_ACCESSORIES.forEach((a) => {
      init[a.id] = a.price;
    });
    return init;
  });

  // 6. Notes & Payment
  const [notes, setNotes] = useState('');
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [transferAmount, setTransferAmount] = useState<number>(0);

  // When selected product changes, reset defaults
  React.useEffect(() => {
    if (selectedProduct) {
      if (selectedProduct.sizes && selectedProduct.sizes.length > 0) {
        setSelectedSize(selectedProduct.sizes[0]);
      }
      const defaultExtra = selectedProduct.extraDayPrice || Math.round((selectedProduct.rentPrice1Day || 150000) * 0.35) || 50000;
      setCustomExtraDayPrice(defaultExtra);
      setCustomDeposit(depositMethod === 'id_card' || depositMethod === 'none' ? 0 : (selectedProduct.deposit || 0));
      setCustomBasePrice(null);
    }
  }, [selectedProduct?.id, depositMethod]);

  // Sync dates when quick package is clicked
  const handleSelectPackage = (pkg: '1day' | '2days' | '3days') => {
    setSelectedPackage(pkg);
    const s = new Date(startDate);
    if (pkg === '1day') {
      setEndDate(startDate);
    } else if (pkg === '2days') {
      const e = new Date(s);
      e.setDate(e.getDate() + 1);
      setEndDate(e.toISOString().split('T')[0]);
    } else if (pkg === '3days') {
      const e = new Date(s);
      e.setDate(e.getDate() + 2);
      setEndDate(e.toISOString().split('T')[0]);
    }
  };

  // Calculate rental days
  const rentalDays = useMemo(() => {
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.max(0, e.getTime() - s.getTime());
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1); // Đếm cả ngày nhận & trả
  }, [startDate, endDate]);

  // Pricing calculations
  const pricingDetails = useMemo(() => {
    if (!selectedProduct) {
      return {
        total: 0,
        basePrice: 0,
        extraDays: 0,
        extraDayPrice: customExtraDayPrice,
        extraDayFee: 0,
        packageType: '3days' as const,
      };
    }

    const details = calculateRentalPricingDetails(selectedProduct, rentalDays, {
      isTetHoliday,
      customExtraDayPrice,
    });

    // If user manually overrode base price
    if (customBasePrice !== null) {
      const newTotal = customBasePrice + details.extraDayFee;
      return {
        ...details,
        basePrice: customBasePrice,
        total: newTotal,
      };
    }

    return details;
  }, [selectedProduct, rentalDays, isTetHoliday, customExtraDayPrice, customBasePrice]);

  // Total accessories cost with custom editable prices
  const accessoriesTotal = useMemo(() => {
    return selectedAccessories.reduce((sum, accName) => {
      const item = AVAILABLE_ACCESSORIES.find((a) => a.name === accName);
      if (!item) return sum;
      const price = accessoryPrices[item.id] !== undefined ? accessoryPrices[item.id] : item.price;
      return sum + price;
    }, 0);
  }, [selectedAccessories, accessoryPrices]);

  // Totals
  const rentFeeTotal = pricingDetails.total;
  const depositTotal = depositMethod === 'id_card' || depositMethod === 'none' ? 0 : customDeposit;
  const shippingFee = orderType === 'shipping' ? 30000 : 0;
  const grandTotal = rentFeeTotal + accessoriesTotal + depositTotal + shippingFee;

  // Auto-fill payment if 0
  React.useEffect(() => {
    if (cashAmount === 0 && transferAmount === 0 && grandTotal > 0) {
      setCashAmount(grandTotal);
    }
  }, [grandTotal]);

  // Filter products for search
  const filteredProducts = useMemo(() => {
    if (!productSearchQuery.trim()) return products.slice(0, 8);
    const q = productSearchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, productSearchQuery]);

  // Autocomplete customers from past orders
  const pastCustomers = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; address?: string }>();
    (orders || []).forEach((o) => {
      if (o.customerPhone && !map.has(o.customerPhone)) {
        map.set(o.customerPhone, {
          name: o.customerName,
          phone: o.customerPhone,
          address: o.shippingAddress,
        });
      }
    });
    return Array.from(map.values());
  }, [orders]);

  const matchingCustomers = useMemo(() => {
    if (!customerQuery.trim()) return [];
    const q = customerQuery.toLowerCase();
    return pastCustomers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [pastCustomers, customerQuery]);

  // Check rental conflict
  const rentalConflict = useMemo(() => {
    if (!selectedProduct) return { hasConflict: false };
    return checkRentalOverlap(startDate, endDate, selectedProduct.bookedDates || []);
  }, [selectedProduct, startDate, endDate]);

  const hasConflict = rentalConflict.hasConflict;

  if (!isOpen) return null;

  const handleSelectCustomer = (c: { name: string; phone: string; address?: string }) => {
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    if (c.address) setShippingAddress(c.address);
    setCustomerQuery(`${c.name} (${c.phone})`);
  };

  const handleNewCustomerClick = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerQuery('');
    setIsNewCustomerForm(true);
    showToast('Vui lòng nhập tên và số điện thoại khách hàng mới bên dưới!', 'info');
  };

  const toggleAccessory = (accName: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(accName) ? prev.filter((a) => a !== accName) : [...prev, accName]
    );
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmittingRef.current || isSubmitting) return;

    const finalName = customerName.trim() || customerQuery.trim();
    if (!finalName) {
      showToast('Vui lòng nhập tên khách hàng!', 'error');
      return;
    }
    if (!customerPhone.trim()) {
      showToast('Vui lòng nhập số điện thoại khách hàng!', 'error');
      return;
    }
    if (!selectedProduct) {
      showToast('Vui lòng chọn mẫu váy trong kho!', 'error');
      return;
    }
    if (hasConflict) {
      showToast(
        `Váy "${selectedProduct.title}" đã có khách đặt từ ${formatDateVN(rentalConflict.conflictingBooking?.startDate!)} đến ${formatDateVN(rentalConflict.conflictingBooking?.endDate!)}!`,
        'error'
      );
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    const orderCode = generateOrderCode();
    const orderId = `ord-${Date.now()}`;

    const orderItem: OrderItem = {
      productId: selectedProduct.id,
      productTitle: selectedProduct.title,
      productImage: selectedProduct.featuredImage,
      mode: 'rent',
      size: selectedSize,
      color: selectedProduct.colors[0] || 'Mặc định',
      quantity: 1,
      price: rentFeeTotal + accessoriesTotal,
      deposit: depositTotal,
      rentalStartDate: startDate,
      rentalEndDate: endDate,
      rentalDays,
      selectedPackage,
      baseRentPrice: pricingDetails.basePrice,
      extraDays: pricingDetails.extraDays,
      extraDayPrice: pricingDetails.extraDayPrice,
      extraDayFee: pricingDetails.extraDayFee,
      isTetHoliday,
      accessories: selectedAccessories.map((accName) => {
        const item = AVAILABLE_ACCESSORIES.find((a) => a.name === accName);
        const p = item ? (accessoryPrices[item.id] !== undefined ? accessoryPrices[item.id] : item.price) : 0;
        return p > 0 ? `${accName} (+${formatVND(p)})` : `${accName} (0 đ)`;
      }),
      sellerId: selectedProduct.sellerId,
      sellerName: selectedProduct.sellerName,
    };

    const newOrder: Order = {
      id: orderId,
      code: orderCode,
      userId: 'counter-customer',
      customerName: finalName,
      customerPhone: customerPhone.trim(),
      customerEmail: '',
      shippingAddress: shippingAddress.trim(),
      deliveryMethod: orderType === 'shipping' ? 'shipping' : 'pickup',
      orderType,
      depositMethod,
      depositNote: depositMethod === 'id_card' ? 'Giữ CCCD / Bằng lái xe gốc của khách' : undefined,
      paymentMethod: transferAmount > 0 && cashAmount > 0 ? 'split' : (transferAmount > 0 ? 'bank_transfer' : 'cod'),
      paymentStatus: 'paid',
      cashAmount,
      transferAmount,
      items: [orderItem],
      subtotal: rentFeeTotal + accessoriesTotal,
      depositTotal,
      shippingFee,
      serviceFee: 0,
      totalAmount: grandTotal,
      status: 'rented',
      notes: notes.trim(),
      isTetHoliday,
      vietqrUrl: transferAmount > 0 ? generateVietQrUrl({
        amount: transferAmount,
        orderCode,
        bankId: activeBank.bankId,
        accountNo: activeBank.accountNo,
        accountName: activeBank.accountName,
      }) : undefined,
      vietqrBank: activeBank.bankName,
      vietqrAccountNo: activeBank.accountNo,
      vietqrAccountName: activeBank.accountName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // 1. Lưu vào OrderContext & Database orders
      await addDirectOrder(newOrder);

      // 2. Khóa lịch trên sản phẩm & rental_bookings
      await addRentalBookingToProduct(selectedProduct.id, {
        id: `book-${Date.now()}`,
        startDate,
        endDate,
        renterName: `${finalName} (${customerPhone.trim()})`,
        status: 'confirmed',
      });

      showToast(`Tạo đơn hàng ${orderCode} thành công!`, 'success');
      onOrderCreated(newOrder);
      onClose();
    } catch (err: any) {
      console.error('Lỗi khi tạo đơn hàng mới:', err);
      showToast(err.message || 'Không thể tạo đơn hàng! Vui lòng thử lại.', 'error');
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-200 max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Thêm đơn hàng mới
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmitOrder} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          
          {/* 1. KHÁCH HÀNG */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              Khách hàng <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={customerQuery}
                onChange={(e) => {
                  setCustomerQuery(e.target.value);
                  setCustomerName(e.target.value);
                }}
                placeholder="Nhập tên hoặc số điện thoại khách hàng"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />

              {/* Autocomplete suggestions dropdown */}
              {matchingCustomers.length > 0 && customerQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 overflow-hidden divide-y divide-gray-100">
                  {matchingCustomers.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectCustomer(c)}
                      className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-xs flex items-center justify-between transition-colors"
                    >
                      <span className="font-bold text-gray-900">{c.name}</span>
                      <span className="font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-semibold">
                        {c.phone}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* "+ Thêm KH mới" Button (Green button like in screenshot 1) */}
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleNewCustomerClick}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm KH mới</span>
              </button>
            </div>

            {/* Detail inputs if creating new customer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5 pt-2.5 border-t border-gray-100">
              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="VD: 0912 345 678"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Địa chỉ giao / nhận đồ</label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Địa chỉ nhận đồ"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* 2. LOẠI ĐƠN */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">Loại đơn</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-brand-500"
            >
              <option value="instant">Lấy ngay (Thử đồ & lấy tại shop)</option>
              <option value="preorder">Đặt trước (Giữ lịch ngày sự kiện)</option>
              <option value="shipping">Giao hàng tận nơi (+30k ship)</option>
            </select>
          </div>

          {/* 3. ĐẶT CỌC */}
          <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Đặt cọc</span>
              </label>
              <span className="text-[11px] text-gray-500">
                {depositMethod === 'id_card' ? 'Đang giữ CCCD / Bằng lái gốc' : 'Hoàn trả khi khách trả đồ'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
              {[
                { id: 'cash', label: 'Cọc tiền mặt' },
                { id: 'transfer', label: 'Cọc chuyển khoản' },
                { id: 'id_card', label: 'Giữ CCCD gốc' },
                { id: 'none', label: 'Miễn cọc (Quen)' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setDepositMethod(m.id as any)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center border ${
                    depositMethod === m.id
                      ? 'bg-white border-amber-400 text-amber-900 shadow-xs ring-1 ring-amber-400/40'
                      : 'bg-transparent border-gray-200 text-gray-600 hover:bg-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {(depositMethod === 'cash' || depositMethod === 'transfer') && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-gray-600 shrink-0">Số tiền cọc:</span>
                <input
                  type="number"
                  step={50000}
                  value={customDeposit}
                  onChange={(e) => setCustomDeposit(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-amber-900"
                />
              </div>
            )}
          </div>

          {/* 4. NGÀY THUÊ & NGÀY TRẢ */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Ngày thuê <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-semibold focus:outline-none ${
                  hasConflict ? 'border-rose-400 bg-rose-50 text-rose-800' : 'border-gray-200'
                }`}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center justify-between">
                <span>Ngày trả <span className="text-rose-500">*</span></span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {rentalDays} ngày
                </span>
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-semibold focus:outline-none ${
                  hasConflict ? 'border-rose-400 bg-rose-50 text-rose-800' : 'border-gray-200'
                }`}
                required
              />
            </div>
          </div>

          {/* Conflict Warning */}
          {hasConflict && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block">Trùng lịch thuê của váy!</strong>
                <span>
                  Đã có lịch từ {formatDateVN(rentalConflict.conflictingBooking?.startDate!)} đến {formatDateVN(rentalConflict.conflictingBooking?.endDate!)} ({rentalConflict.conflictingBooking?.renterName || 'Đã khóa'}).
                </span>
              </div>
            </div>
          )}

          {/* 5. CHECKBOX ĐƠN NGÀY TẾT (Exact design from screenshot 2) */}
          <div className="pt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isTetHoliday}
                onChange={(e) => setIsTetHoliday(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded border-gray-300 focus:ring-rose-500"
              />
              <span className="text-xs font-bold text-rose-600">
                Đơn ngày Tết (không tính phí ngày thêm)
              </span>
            </label>
          </div>

          {/* 6. CHỌN VÁY (Tìm kiếm váy - Exact design from screenshot 2) */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              Chọn váy <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500">
                <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={productSearchQuery}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(e) => {
                    setProductSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  placeholder="Tìm kiếm váy ... / Nhập từ khoá để tìm váy"
                  className="w-full bg-transparent text-xs font-medium text-gray-900 focus:outline-none"
                />
              </div>

              {/* Product search suggestions popover */}
              {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl z-30 max-h-60 overflow-y-auto divide-y divide-gray-100">
                  <div className="p-2 bg-gray-50 text-[11px] font-bold text-gray-500 flex justify-between items-center">
                    <span>Gợi ý váy trong kho ({filteredProducts.length})</span>
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(false)}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      Đóng
                    </button>
                  </div>
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedProductId(p.id);
                        setIsSearchOpen(false);
                        setProductSearchQuery('');
                      }}
                      className={`w-full text-left p-2.5 flex items-center gap-3 hover:bg-emerald-50 transition-colors ${
                        selectedProductId === p.id ? 'bg-emerald-50/70' : ''
                      }`}
                    >
                      <img
                        src={p.featuredImage}
                        alt={p.title}
                        className="w-10 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        <span className="font-mono font-bold text-[10px] text-brand-700">
                          {p.sku || p.id.replace('prod-', 'BB-')}
                        </span>
                        <h4 className="font-semibold text-gray-900 truncate">{p.title}</h4>
                        <div className="text-[11px] text-gray-500 flex items-center gap-2">
                          <span>1 ngày: <strong className="text-emerald-700">{formatVND(p.rentPrice1Day || 0)}</strong></span>
                          <span>• 3 ngày: <strong>{formatVND(p.rentPrice3Days || 0)}</strong></span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 7. VÁY ĐÃ CHỌN (1) - Exact green container from screenshot 3 */}
          {selectedProduct && (
            <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/30 p-4 space-y-3 animate-in fade-in duration-150">
              
              {/* Header: ✓ Váy đã chọn (1): */}
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                <span>Váy đã chọn (1):</span>
              </div>

              {/* Dress Content Card */}
              <div className="bg-white rounded-xl p-3 border border-emerald-200 shadow-2xs space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={selectedProduct.featuredImage}
                    alt={selectedProduct.title}
                    className="w-14 h-16 rounded-xl object-cover shrink-0 border border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200">
                      Mã: {selectedProduct.sku || selectedProduct.id.replace('prod-', 'BB-')}
                    </span>
                    <h3 className="font-bold text-xs text-gray-900 mt-1 line-clamp-1">
                      {selectedProduct.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Thương hiệu: {selectedProduct.brand} • Tình trạng: {selectedProduct.condition}
                    </p>
                  </div>
                </div>

                {/* Size Selector Dropdown / Pills */}
                <div className="pt-1 border-t border-gray-100">
                  <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                    Chọn Size váy:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedProduct.sizes || ['S', 'M', 'L']).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                          selectedSize === s
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        Size: {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gói giá thuê 1 ngày / 2 ngày / 3 ngày */}
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                    <span>Chọn gói giá thuê:</span>
                    <span className="text-gray-500 font-normal">Thời gian: {rentalDays} ngày</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {/* 1 Ngày */}
                    <button
                      type="button"
                      onClick={() => handleSelectPackage('1day')}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        selectedPackage === '1day' && rentalDays <= 1
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-400 font-bold'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="block text-[10px] text-gray-500">Gói 1 ngày</span>
                      <span className="text-xs font-bold text-emerald-700">
                        {formatVND(selectedProduct.rentPrice1Day || 0)}
                      </span>
                    </button>

                    {/* 2 Ngày */}
                    <button
                      type="button"
                      onClick={() => handleSelectPackage('2days')}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        selectedPackage === '2days' && rentalDays === 2
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-400 font-bold'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="block text-[10px] text-gray-500">Gói 2 ngày</span>
                      <span className="text-xs font-bold text-emerald-700">
                        {formatVND(
                          selectedProduct.rentPrice2Days ||
                            (selectedProduct.rentPrice3Days
                              ? Math.round(selectedProduct.rentPrice3Days * 0.75)
                              : Math.round((selectedProduct.rentPrice1Day || 0) * 1.6))
                        )}
                      </span>
                    </button>

                    {/* 3 Ngày */}
                    <button
                      type="button"
                      onClick={() => handleSelectPackage('3days')}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        selectedPackage === '3days' || rentalDays >= 3
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-400 font-bold'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="block text-[10px] text-gray-500">Gói 3 ngày (Chuẩn)</span>
                      <span className="text-xs font-bold text-emerald-700">
                        {formatVND(selectedProduct.rentPrice3Days || 0)}
                      </span>
                    </button>
                  </div>

                  {/* Phí phụ thu thêm ngày */}
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700 text-[11px]">
                        Phí phụ thu thêm ngày (VNĐ/ngày):
                      </span>
                      <input
                        type="number"
                        step={10000}
                        value={customExtraDayPrice}
                        onChange={(e) => setCustomExtraDayPrice(Number(e.target.value))}
                        className="w-28 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-right text-gray-900"
                      />
                    </div>

                    {/* Calculation breakdown if > 3 days */}
                    {pricingDetails.extraDays > 0 && (
                      <div className="pt-1 border-t border-gray-200/80 flex items-center justify-between text-[11px]">
                        <span className="text-gray-600">
                          Vượt <strong>{pricingDetails.extraDays} ngày</strong> (sau 3 ngày):
                        </span>
                        {isTetHoliday ? (
                          <span className="font-bold text-rose-600">0 đ (Miễn phí ngày Tết)</span>
                        ) : (
                          <span className="font-bold text-rose-600">
                            +{formatVND(pricingDetails.extraDayFee)} ({pricingDetails.extraDays} x {formatVND(pricingDetails.extraDayPrice)})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Main Display Box matching Screenshot 3 */}
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-800">
                        Size: {selectedSize} • {formatVND(pricingDetails.basePrice)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {rentalDays <= 1 ? 'Thuê 1 ngày' : rentalDays === 2 ? 'Thuê 2 ngày' : 'Gói 3 ngày'}
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-gray-200 flex items-baseline justify-between">
                      <span className="text-xs font-bold text-gray-900">Tiền thuê váy:</span>
                      <span className="text-base font-serif font-black text-emerald-600">
                        {formatVND(pricingDetails.total)}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 8. CHỌN PHỤ KIỆN (Tuỳ chọn & cho phép sửa giá trực tiếp) */}
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 block">
                Chọn phụ kiện đi kèm (tuỳ chọn)
              </span>
              <span className="text-[11px] text-gray-500 font-medium">
                💡 Có thể nhập sửa giá trực tiếp
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AVAILABLE_ACCESSORIES.map((acc) => {
                const isChecked = selectedAccessories.includes(acc.name);
                const currentPrice = accessoryPrices[acc.id] !== undefined ? accessoryPrices[acc.id] : acc.price;
                return (
                  <div
                    key={acc.id}
                    onClick={() => toggleAccessory(acc.name)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer select-none transition-all gap-2 ${
                      isChecked
                        ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 font-medium shadow-xs'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 text-emerald-600 rounded border-gray-300 shrink-0 cursor-pointer"
                      />
                      <span className="text-xs leading-tight line-clamp-1">{acc.name}</span>
                    </div>

                    {/* Ô nhập giá tiền trực tiếp */}
                    <div
                      className="flex items-center gap-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="number"
                        min={0}
                        step={5000}
                        value={currentPrice}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
                          setAccessoryPrices((prev) => ({ ...prev, [acc.id]: val }));
                          if (!selectedAccessories.includes(acc.name)) {
                            setSelectedAccessories((prev) => [...prev, acc.name]);
                          }
                        }}
                        className={`w-20 px-2 py-1 text-right text-xs font-bold rounded-lg border transition-all ${
                          isChecked
                            ? 'bg-white text-emerald-700 border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500'
                            : 'bg-gray-50 text-gray-600 border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400'
                        }`}
                        title="Bấm để sửa giá tiền cho phụ kiện này"
                      />
                      <span className={`text-[11px] font-bold ${isChecked ? 'text-emerald-700' : 'text-gray-500'}`}>
                        đ
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {accessoriesTotal > 0 && (
              <div className="pt-1.5 flex justify-end items-center gap-1.5 text-xs text-emerald-700 font-bold border-t border-gray-200/60">
                <span>Tổng tiền phụ kiện:</span>
                <span>+{formatVND(accessoriesTotal)}</span>
              </div>
            )}
          </div>

          {/* 9. GHI CHÚ ĐƠN HÀNG (Exact from screenshot 3) */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Ghi chú đơn hàng
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú cho đơn hàng (tuỳ chọn)"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* 10. THANH TOÁN (Tiền mặt / Chuyển khoản - matching screenshot 3) */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
              Thanh toán
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Tiền mặt (VNĐ)</label>
                <input
                  type="number"
                  step={10000}
                  value={cashAmount}
                  onChange={(e) => setCashAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1 flex items-center justify-between">
                  <span>Chuyển khoản (VNĐ)</span>
                  {transferAmount > 0 && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                      VietQR
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  step={10000}
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                />
              </div>
            </div>

            {/* Grand Total Summary */}
            <div className="pt-2 border-t border-gray-200/80 flex items-baseline justify-between text-xs font-semibold">
              <span className="text-gray-600">
                Tổng cộng cần thu (Thuê + Phụ kiện + Cọc):
              </span>
              <span className="text-base font-serif font-black text-rose-600">
                {formatVND(grandTotal)}
              </span>
            </div>
          </div>

          {/* 11. SUBMIT BUTTONS (Magenta color matching screenshots 1, 2, 3) */}
          <div className="pt-3 space-y-2">
            <button
              type="submit"
              disabled={hasConflict || isSubmitting}
              className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                hasConflict || isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-[#c2185b] hover:bg-[#ad1457] active:scale-[0.99] shadow-pink-900/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý tạo đơn hàng...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>{hasConflict ? '⚠️ Trùng Lịch Thuê (Không Thể Tạo Đơn)' : 'Thêm đơn hàng'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
            >
              Hủy
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
