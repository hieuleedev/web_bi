import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  PlusCircle,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  User as UserIcon,
  ChevronDown,
  CalendarCheck,
  Package,
  Layers,
  Settings,
  LogOut,
  LogIn
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import { useChat } from '../../context/ChatContext';
import { UserRole } from '../../types';
import { AuthModal } from '../auth/AuthModal';

interface HeaderProps {
  currentView?: string;
  setCurrentView?: (view: string) => void;
  onOpenProductDetail?: (productId: string) => void;
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  onSearch,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { currentUser, switchRole, logout } = useAuth();
  const { totalCount } = useCart();
  const { wishlistIds } = useProducts();
  const { totalUnreadCount } = useChat();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    setIsAuthModalOpen(true);
  };

  const goTo = (path: string, view?: string) => {
    navigate(path);
    if (setCurrentView && view) {
      setCurrentView(view);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isCurrent = (path: string, view: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path) || currentView === view;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchInput);
      goTo('/shop', 'shop');
    }
  };

  const isOwnerOrAdmin = currentUser?.role === 'seller' || currentUser?.role === 'admin';

  const navItems = [
    { label: 'Trang Chủ', path: '/', view: 'home' },
    { label: 'Mua Quần Áo', path: '/shop', view: 'shop' },
    { label: 'Thuê Quần Áo', path: '/rent', view: 'rent', badge: 'Hot' },
    ...(isOwnerOrAdmin
      ? [
          { label: 'Quản Lý Shop', path: '/quan-ly-shop', view: 'my-products', icon: Layers, highlight: false },
          { label: 'Đăng Mẫu Váy', path: '/sell', view: 'sell', icon: PlusCircle, highlight: true }
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      {/* Top bar with Hotline, Zalo and Login */}
      <div className="bg-dark-900 text-brand-100 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="bg-brand-500/20 text-brand-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-brand-500/30 whitespace-nowrap">
              Hotline Cửa Hàng
            </span>
            <span className="truncate">Núi Thành - Đà Nẵng: <strong className="text-white">(+84) 79 562 3097</strong> • Miễn phí giặt hấp chuẩn 5 sao</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] shrink-0">
            {/* Zalo Direct Chat */}
            <a
              href="https://zalo.me/0795623097"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors whitespace-nowrap"
            >
              <span>Chat Zalo</span>
            </a>

            {/* Shop management shortcut if user is seller or admin */}
            {isOwnerOrAdmin && (
              <button
                onClick={() => goTo('/quan-ly-shop', 'my-products')}
                className="flex items-center gap-1 text-emerald-300 hover:text-emerald-200 transition-colors font-semibold whitespace-nowrap bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-500/40"
                title="Vào trang quản lý kho & đơn hàng"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Quản Lý Shop</span>
              </button>
            )}

            {/* Admin shortcut if user is admin */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => goTo('/admin', 'admin')}
                className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors font-semibold whitespace-nowrap"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Quản Trị Admin</span>
              </button>
            )}

            {/* Auth Action */}
            {currentUser ? (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-gray-300">
                  Chào, <strong>{currentUser.name}</strong> ({currentUser.role === 'admin' ? '🛡️ Admin' : currentUser.role === 'seller' ? '👑 Chủ Shop' : '🛍️ Khách Hàng'})
                </span>
                <button
                  onClick={logout}
                  className="text-gray-400 hover:text-rose-400 transition-colors underline ml-1"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1 text-brand-300 hover:text-white font-semibold transition-colors whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng Nhập / Đăng Ký</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3 lg:gap-6">
          
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => goTo('/', 'home')}
              className="text-left group flex items-center gap-2.5"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="whitespace-nowrap">
                <span className="font-serif text-2xl font-bold tracking-tight text-gray-900 group-hover:text-brand-600 transition-colors">
                  Bi Bi
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-brand-600 font-semibold -mt-0.5">
                  Cho thuê đồ Núi Thành
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 shrink-0">
            {navItems.map((item) => {
              const active = isCurrent(item.path, item.view);
              return (
                <button
                  key={item.path}
                  onClick={() => goTo(item.path, item.view)}
                  className={`relative px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                    active
                      ? 'text-brand-600 bg-brand-50 font-semibold shadow-xs'
                      : item.highlight
                      ? 'text-brand-700 bg-brand-100/80 hover:bg-brand-100 font-semibold border border-brand-200'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    {item.icon && <item.icon className="w-4 h-4 text-brand-600 shrink-0" />}
                    <span className="whitespace-nowrap">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-bold leading-tight">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden xl:flex items-center flex-1 max-w-[220px] 2xl:max-w-xs relative shrink"
          >
            <input
              type="text"
              placeholder="Tìm kiếm đầm dạ hội, áo dài..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-gray-400"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Chat Icon */}
            <button
              onClick={() => goTo('/chat', 'chat')}
              className="relative p-2 text-gray-700 hover:text-brand-600 hover:bg-gray-50 rounded-full transition-colors shrink-0"
              title="Tin nhắn trò chuyện"
            >
              <MessageSquare className="w-5 h-5" />
              {totalUnreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {totalUnreadCount}
                </span>
              )}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => goTo('/wishlist', 'wishlist')}
              className="relative p-2 text-gray-700 hover:text-rose-500 hover:bg-gray-50 rounded-full transition-colors shrink-0"
              title="Sản phẩm yêu thích"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => goTo('/cart', 'cart')}
              className="relative p-2 text-gray-700 hover:text-brand-600 hover:bg-gray-50 rounded-full transition-colors flex items-center gap-1.5 shrink-0"
              title="Giỏ hàng & Đơn thuê"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </button>

            {/* User Profile dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-full border border-gray-200 hover:border-brand-400 hover:shadow-sm transition-all text-left bg-white shrink-0"
              >
                {currentUser ? (
                  <>
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-brand-500/30 shrink-0"
                    />
                    <span className="hidden 2xl:inline text-xs font-medium text-gray-800 max-w-[85px] truncate">
                      {currentUser.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  </>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  {currentUser && (
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-900">{currentUser.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{currentUser.email}</p>
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-50 text-brand-700 border border-brand-200">
                        {currentUser.role === 'seller' ? '👑 Chủ shop / Người bán' : currentUser.role === 'admin' ? '🛡️ Quản trị viên' : '🛍️ Khách mua hàng'}
                      </div>
                    </div>
                  )}

                  {currentUser ? (
                    <>
                      <div className="py-1">
                        <button
                          onClick={() => goTo('/account', 'account')}
                          className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <span>Thông tin tài khoản</span>
                        </button>
                        <button
                          onClick={() => goTo('/orders', 'orders')}
                          className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Package className="w-4 h-4 text-gray-400" />
                          <span>Đơn hàng & Lịch thuê của tôi</span>
                        </button>
                        <button
                          onClick={() => goTo('/chat', 'chat')}
                          className="w-full px-4 py-2 text-left text-xs text-brand-600 hover:bg-brand-50 flex items-center gap-2 font-medium"
                        >
                          <MessageSquare className="w-4 h-4 text-brand-600" />
                          <span>Nhắn tin với Chủ Shop</span>
                        </button>
                        {isOwnerOrAdmin && (
                          <button
                            onClick={() => goTo('/quan-ly-shop', 'my-products')}
                            className="w-full px-4 py-2 text-left text-xs text-emerald-700 font-semibold hover:bg-emerald-50 flex items-center gap-2"
                          >
                            <Layers className="w-4 h-4 text-emerald-600" />
                            <span>Quản lý kho váy của shop (/quan-ly-shop)</span>
                          </button>
                        )}
                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => goTo('/admin', 'admin')}
                            className="w-full px-4 py-2 text-left text-xs text-amber-600 font-bold hover:bg-amber-50 flex items-center gap-2"
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-500" />
                            <span>Bảng Điều Khiển Quản Trị Hệ Thống</span>
                          </button>
                        )}
                      </div>

                      <div className="border-t border-gray-100 pt-1 mt-1">
                        <button
                          onClick={logout}
                          className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Đăng xuất tài khoản</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-3">
                      <p className="text-xs text-gray-600 mb-3 text-center">Bạn chưa đăng nhập vào hệ thống</p>
                      <button
                        onClick={openAuthModal}
                        className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Đăng Nhập / Đăng Ký</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-3">
          {/* Mobile search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm váy cưới, áo dài..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-10 pr-4 py-2 text-xs focus:outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {navItems.map((item) => {
              const active = isCurrent(item.path, item.view);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    goTo(item.path, item.view);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-medium border text-center ${
                    active
                      ? 'bg-brand-50 border-brand-300 text-brand-600 font-semibold'
                      : 'border-gray-200 text-gray-700'
                  }`}
                >
                  {item.icon && <item.icon className="w-4 h-4 text-brand-600" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-gray-100 pt-3 flex flex-col gap-1.5 text-xs">
            {isOwnerOrAdmin && (
              <button
                onClick={() => { goTo('/quan-ly-shop', 'my-products'); setMobileMenuOpen(false); }}
                className="p-2 text-left text-emerald-700 font-semibold hover:bg-emerald-50 rounded-lg flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Quản lý kho váy của shop (/quan-ly-shop)</span>
              </button>
            )}
            <button
              onClick={() => { goTo('/account', 'account'); setMobileMenuOpen(false); }}
              className="p-2 text-left text-gray-700 font-medium hover:bg-gray-50 rounded-lg flex items-center gap-2"
            >
              <UserIcon className="w-4 h-4 text-gray-400" />
              <span>Tài khoản cá nhân</span>
            </button>
            <button
              onClick={() => { goTo('/orders', 'orders'); setMobileMenuOpen(false); }}
              className="p-2 text-left text-gray-700 font-medium hover:bg-gray-50 rounded-lg flex items-center gap-2"
            >
              <Package className="w-4 h-4 text-gray-400" />
              <span>Đơn hàng & Đơn thuê</span>
            </button>
            <button
              onClick={() => { goTo('/admin', 'admin'); setMobileMenuOpen(false); }}
              className="p-2 text-left text-amber-600 font-semibold hover:bg-amber-50 rounded-lg flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Bảng điều khiển Quản trị</span>
            </button>
          </div>

          {/* User Account / Auth in Mobile Drawer */}
          <div className="pt-2 border-t border-gray-100">
            {currentUser ? (
              <div className="p-3 bg-brand-50/50 rounded-2xl border border-brand-100/80 space-y-2">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/30 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 truncate">{currentUser.name}</p>
                    <span className="inline-block text-[10px] font-semibold text-brand-700 bg-white px-2 py-0.5 rounded-full border border-brand-200 mt-0.5">
                      {currentUser.role === 'seller' ? '👑 Chủ shop' : currentUser.role === 'admin' ? '🛡️ Admin' : '🛍️ Khách mua'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất tài khoản</span>
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập / Đăng Ký Ngay</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal for Real Login / Registration */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </header>
  );
};

