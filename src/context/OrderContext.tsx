import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, OrderStatus, CartItem } from '../types';
import { generateOrderCode } from '../utils/helpers';
import { generateVietQrUrl, DEFAULT_BANK_CONFIG } from '../utils/vietqr';
import { useProducts } from './ProductContext';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';
import { api } from '../lib/api';

interface CreateOrderParams {
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  deliveryMethod: 'shipping' | 'pickup';
  paymentMethod: 'cod' | 'bank_transfer' | 'momo' | 'vnpay';
  notes?: string;
}

interface OrderContextType {
  orders: Order[];
  createOrder: (params: CreateOrderParams) => Promise<Order | null>;
  addDirectOrder: (order: Order) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateOrderPaymentStatus: (orderId: string, paymentStatus: 'paid' | 'unpaid') => Promise<void>;
  updateOrder: (orderId: string, data: Partial<Order>) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  getUserOrders: (userId: string) => Order[];
  getSellerOrders: (sellerId: string) => Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const ORDERS_KEY = 'bibi_orders_v2_real';

const INITIAL_ORDERS: Order[] = [];

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    // Purge bulky legacy order keys from browser storage
    try {
      localStorage.removeItem(ORDERS_KEY);
      localStorage.removeItem('bibi_orders');
      localStorage.removeItem('bibi_orders_v1');
    } catch (e) {}
    return INITIAL_ORDERS;
  });

  const { cartItems, subtotal, depositTotal, shippingTotal, grandTotal, clearCart } = useCart();
  const { refreshProducts } = useProducts();
  const { showToast } = useToast();

  // Sync orders from Backend on mount and Realtime
  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await api.orders.getAll();
        if (data && data.length > 0) {
          const mappedOrders: Order[] = data.map((row: any) => ({
            id: row.id,
            code: row.code || row.orderCode || row.order_code,
            userId: row.userId || row.user_id || 'guest',
            customerName: row.customerName || row.customer_name,
            customerPhone: row.customerPhone || row.customer_phone,
            customerEmail: row.customerEmail || row.customer_email || '',
            shippingAddress: row.shippingAddress || row.shipping_address,
            deliveryMethod: row.deliveryMethod || row.delivery_method || 'shipping',
            paymentMethod: row.paymentMethod || row.payment_method || 'cod',
            paymentStatus: row.paymentStatus || row.payment_status || 'unpaid',
            items: row.items || [],
            subtotal: row.subtotal || row.total_buy_price || row.total_rent_fee || 0,
            depositTotal: row.depositTotal || row.total_deposit || 0,
            shippingFee: row.shippingFee || row.shipping_fee || 30000,
            serviceFee: 0,
            totalAmount: row.totalAmount || ((row.total_rent_fee || 0) + (row.total_buy_price || 0) + (row.total_deposit || 0) + (row.shipping_fee || 30000)),
            status: (row.status === 'renting' ? 'rented' : row.status) as OrderStatus,
            notes: row.notes || row.note || '',
            createdAt: row.createdAt || row.created_at,
            updatedAt: row.updatedAt || row.updated_at || row.created_at,
          }));
          setOrders(mappedOrders);
        }
      } catch (e) {
        console.warn('Could not fetch orders from Backend API', e);
      }
    }
    fetchOrders();
  }, []);

  const createOrder = async (params: CreateOrderParams): Promise<Order | null> => {
    if (cartItems.length === 0) {
      showToast('Giỏ hàng của bạn đang trống!', 'error');
      return null;
    }

    const orderId = `ord-${Date.now()}`;
    const orderCode = generateOrderCode();

    const orderItems = cartItems.map((c) => ({
      productId: c.productId,
      productTitle: c.product.title,
      productImage: c.product.featuredImage,
      mode: c.mode,
      size: c.selectedSize,
      color: c.selectedColor,
      quantity: c.quantity,
      price: c.mode === 'rent' ? (c.rentalPriceTotal || 0) : (c.product.buyPrice || 0),
      deposit: c.mode === 'rent' ? (c.depositAmount || 0) : 0,
      rentalStartDate: c.rentalStartDate,
      rentalEndDate: c.rentalEndDate,
      rentalDays: c.rentalDays,
      sellerId: c.product.sellerId,
      sellerName: c.product.sellerName,
    }));

    const newOrder: Order = {
      id: orderId,
      code: orderCode,
      userId: params.userId,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      customerEmail: params.customerEmail,
      shippingAddress: params.shippingAddress,
      deliveryMethod: params.deliveryMethod,
      paymentMethod: params.paymentMethod,
      paymentStatus: params.paymentMethod === 'cod' ? 'unpaid' : 'paid',
      items: orderItems,
      subtotal,
      depositTotal,
      shippingFee: shippingTotal,
      serviceFee: 0,
      totalAmount: grandTotal,
      status: 'pending',
      notes: params.notes,
      vietqrUrl: generateVietQrUrl({
        amount: grandTotal,
        orderCode,
        bankId: DEFAULT_BANK_CONFIG.bankId,
        accountNo: DEFAULT_BANK_CONFIG.accountNo,
        accountName: DEFAULT_BANK_CONFIG.accountName
      }),
      vietqrBank: DEFAULT_BANK_CONFIG.bankName,
      vietqrAccountNo: DEFAULT_BANK_CONFIG.accountNo,
      vietqrAccountName: DEFAULT_BANK_CONFIG.accountName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Gửi đơn hàng sang Backend API Server và Database Supabase
    try {
      const result = await api.orders.create({
        id: orderId,
        orderCode,
        userId: params.userId,
        customerName: params.customerName,
        customerPhone: params.customerPhone,
        customerEmail: params.customerEmail,
        shippingAddress: params.shippingAddress,
        deliveryMethod: params.deliveryMethod,
        paymentMethod: params.paymentMethod,
        items: orderItems,
        note: params.notes,
        totalRentFee: subtotal,
        totalBuyPrice: 0,
        totalDeposit: depositTotal,
        shippingFee: shippingTotal
      });

      if (result?.vietqrUrl) {
        newOrder.vietqrUrl = result.vietqrUrl;
      }
    } catch (e: any) {
      console.error('Lỗi lưu đơn hàng sang Backend Database:', e);
      showToast(e.message || 'Không thể tạo đơn hàng! Vui lòng kiểm tra kết nối mạng/máy chủ.', 'error');
      throw e;
    }

    // Backend đã tự động tạo lịch rental_bookings cho từng sản phẩm thuê.
    // Làm mới sản phẩm để cập nhật lịch đã đặt:
    try {
      await refreshProducts();
    } catch (e) {
      console.warn('Làm mới sản phẩm thất bại:', e);
    }

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    showToast(`Đặt hàng thành công! Mã đơn: ${orderCode}`, 'success');

    return newOrder;
  };

  const addDirectOrder = async (order: Order): Promise<Order> => {
    try {
      await api.orders.create({
        id: order.id,
        orderCode: order.code,
        userId: order.userId || 'counter-customer',
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail || '',
        shippingAddress: order.shippingAddress || 'Nhận trực tiếp tại tiệm',
        deliveryMethod: order.deliveryMethod || 'pickup',
        paymentMethod: order.paymentMethod || 'cod',
        items: order.items,
        note: order.notes || '',
        totalRentFee: order.subtotal,
        totalBuyPrice: 0,
        totalDeposit: order.depositTotal,
        shippingFee: order.shippingFee,
        status: (order.status === 'rented' ? 'renting' : order.status) || 'renting',
      });
    } catch (e: any) {
      console.warn('Lỗi lưu đơn hàng trực tiếp lên backend:', e);
    }
    setOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)]);
    return order;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const isReturnedOrCompleted = status === 'completed' || status === 'returned';
      const depositStatus = isReturnedOrCompleted ? 'refunded' : undefined;
      await api.orders.updateStatus(orderId, { status, ...(depositStatus ? { depositStatus } : {}) });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { 
                ...o, 
                status, 
                ...(depositStatus ? { depositStatus: 'refunded' as any } : {}),
                updatedAt: new Date().toISOString() 
              }
            : o
        )
      );
      if (isReturnedOrCompleted) {
        showToast('Đã nhận lại đồ & hoàn cọc cho khách! Đơn đã lưu vào lịch sử hoàn tất.', 'success');
      } else {
        showToast('Đã cập nhật trạng thái sang "Đang cho thuê"', 'info');
      }
      refreshProducts();
    } catch (e: any) {
      console.error('Lỗi cập nhật trạng thái đơn hàng lên Backend:', e);
      showToast(e.message || 'Không thể cập nhật trạng thái đơn hàng trên máy chủ!', 'error');
      throw e;
    }
  };

  const updateOrderPaymentStatus = async (orderId: string, paymentStatus: 'paid' | 'unpaid') => {
    try {
      await api.orders.updateStatus(orderId, { paymentStatus });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, paymentStatus, updatedAt: new Date().toISOString() }
            : o
        )
      );
      showToast(
        paymentStatus === 'paid'
          ? 'Đã xác nhận hoàn thành thanh toán!'
          : 'Đã cập nhật trạng thái chưa thanh toán!',
        'success'
      );
    } catch (e: any) {
      console.error('Lỗi cập nhật thanh toán đơn hàng:', e);
      showToast(e.message || 'Không thể cập nhật trạng thái thanh toán!', 'error');
      throw e;
    }
  };

  const updateOrder = async (orderId: string, data: Partial<Order>) => {
    try {
      await api.orders.update(orderId, data);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, ...data, updatedAt: new Date().toISOString() }
            : o
        )
      );
      showToast('Đã lưu thay đổi thông tin đơn hàng!', 'success');
    } catch (e: any) {
      console.error('Lỗi cập nhật đơn hàng lên Backend:', e);
      showToast(e.message || 'Không thể lưu thay đổi đơn hàng lên máy chủ!', 'error');
      throw e;
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await api.orders.delete(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      showToast('Đã xóa đơn hàng khỏi hệ thống!', 'info');
    } catch (e: any) {
      console.error('Lỗi xóa đơn hàng trên Backend:', e);
      showToast(e.message || 'Không thể xóa đơn hàng khỏi máy chủ!', 'error');
      throw e;
    }
  };

  const getOrderById = (orderId: string) => {
    return orders.find((o) => o.id === orderId);
  };

  const getUserOrders = (userId: string) => {
    return orders.filter((o) => o.userId === userId);
  };

  const getSellerOrders = (sellerId: string) => {
    return orders.filter((o) =>
      o.items.some((item) => item.sellerId === sellerId)
    );
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        addDirectOrder,
        updateOrderStatus,
        updateOrderPaymentStatus,
        updateOrder,
        deleteOrder,
        getOrderById,
        getUserOrders,
        getSellerOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
