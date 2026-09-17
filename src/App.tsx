import React, { useState } from 'react';
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
import { Product } from './types';

export function AppContent() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [calendarProduct, setCalendarProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleViewProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenRentalCalendar = (product: Product) => {
    setCalendarProduct(product);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f8]">
      {/* Header */}
      <Header
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenProductDetail={handleViewProduct}
        onSearch={handleSearch}
      />

      {/* Main Pages */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewProduct={handleViewProduct}
            onOpenRentalCalendar={handleOpenRentalCalendar}
            onSelectCategory={handleSelectCategory}
          />
        )}

        {currentView === 'shop' && (
          <ShopPage
            initialSearch={searchQuery}
            initialCategory={selectedCategory}
            onViewProduct={handleViewProduct}
            onOpenRentalCalendar={handleOpenRentalCalendar}
          />
        )}

        {currentView === 'rent' && (
          <RentPage
            onViewProduct={handleViewProduct}
            onOpenRentalCalendar={handleOpenRentalCalendar}
          />
        )}

        {currentView === 'product-detail' && selectedProductId && (
          <ProductDetailPage
            productId={selectedProductId}
            onBack={() => setCurrentView('shop')}
            onGoToCart={() => setCurrentView('cart')}
          />
        )}

        {currentView === 'cart' && (
          <CartPage
            onContinueShopping={() => setCurrentView('shop')}
            onProceedCheckout={() => setCurrentView('checkout')}
            onViewProduct={handleViewProduct}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            onBackToCart={() => setCurrentView('cart')}
            onGoToOrderList={() => setCurrentView('orders')}
          />
        )}

        {currentView === 'sell' && (
          <SellPage
            onSuccess={(newId) => {
              handleViewProduct(newId);
            }}
            onCancel={() => setCurrentView('home')}
          />
        )}

        {(currentView === 'account' ||
          currentView === 'orders' ||
          currentView === 'my-products' ||
          currentView === 'wishlist') && (
          <AccountPage
            initialTab={
              currentView === 'orders'
                ? 'orders'
                : currentView === 'my-products'
                ? 'my-products'
                : currentView === 'wishlist'
                ? 'wishlist'
                : 'overview'
            }
            onNavigateSell={() => setCurrentView('sell')}
            onViewProduct={handleViewProduct}
            onOpenChat={() => setCurrentView('chat')}
          />
        )}

        {currentView === 'chat' && (
          <ChatPage
            onBack={() => setCurrentView('home')}
            onViewProduct={handleViewProduct}
          />
        )}

        {currentView === 'admin' && (
          <AdminPage onViewProduct={handleViewProduct} />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Rental Calendar Quick Modal */}
      {calendarProduct && (
        <RentalCalendarModal
          product={calendarProduct}
          onClose={() => setCalendarProduct(null)}
          onSuccess={() => {
            // Optional redirect or toast handled by modal
          }}
        />
      )}
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
