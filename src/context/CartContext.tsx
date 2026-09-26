import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '../types';
import { checkRentalOverlap, calculateRentalDays, calculateRentalPrice } from '../utils/helpers';
import { useToast } from './ToastContext';

interface AddToCartParams {
  product: Product;
  mode: 'buy' | 'rent';
  selectedSize: string;
  selectedColor: string;
  quantity?: number;
  rentalStartDate?: string;
  rentalEndDate?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (params: AddToCartParams) => boolean;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  depositTotal: number;
  shippingTotal: number;
  grandTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'bibi_cart_v1';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading cart from localStorage', e);
      }
    }
    return [];
  });

  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = ({
    product,
    mode,
    selectedSize,
    selectedColor,
    quantity = 1,
    rentalStartDate,
    rentalEndDate,
  }: AddToCartParams): boolean => {
    // Rental validation
    if (mode === 'rent') {
      if (!rentalStartDate || !rentalEndDate) {
        showToast('Vui lòng chọn ngày bắt đầu và ngày trả đồ!', 'error');
        return false;
      }

      // 1. Check if dates overlap with product's bookedDates
      const { hasConflict, conflictingBooking } = checkRentalOverlap(
        rentalStartDate,
        rentalEndDate,
        product.bookedDates
      );

      if (hasConflict) {
        showToast(
          `Khoảng thời gian này đã có khách đặt trước (${conflictingBooking?.startDate} - ${conflictingBooking?.endDate})! Vui lòng chọn ngày khác.`,
          'error'
        );
        return false;
      }

      // 2. Check if user already has this exact rental in cart with conflicting dates
      const existingInCart = cartItems.find(
        (item) =>
          item.productId === product.id &&
          item.mode === 'rent' &&
          item.rentalStartDate &&
          item.rentalEndDate &&
          checkRentalOverlap(rentalStartDate, rentalEndDate, [
            {
              id: 'cart-check',
              startDate: item.rentalStartDate,
              endDate: item.rentalEndDate,
              status: 'confirmed',
            },
          ]).hasConflict
      );

      if (existingInCart) {
        showToast('Bạn đã có sản phẩm này trong giỏ với khoảng ngày bị trùng!', 'warning');
        return false;
      }

      const days = calculateRentalDays(rentalStartDate, rentalEndDate);
      const rentalCost = calculateRentalPrice(product, days);
      const deposit = product.deposit || 0;

      const newCartItem: CartItem = {
        cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        product,
        selectedSize,
        selectedColor,
        mode: 'rent',
        quantity: 1, // rentals are per unique booking
        rentalStartDate,
        rentalEndDate,
        rentalDays: days,
        rentalPriceTotal: rentalCost,
        depositAmount: deposit,
      };

      setCartItems((prev) => [...prev, newCartItem]);
      showToast(`Đã thêm gói thuê "${product.title}" (${days} ngày) vào giỏ hàng!`, 'success');
      return true;
    }

    // Buy mode
    const existingIndex = cartItems.findIndex(
      (item) =>
        item.productId === product.id &&
        item.mode === 'buy' &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    );

    if (existingIndex > -1) {
      setCartItems((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
      showToast(`Đã tăng số lượng "${product.title}" trong giỏ hàng!`, 'success');
    } else {
      const newCartItem: CartItem = {
        cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        product,
        selectedSize,
        selectedColor,
        mode: 'buy',
        quantity,
      };
      setCartItems((prev) => [...prev, newCartItem]);
      showToast(`Đã thêm "${product.title}" vào giỏ hàng!`, 'success');
    }

    return true;
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Calculations
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cartItems.reduce((acc, item) => {
    if (item.mode === 'rent') {
      return acc + (item.rentalPriceTotal || 0);
    }
    const price = item.product.buyPrice || 0;
    return acc + price * item.quantity;
  }, 0);

  const depositTotal = cartItems.reduce((acc, item) => {
    if (item.mode === 'rent') {
      return acc + (item.depositAmount || 0);
    }
    return acc;
  }, 0);

  const shippingTotal = 0;
  const grandTotal = subtotal + depositTotal + shippingTotal;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
        depositTotal,
        shippingTotal,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
