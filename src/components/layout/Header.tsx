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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs transition-all">
      {/* Top bar with Hotline, Zalo and Login */}
      <div className="bg-dark-900 text-brand-100 text-xs py-1.5 sm:py-2 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Hotline / Address info */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse"></span>
            <a
              href="tel:0795623097"
              className="hover:text-white transition-colors truncate font-medium"
              title="Gọi hotline Bi Bi"
            >
              <span className="text-gray-300">Núi Thành: </span>
              <strong className="text-white font-mono font-bold">(+84) 79 562 3097</strong>
            </a>
            <span className="hidden md:inline text-gray-400">• Miễn phí giặt hấp chuẩn 5 sao</span>
          </div>

          {/* Right Action Shortcuts */}
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] shrink-0">
            {/* Zalo Direct Chat */}
            <a
              href="https://zalo.me/0795623097"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-colors text-[10px] sm:text-[11px] whitespace-nowrap shadow-xs"
            >
              <span>Chat Zalo</span>
            </a>

            {/* Shop management shortcut if user is seller or admin */}
            {isOwnerOrAdmin && (
              <button
                onClick={() => goTo('/quan-ly-shop', 'my-products')}
                className="hidden sm:flex items-center gap-1 text-emerald-300 hover:text-emerald-200 transition-colors font-semibold whitespace-nowrap bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-500/40"
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
                className="hidden md:flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors font-semibold whitespace-nowrap"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Quản Trị Admin</span>
              </button>
            )}

            {/* Auth Action */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-gray-300 text-[10px] sm:text-xs">
                  <span className="hidden sm:inline">Chào, </span>
                  <strong className="text-white max-w-[70px] sm:max-w-[120px] truncate inline-block align-bottom">{currentUser.name}</strong>
                </span>
                <button
                  onClick={logout}
                  className="text-gray-400 hover:text-rose-400 transition-colors underline ml-1 text-[10px] sm:text-[11px]"
                >
                  Thoát
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1 text-brand-300 hover:text-white font-semibold transition-colors whitespace-nowrap text-[10px] sm:text-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng Nhập</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4 lg:gap-6">
          
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => goTo('/', 'home')}
              className="text-left group flex items-center gap-2 sm:gap-2.5"
            >
              <img
                src="/logo.jpg"
                alt="Bi Bi - Cho thuê đồ Núi Thành"
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover shadow-xs group-hover:scale-105 transition-transform border border-brand-200 shrink-0"
              />
              <div className="whitespace-nowrap">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-gray-900 group-hover:text-brand-600 transition-colors">
                  Bi Bi
                </span>
                <span className="block text-[8px] sm:text-[10px] uppercase tracking-wider text-brand-600 font-semibold -mt-0.5">
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
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Chat Icon */}
            <button
              onClick={() => goTo('/chat', 'chat')}
              className="relative p-1.5 sm:p-2 text-gray-700 hover:text-brand-600 hover:bg-gray-50 rounded-full transition-colors shrink-0"
              title="Tin nhắn trò chuyện"
            >
              <MessageSquare className="w-5 h-5" />
              {totalUnreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-brand-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                  {totalUnreadCount}
                </span>
              )}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => goTo('/wishlist', 'wishlist')}
              className="relative p-1.5 sm:p-2 text-gray-700 hover:text-rose-500 hover:bg-gray-50 rounded-full transition-colors shrink-0"
              title="Sản phẩm yêu thích"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => goTo('/cart', 'cart')}
              className="relative p-1.5 sm:p-2 text-gray-700 hover:text-brand-600 hover:bg-gray-50 rounded-full transition-colors flex items-center shrink-0"
              title="Giỏ hàng & Đơn thuê"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-brand-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                  {totalCount}
                </span>
              )}
            </button>

            {/* User Profile dropdown (Desktop) */}
            <div className="relative shrink-0 hidden sm:block">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-full border border-gray-200 hover:border-brand-400 hover:shadow-xs transition-all text-left bg-white shrink-0"
              >
                {currentUser ? (
                  <>
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-brand-500/30 shrink-0"
                    />
                    <span className="hidden xl:inline text-xs font-medium text-gray-800 max-w-[85px] truncate">
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
              className="md:hidden p-1.5 sm:p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors shrink-0"
              aria-label="Mở menu điều hướng"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-brand-600" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-3.5 pt-3 pb-6 space-y-3.5 shadow-xl max-h-[85vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Mobile search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm mẫu váy, áo dài, dạ hội..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-gray-400"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Quick search suggestion tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
            <span className="text-gray-400 shrink-0 text-[10px] font-medium">Gợi ý:</span>
            {['Đầm Dạ Hội', 'Áo Dài', 'Váy Đi Tiệc', 'Vest', 'Free Size'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchInput(tag);
                  if (onSearch) onSearch(tag);
                  goTo('/shop', 'shop');
                  setMobileMenuOpen(false);
                }}
                className="px-2.5 py-1 bg-gray-100 hover:bg-brand-50 hover:text-brand-600 text-gray-700 rounded-full shrink-0 font-medium transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Navigation 2-col cards */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {navItems.map((item) => {
              const active = isCurrent(item.path, item.view);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    goTo(item.path, item.view);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between p-3 rounded-2xl text-xs font-semibold border transition-all text-left ${
                    active
                      ? 'bg-brand-50 border-brand-300 text-brand-700 shadow-xs'
                      : item.highlight
                      ? 'bg-brand-100/70 border-brand-200 text-brand-800'
                      : 'border-gray-100 bg-gray-50/70 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.icon ? (
                      <item.icon className="w-4 h-4 text-brand-600 shrink-0" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-brand-500 shrink-0" />
                    )}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick shortcuts list */}
          <div className="border-t border-gray-100 pt-3 flex flex-col gap-1 text-xs">
            {isOwnerOrAdmin && (
              <button
                onClick={() => { goTo('/quan-ly-shop', 'my-products'); setMobileMenuOpen(false); }}
                className="p-2.5 text-left text-emerald-800 font-semibold bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Quản lý kho váy & đơn hàng</span>
                </div>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">Shop</span>
              </button>
            )}
            <button
              onClick={() => { goTo('/orders', 'orders'); setMobileMenuOpen(false); }}
              className="p-2.5 text-left text-gray-700 font-medium hover:bg-gray-50 rounded-xl flex items-center gap-2.5 transition-colors"
            >
              <Package className="w-4 h-4 text-gray-400 shrink-0" />
              <span>Đơn hàng & Lịch thuê của tôi</span>
            </button>
            <button
              onClick={() => { goTo('/chat', 'chat'); setMobileMenuOpen(false); }}
              className="p-2.5 text-left text-brand-700 font-medium hover:bg-brand-50/60 rounded-xl flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Nhắn tin trò chuyện với Chủ Shop</span>
              </div>
              {totalUnreadCount > 0 && (
                <span className="text-[10px] bg-brand-600 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                  {totalUnreadCount} mới
                </span>
              )}
            </button>
            <button
              onClick={() => { goTo('/account', 'account'); setMobileMenuOpen(false); }}
              className="p-2.5 text-left text-gray-700 font-medium hover:bg-gray-50 rounded-xl flex items-center gap-2.5 transition-colors"
            >
              <UserIcon className="w-4 h-4 text-gray-400 shrink-0" />
              <span>Thông tin tài khoản</span>
            </button>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => { goTo('/admin', 'admin'); setMobileMenuOpen(false); }}
                className="p-2.5 text-left text-amber-700 font-semibold hover:bg-amber-50 rounded-xl flex items-center gap-2.5 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Bảng điều khiển Quản trị</span>
              </button>
            )}
          </div>

          {/* User Account / Auth in Mobile Drawer */}
          <div className="pt-2 border-t border-gray-100">
            {currentUser ? (
              <div className="p-3 bg-brand-50/60 rounded-2xl border border-brand-100/90 space-y-2.5">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/30 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{currentUser.email}</p>
                    <span className="inline-block text-[10px] font-semibold text-brand-700 bg-white px-2 py-0.5 rounded-full border border-brand-200 mt-1">
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
                className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
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

