import React, { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ChatProvider } from './context/ChatContext';

import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { RentPage } from './pages/RentPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { SellPage } from './pages/SellPage';
import { AccountPage } from './pages/AccountPage';
import { ChatPage } from './pages/ChatPage';
import { AdminPage } from './pages/AdminPage';
import { RentalCalendarModal } from './components/product/RentalCalendarModal';
import { Phone } from 'lucide-react';
import { ZaloIcon } from './components/common/ZaloIcon';
import { Product } from './types';
import { FEATURES } from './config/features';

export function AppContent() {
  const navigate = useNavigate();
  const [calendarProduct, setCalendarProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleViewProduct = (productId: string) => {
    navigate(`/product/${productId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenRentalCalendar = (product: Product) => {
    setCalendarProduct(product);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    navigate('/shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    navigate('/shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenericNavigate = (view: string) => {
    if (view === 'home') navigate('/');
    else if (view === 'my-products') navigate('/quan-ly-shop');
    else navigate(`/${view}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f8]">
      {/* Header */}
      <Header
        onOpenProductDetail={handleViewProduct}
        onSearch={handleSearch}
      />

      {/* Main Pages with Full URL Routing */}
      <main className="flex-1">
        <Routes>
          {/* Home */}
          <Route
            path="/"
            element={
              <HomePage
                onNavigate={handleGenericNavigate}
                onViewProduct={handleViewProduct}
                onOpenRentalCalendar={handleOpenRentalCalendar}
                onSelectCategory={handleSelectCategory}
              />
            }
          />

          {/* Shop */}
          <Route
            path="/shop"
            element={
              <ShopPage
                initialSearch={searchQuery}
                initialCategory={selectedCategory}
                onViewProduct={handleViewProduct}
                onOpenRentalCalendar={handleOpenRentalCalendar}
              />
            }
          />

          {/* Rent */}
          <Route
            path="/rent"
            element={
              <RentPage
                onViewProduct={handleViewProduct}
                onOpenRentalCalendar={handleOpenRentalCalendar}
              />
            }
          />

          {/* Dedicated product detail URLs */}
          <Route
            path="/product/:id"
            element={
              <ProductDetailPage
                onBack={() => navigate('/shop')}
                onGoToCart={() => navigate('/cart')}
                onOpenChat={() => navigate('/chat')}
              />
            }
          />
          <Route
            path="/san-pham/:id"
            element={
              <ProductDetailPage
                onBack={() => navigate('/shop')}
                onGoToCart={() => navigate('/cart')}
                onOpenChat={() => navigate('/chat')}
              />
            }
          />

          {/* Shop Inventory Management Route (/quan-ly-shop) */}
          <Route
            path="/quan-ly-shop"
            element={
              <AccountPage
                initialTab="my-products"
                onNavigateSell={() => navigate('/sell')}
                onViewProduct={handleViewProduct}
                onOpenChat={() => navigate('/chat')}
              />
            }
          />
          <Route
            path="/seller/products"
            element={
              <AccountPage
                initialTab="my-products"
                onNavigateSell={() => navigate('/sell')}
                onViewProduct={handleViewProduct}
                onOpenChat={() => navigate('/chat')}
              />
            }
          />
          <Route
            path="/seller/orders"
            element={
              <AccountPage
                initialTab="seller-orders"
                onNavigateSell={() => navigate('/sell')}
                onViewProduct={handleViewProduct}
                onOpenChat={() => navigate('/chat')}
              />
            }
          />

          {/* Account / User Profile / Customer Orders */}
          <Route
            path="/account"
            element={
              <AccountPage
                initialTab="overview"
                onNavigateSell={() => navigate('/sell')}
                onViewProduct={handleViewProduct}
                onOpenChat={() => navigate('/chat')}
              />
            }
          />
          <Route
            path="/orders"
            element={
              <AccountPage
                initialTab="orders"
                onNavigateSell={() => navigate('/sell')}
                onViewProduct={handleViewProduct}
                onOpenChat={() => navigate('/chat')}
              />
            }
          />
          <Route
            path="/wishlist"
            element={
              <AccountPage
                initialTab="wishlist"
                onNavigateSell={() => navigate('/sell')}
                onViewProduct={handleViewProduct}
                onOpenChat={() => navigate('/chat')}
              />
            }
          />

          {/* Cart & Checkout */}
          <Route
            path="/cart"
            element={
              <CartPage
                onContinueShopping={() => navigate('/shop')}
                onProceedCheckout={() => navigate('/checkout')}
                onViewProduct={handleViewProduct}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <CheckoutPage
                onBackToCart={() => navigate('/cart')}
                onGoToOrderList={() => navigate('/orders')}
              />
            }
          />

          {/* Sell / Upload New Dress */}
          <Route
            path="/sell"
            element={
              <SellPage
                onSuccess={(newId) => {
                  handleViewProduct(newId);
                }}
                onCancel={() => navigate('/')}
              />
            }
          />
          <Route
            path="/dang-vay"
            element={
              <SellPage
                onSuccess={(newId) => {
                  handleViewProduct(newId);
                }}
                onCancel={() => navigate('/')}
              />
            }
          />

          {/* Chat */}
          <Route
            path="/chat"
            element={
              <ChatPage
                onBack={() => navigate('/')}
                onViewProduct={handleViewProduct}
              />
            }
          />

          {/* Admin Management */}
          <Route
            path="/admin"
            element={<AdminPage onViewProduct={handleViewProduct} />}
          />

          {/* Catch-all redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Rental Calendar Quick Modal */}
      {calendarProduct && FEATURES.ONLINE_BOOKING && (
        <RentalCalendarModal
          product={calendarProduct}
          onClose={() => setCalendarProduct(null)}
          onSuccess={() => {
            // Optional redirect or toast handled by modal
          }}
        />
      )}

      {/* Floating Hotline & Zalo Contact Widget (Tối ưu Responsive không che nút mua trên mobile) */}
      <div className="fixed bottom-4 right-3.5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2">
        {/* Mobile View: 2 nút tròn gọn gàng bên góc phải không choán màn hình */}
        <div className="flex sm:hidden flex-col items-end gap-2">
          <a
            href="tel:0795623097"
            className="w-10 h-10 rounded-full bg-white text-brand-600 border border-brand-200/80 shadow-lg shadow-black/10 flex items-center justify-center active:scale-90 transition-transform"
            title="Gọi Hotline: 079 562 3097"
          >
            <Phone className="w-4 h-4 text-brand-600" />
          </a>
          <a
            href="https://zalo.me/0795623097"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#0068FF] to-[#0091FF] text-white shadow-xl shadow-blue-500/40 flex items-center justify-center relative active:scale-90 transition-transform"
            title="Chat Zalo hỗ trợ"
          >
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
            <ZaloIcon className="w-6 h-6 fill-white" />
          </a>
        </div>

        {/* Desktop View: Thanh pill đầy đủ chữ kèm icon đẹp mắt */}
        <div className="hidden sm:flex flex-col items-end gap-2.5">
          <a
            href="https://zalo.me/0795623097"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#0068FF] to-[#0084FF] hover:from-[#005ce6] hover:to-[#0077e6] text-white shadow-lg shadow-blue-500/25 text-xs font-bold transition-all hover:scale-105 group"
          >
            <div className="w-4 h-4 bg-white/20 rounded-md p-0.5 flex items-center justify-center">
              <ZaloIcon className="w-full h-full fill-white" />
            </div>
            <span>Chat Zalo</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5"></span>
          </a>

          <a
            href="tel:0795623097"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/25 text-xs font-bold transition-all hover:scale-105"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Hotline: 079 562 3097</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <OrderProvider>
              <ChatProvider>
                <AppContent />
              </ChatProvider>
            </OrderProvider>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
