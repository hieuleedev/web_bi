import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, OrderStatus, CartItem } from '../types';
import { generateOrderCode } from '../utils/helpers';
import { useProducts } from './ProductContext';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';
import { supabase } from '../lib/supabase';

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
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  getUserOrders: (userId: string) => Order[];
  getSellerOrders: (sellerId: string) => Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const ORDERS_KEY = 'bibi_orders_v1';

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1',
    code: 'BB-98214',
    userId: 'user-buyer-1',
    customerName: 'Hoàng Mai Yến',
    customerPhone: '0912349876',
    customerEmail: 'maiyen.hoang@gmail.com',
    shippingAddress: 'Tòa nhà Landmark 72, Phạm Hùng, Nam Từ Liêm, Hà Nội',
    deliveryMethod: 'shipping',
    paymentMethod: 'bank_transfer',
    paymentStatus: 'paid',
    items: [
      {
        productId: 'prod-1',
        productTitle: 'Đầm Dạ Hội Ánh Kim Sa Cao Cấp - Sparkling Rose Gold',
        productImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80',
        mode: 'rent',
        size: 'M',
        color: 'Vàng Hồng (Rose Gold)',
        quantity: 1,
        price: 950000,
        deposit: 1500000,
        rentalStartDate: '2026-09-20',
        rentalEndDate: '2026-09-24',
        rentalDays: 4,
        sellerId: 'user-seller-1',
        sellerName: 'Bi Bi Boutique (Linh Bi)',
      }
    ],
    subtotal: 950000,
    depositTotal: 1500000,
    shippingFee: 35000,
    serviceFee: 0,
    totalAmount: 2485000,
    status: 'rented',
    notes: 'Giao hàng buổi sáng giúp em nhé shop!',
    createdAt: '2026-09-15T10:30:00Z',
    updatedAt: '2026-09-16T14:20:00Z',
  },
  {
    id: 'ord-2',
    code: 'BB-67431',
    userId: 'user-buyer-1',
    customerName: 'Hoàng Mai Yến',
    customerPhone: '0912349876',
    customerEmail: 'maiyen.hoang@gmail.com',
    shippingAddress: 'Tòa nhà Landmark 72, Phạm Hùng, Nam Từ Liêm, Hà Nội',
    deliveryMethod: 'shipping',
    paymentMethod: 'cod',
    paymentStatus: 'unpaid',
    items: [
      {
        productId: 'prod-6',
        productTitle: 'Set Áo Blazer Dạ Tweed Nút Mạ Vàng Quý Tộc',
        productImage: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=600&q=80',
        mode: 'buy',
        size: 'S',
        color: 'Trắng Kem (Off White)',
        quantity: 1,
        price: 1950000,
        sellerId: 'user-seller-1',
        sellerName: 'Bi Bi Boutique (Linh Bi)',
      }
    ],
    subtotal: 1950000,
    depositTotal: 0,
    shippingFee: 30000,
    serviceFee: 0,
    totalAmount: 1980000,
    status: 'shipping',
    notes: '',
    createdAt: '2026-09-16T08:15:00Z',
    updatedAt: '2026-09-16T11:00:00Z',
  }
];

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(ORDERS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading orders from localStorage', e);
      }
    }
    return INITIAL_ORDERS;
  });

  const { cartItems, subtotal, depositTotal, shippingTotal, grandTotal, clearCart } = useCart();
  const { addRentalBookingToProduct } = useProducts();
  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  // Sync orders from Supabase on mount
  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const mappedOrders: Order[] = data.map((row: any) => ({
            id: row.id,
            code: row.order_code,
            userId: row.user_id || 'guest',
            customerName: row.customer_name,
            customerPhone: row.customer_phone,
            customerEmail: row.customer_email || '',
            shippingAddress: row.shipping_address,
            deliveryMethod: row.delivery_method || 'shipping',
            paymentMethod: row.payment_method || 'cod',
            paymentStatus: row.payment_status || 'unpaid',
            items: row.items || [],
            subtotal: row.total_buy_price || row.total_rent_fee || 0,
            depositTotal: row.total_deposit || 0,
            shippingFee: row.shipping_fee || 30000,
            serviceFee: 0,
            totalAmount: (row.total_rent_fee || 0) + (row.total_buy_price || 0) + (row.total_deposit || 0) + (row.shipping_fee || 30000),
            status: row.status as OrderStatus,
            notes: row.notes,
            createdAt: row.created_at,
            updatedAt: row.updated_at || row.created_at,
          }));
          setOrders(mappedOrders);
          localStorage.setItem(ORDERS_KEY, JSON.stringify(mappedOrders));
        }
      } catch (e) {
        console.warn('Could not fetch orders from Supabase', e);
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Lock booked dates on products for rental items & write to rental_bookings
    for (const item of cartItems) {
      if (item.mode === 'rent' && item.rentalStartDate && item.rentalEndDate) {
        const bookingId = `book-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
        addRentalBookingToProduct(item.productId, {
          id: bookingId,
          startDate: item.rentalStartDate,
          endDate: item.rentalEndDate,
          renterName: params.customerName,
          status: 'confirmed',
        });

        // Supabase DB rental booking
        try {
          await supabase.from('rental_bookings').insert({
            id: bookingId,
            product_id: item.productId,
            order_id: orderId,
            start_date: item.rentalStartDate,
            end_date: item.rentalEndDate,
            renter_name: params.customerName,
            renter_phone: params.customerPhone,
            status: 'confirmed',
            note: params.notes
          });
        } catch (e) {
          console.warn('Error saving booking to Supabase', e);
        }
      }
    }

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    // Write order directly into Supabase Cloud DB
    try {
      await supabase.from('orders').insert({
        id: newOrder.id,
        order_code: newOrder.code,
        customer_name: newOrder.customerName,
        customer_phone: newOrder.customerPhone,
        shipping_address: newOrder.shippingAddress,
        items: newOrder.items,
        total_rent_fee: subtotal,
        total_buy_price: 0,
        total_deposit: depositTotal,
        shipping_fee: shippingTotal,
        status: newOrder.status,
        delivery_method: newOrder.deliveryMethod,
        payment_method: newOrder.paymentMethod,
        payment_status: newOrder.paymentStatus,
        notes: newOrder.notes
      });
    } catch (err) {
      console.warn('Error writing order to Supabase', err);
    }

    showToast(`Đặt hàng thành công! Mã đơn: ${orderCode}`, 'success');

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status, updatedAt: new Date().toISOString() }
          : o
      )
    );

    try {
      await supabase.from('orders').update({
        status,
        updated_at: new Date().toISOString()
      }).eq('id', orderId);
    } catch (e) {
      console.warn('Error updating order status in Supabase', e);
    }

    showToast(`Đã cập nhật trạng thái đơn hàng sang "${status}"`, 'info');
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
        updateOrderStatus,
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
