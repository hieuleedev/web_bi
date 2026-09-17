import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Package,
  Layers,
  Heart,
  MessageSquare,
  Settings,
  LogOut,
  Calendar,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Edit3,
  PlusCircle,
  Star,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Search,
  CreditCard,
  FileText,
  Filter,
  Sparkles,
  Printer
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useOrders } from '../context/OrderContext';
import { formatVND, formatDateVN } from '../utils/helpers';
import { OrderStatus, ProductStatus, Product, Order } from '../types';
import { useToast } from '../context/ToastContext';
import { CATEGORIES } from '../data/initialCategories';
import { Pagination } from '../components/ui/Pagination';
import { ProductScheduleManagerModal } from '../components/product/ProductScheduleManagerModal';
import { QuickCreateOrderModal } from '../components/order/QuickCreateOrderModal';
import { BankConfigModal } from '../components/admin/BankConfigModal';
import { OrderInvoiceModal } from '../components/order/OrderInvoiceModal';
import { EditOrderModal } from '../components/order/EditOrderModal';
import { EditProductModal } from '../components/product/EditProductModal';

interface AccountPageProps {
  initialTab?: string;
  onNavigateSell: () => void;
  onViewProduct: (productId: string) => void;
  onOpenChat: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  initialTab = 'overview',
  onNavigateSell,
  onViewProduct,
  onOpenChat,
}) => {
  const { currentUser, updateProfile, changePassword, logout } = useAuth();
  const { products, deleteProduct, updateProduct, wishlistIds } = useProducts();
  const { getUserOrders, getSellerOrders, updateOrderStatus, updateOrder, deleteOrder } = useOrders();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [scheduleProduct, setScheduleProduct] = useState<Product | null>(null);

  // Warehouse Search, Filter & Pagination states
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('all');
  const [productRentalFilter, setProductRentalFilter] = useState<'all' | 'renting_now' | 'available' | 'hidden'>('all');
  const [productTypeFilter, setProductTypeFilter] = useState<'all' | 'rent' | 'buy' | 'both'>('all');
  const [productPage, setProductPage] = useState(1);
  const productsPerPage = 6;

  // Modals for Quick Order & Bank Config & Bill Printing & Editing
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [quickOrderInitialProdId, setQuickOrderInitialProdId] = useState<string | undefined>(undefined);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Profile edit state
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [bio, setBio] = useState(currentUser?.bio || '');

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Orders filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <h3 className="font-bold text-gray-800">Vui lòng đăng nhập để xem thông tin tài khoản</h3>
      </div>
    );
  }

  // Filter user's products
  const myProducts = products.filter((p) => p.sellerId === currentUser.id);

  // Filter buyer orders
  const myOrders = getUserOrders(currentUser.id);

  // Filter seller incoming orders
  const sellerOrders = getSellerOrders(currentUser.id);

  // Wishlist products
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ name, phone, location, bio });
    showToast('Đã cập nhật thông tin cá nhân lên hệ thống thành công!', 'success');
  };

  const isOwner = currentUser.role === 'seller' || currentUser.role === 'admin';

  const menuTabs = [
    { id: 'overview', label: 'Tổng quan tài khoản', icon: UserIcon },
    ...(isOwner
      ? [
          { id: 'my-products', label: `Quản lý kho váy (${myProducts.length})`, icon: Layers },
          { id: 'seller-orders', label: `Đơn khách đặt thuê/mua (${sellerOrders.length})`, icon: Calendar },
        ]
      : []),
    { id: 'orders', label: `Lịch sử đơn mua & thuê (${myOrders.length})`, icon: Package },
    { id: 'wishlist', label: `Váy yêu thích (${wishlistProducts.length})`, icon: Heart },
    { id: 'profile', label: 'Chỉnh sửa thông tin', icon: Settings },
  ];

  return (
    <div className="bg-[#faf9f8] min-h-screen py-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* User Card Top */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-brand-500/20 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h1 className="font-serif text-xl font-bold text-gray-900">{currentUser.name}</h1>
                <span className="bg-brand-50 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-200">
                  {currentUser.role === 'seller' ? 'Chủ Shop' : currentUser.role === 'admin' ? 'Quản Trị Viên' : 'Khách Mua Hàng'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-3 justify-center md:justify-start">
                <span>{currentUser.email}</span>
                <span>•</span>
                <span>{currentUser.phone}</span>
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-600 justify-center md:justify-start">
                <div className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{currentUser.rating} ({currentUser.ratingCount} đánh giá)</span>
                </div>
                <span>•</span>
                <span>Tham gia: {currentUser.joinedDate}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {isOwner && (
              <button
                onClick={onNavigateSell}
                className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Đăng Mẫu Váy Mới</span>
              </button>
            )}
            <button
              onClick={onOpenChat}
              className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-brand-600" />
              <span>Tin nhắn với shop</span>
            </button>
          </div>
        </div>

        {/* 2-column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Menu (3 cols) */}
          <div className="lg:col-span-3 space-y-2">
            <div className="bg-white rounded-3xl p-3 border border-gray-100 shadow-sm space-y-1">
              {menuTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all text-left ${
                    activeTab === tab.id
                      ? 'bg-brand-50 text-brand-700 font-bold shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-brand-600' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                </button>
              ))}

              <div className="pt-2 border-t border-gray-100 mt-2">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Đăng xuất tài khoản</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Tab Content (9 cols) */}
          <div className="lg:col-span-9">
            
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                    <span className="text-xs text-gray-500 font-medium">Sản phẩm đang kinh doanh</span>
                    <h3 className="font-serif text-2xl font-bold text-gray-900 mt-1">{myProducts.length}</h3>
                    <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Sẵn sàng bán & cho thuê</span>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                    <span className="text-xs text-gray-500 font-medium">Đơn hàng mua & thuê</span>
                    <h3 className="font-serif text-2xl font-bold text-gray-900 mt-1">{myOrders.length}</h3>
                    <span className="text-[11px] text-brand-600 font-semibold mt-1 block">Đang giao dịch</span>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                    <span className="text-xs text-gray-500 font-medium">Sản phẩm đã thích</span>
                    <h3 className="font-serif text-2xl font-bold text-gray-900 mt-1">{wishlistProducts.length}</h3>
                    <span className="text-[11px] text-rose-500 font-semibold mt-1 block">Trong danh sách ước</span>
                  </div>
                </div>

                {/* Bio & Intro */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                  <h3 className="font-serif font-bold text-base text-gray-900">Giới Thiệu Bản Thân / Cửa Hàng</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {currentUser.bio || 'Chưa cập nhật phần giới thiệu. Nhấp vào tab "Chỉnh sửa thông tin" để cập nhật!'}
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="w-4 h-4 text-brand-600" />
                    <span>Địa chỉ: <strong>{currentUser.location}</strong></span>
                  </div>
                </div>

                {/* Recent Orders Preview */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base text-gray-900">Đơn Hàng Gần Đây</h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-800"
                    >
                      Xem tất cả
                    </button>
                  </div>

                  {myOrders.slice(0, 2).map((order) => (
                    <div key={order.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <span className="text-xs font-mono font-bold text-brand-700">{order.code}</span>
                        <h4 className="text-xs font-medium text-gray-900 mt-0.5">
                          {order.items.map((i) => i.productTitle).join(', ')}
                        </h4>
                        <span className="text-[11px] text-gray-500">Ngày đặt: {formatDateVN(order.createdAt)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-900 block">{formatVND(order.totalAmount)}</span>
                        <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: MY PRODUCTS */}
            {activeTab === 'my-products' && (() => {
              const todayDate = new Date().toISOString().split('T')[0];

              // Filtering logic
              const filteredMyProducts = myProducts.filter((p) => {
                // Search query: match title or sku or id
                if (productSearch.trim()) {
                  const q = productSearch.toLowerCase().trim();
                  const matchTitle = p.title.toLowerCase().includes(q);
                  const matchSku = p.sku ? p.sku.toLowerCase().includes(q) : false;
                  const matchId = p.id.toLowerCase().includes(q);
                  if (!matchTitle && !matchSku && !matchId) return false;
                }

                // Category filter
                if (productCategory !== 'all' && p.category !== productCategory) {
                  return false;
                }

                // Type filter (rent/buy/both)
                if (productTypeFilter !== 'all') {
                  if (productTypeFilter === 'rent' && p.type !== 'rent' && p.type !== 'both') return false;
                  if (productTypeFilter === 'buy' && p.type !== 'buy' && p.type !== 'both') return false;
                  if (productTypeFilter === 'both' && p.type !== 'both') return false;
                }

                // Rental status filter
                const isCurrentlyRented = (p.bookedDates || []).some(
                  (b) => b.startDate <= todayDate && b.endDate >= todayDate && b.status !== 'cancelled'
                );

                if (productRentalFilter === 'renting_now') {
                  return isCurrentlyRented;
                }
                if (productRentalFilter === 'available') {
                  return p.status === 'approved' && !isCurrentlyRented;
                }
                if (productRentalFilter === 'hidden') {
                  return p.status === 'hidden';
                }

                return true;
              });

              // Pagination
              const totalProductPages = Math.ceil(filteredMyProducts.length / productsPerPage) || 1;
              const paginatedMyProducts = filteredMyProducts.slice(
                (productPage - 1) * productsPerPage,
                productPage * productsPerPage
              );

              // Count currently rented products today
              const totalRentingNow = myProducts.filter((p) =>
                (p.bookedDates || []).some(
                  (b) => b.startDate <= todayDate && b.endDate >= todayDate && b.status !== 'cancelled'
                )
              ).length;

              return (
                <div className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-100 shadow-sm space-y-6">
                  {/* Top Bar: Title & Action Buttons */}
                  <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-serif font-bold text-xl text-gray-900 flex items-center gap-2.5">
                        <span>Quản Lý Kho Váy Của Tôi</span>
                        <span className="text-xs bg-brand-50 text-brand-700 font-bold px-2.5 py-0.5 rounded-full border border-brand-200">
                          {filteredMyProducts.length}/{myProducts.length} món
                        </span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Hiện có <strong className="text-emerald-600 font-semibold">{totalRentingNow} món</strong> đang được khách thuê hôm nay • Dễ dàng lên đơn và in bill trực tiếp
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={() => {
                          setQuickOrderInitialProdId(undefined);
                          setIsQuickOrderOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                        title="Tạo đơn hàng nhanh cho khách đến tiệm hoặc gọi điện"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>+ Tạo Đơn Hàng Mới</span>
                      </button>

                      <button
                        onClick={() => setIsBankModalOpen(true)}
                        className="px-3.5 py-2 rounded-xl border border-gray-200 hover:border-brand-400 bg-gray-50 hover:bg-white text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
                        title="Cấu hình tài khoản ngân hàng để in bill và sinh mã VietQR"
                      >
                        <CreditCard className="w-4 h-4 text-brand-600" />
                        <span>Cài Đặt STK In Bill</span>
                      </button>

                      <button
                        onClick={onNavigateSell}
                        className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Đăng Thêm Váy</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter & Search Controls */}
                  <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/70 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
                      {/* Search Bar (5 cols) */}
                      <div className="lg:col-span-5 relative">
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => {
                            setProductSearch(e.target.value);
                            setProductPage(1);
                          }}
                          placeholder="Tìm kiếm theo tên đầm, mã SKU (BB-...)..."
                          className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-gray-400"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>

                      {/* Category Filter (3 cols) */}
                      <div className="lg:col-span-3">
                        <select
                          value={productCategory}
                          onChange={(e) => {
                            setProductCategory(e.target.value);
                            setProductPage(1);
                          }}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:border-brand-500"
                        >
                          <option value="all">Tất cả danh mục ({CATEGORIES.length})</option>
                          {CATEGORIES.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Rental Status Filter (2 cols) */}
                      <div className="lg:col-span-2">
                        <select
                          value={productRentalFilter}
                          onChange={(e) => {
                            setProductRentalFilter(e.target.value as any);
                            setProductPage(1);
                          }}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:border-brand-500"
                        >
                          <option value="all">Tất cả trạng thái</option>
                          <option value="renting_now">🟢 Đang cho thuê hiện tại</option>
                          <option value="available">⚪ Sẵn sàng trong kho</option>
                          <option value="hidden">👁️ Đã ẩn đi</option>
                        </select>
                      </div>

                      {/* Product Type Filter (2 cols) */}
                      <div className="lg:col-span-2">
                        <select
                          value={productTypeFilter}
                          onChange={(e) => {
                            setProductTypeFilter(e.target.value as any);
                            setProductPage(1);
                          }}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:border-brand-500"
                        >
                          <option value="all">Bán & Thuê</option>
                          <option value="rent">Chỉ Cho Thuê</option>
                          <option value="buy">Chỉ Bán Đứt</option>
                          <option value="both">Cả Bán & Thuê</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Product List */}
                  {paginatedMyProducts.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {paginatedMyProducts.map((p) => {
                        const activeBookingToday = (p.bookedDates || []).find(
                          (b) => b.startDate <= todayDate && b.endDate >= todayDate && b.status !== 'cancelled'
                        );
                        const isRentingNow = !!activeBookingToday;
                        const categoryObj = CATEGORIES.find((c) => c.id === p.category);
                        const skuDisplay = p.sku || (p.id ? p.id.replace('prod-', 'BB-') : 'BB-001');

                        return (
                          <div
                            key={p.id}
                            className={`py-4.5 px-3 rounded-2xl transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                              isRentingNow ? 'bg-emerald-50/40 border border-emerald-100/80 mb-2' : 'hover:bg-gray-50/60'
                            }`}
                          >
                            <div className="flex gap-4">
                              <div className="relative shrink-0">
                                <img
                                  src={p.featuredImage}
                                  alt={p.title}
                                  className="w-20 h-24 rounded-2xl object-cover shadow-xs border border-gray-100"
                                />
                                {isRentingNow && (
                                  <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white p-1 rounded-full shadow-xs" title="Đang có khách thuê hôm nay">
                                    <Clock className="w-3 h-3 animate-spin" />
                                  </span>
                                )}
                              </div>

                              <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {/* SKU Code */}
                                  <span className="text-[11px] font-mono font-bold bg-gray-900 text-amber-400 px-2 py-0.5 rounded-lg tracking-wider">
                                    Mã: {skuDisplay}
                                  </span>

                                  {/* Category Tag */}
                                  <span className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg border border-gray-200">
                                    {categoryObj ? categoryObj.name : p.category}
                                  </span>

                                  {/* Type */}
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-brand-50 text-brand-700 border border-brand-200">
                                    {p.type === 'both' ? 'Bán & Thuê' : p.type === 'rent' ? 'Cho thuê' : 'Bán'}
                                  </span>

                                  {/* Status */}
                                  {isRentingNow ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                      <span>🟢 Đang cho thuê</span>
                                      <span className="text-emerald-700">({formatDateVN(activeBookingToday.startDate)} → {formatDateVN(activeBookingToday.endDate)})</span>
                                    </span>
                                  ) : p.status === 'hidden' ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gray-200 text-gray-700">
                                      Đã ẩn
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      Sẵn sàng trong kho
                                    </span>
                                  )}
                                </div>

                                <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{p.title}</h4>
                                
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                                  {p.rentPrice3Days && (
                                    <span>Giá thuê 3 ngày: <strong className="text-brand-700">{formatVND(p.rentPrice3Days)}</strong></span>
                                  )}
                                  {p.buyPrice && (
                                    <span>Giá bán: <strong className="text-gray-900">{formatVND(p.buyPrice)}</strong></span>
                                  )}
                                  {p.deposit && (
                                    <span>Cọc: <strong className="text-gray-700">{formatVND(p.deposit)}</strong></span>
                                  )}
                                </div>

                                <div className="text-[11px] text-gray-400 flex items-center gap-3 pt-0.5">
                                  <span>Lượt xem: {p.views}</span>
                                  <span>•</span>
                                  <span>Yêu thích: {p.likes}</span>
                                  <span>•</span>
                                  <span className="text-amber-500 font-semibold">Đánh giá: {p.rating}★ ({p.reviewsCount})</span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                              {/* Quick POS order for this product */}
                              <button
                                onClick={() => {
                                  setQuickOrderInitialProdId(p.id);
                                  setIsQuickOrderOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                                title="Tạo đơn hàng nhanh cho váy này"
                              >
                                <ShoppingBag className="w-3.5 h-3.5 text-brand-600" />
                                <span>Lên đơn</span>
                              </button>

                              {(p.type === 'rent' || p.type === 'both') && (
                                <button
                                  onClick={() => setScheduleProduct(p)}
                                  className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                                  title="Quản lý lịch thuê của món này"
                                >
                                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Lịch thuê ({(p.bookedDates || []).length})</span>
                                </button>
                              )}

                              <button
                                onClick={() => setEditingProduct(p)}
                                className="px-2.5 py-1.5 rounded-xl border border-brand-200 bg-brand-50/70 hover:bg-brand-100 text-brand-700 text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                                title="Chỉnh sửa thông tin mẫu váy này"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-brand-600" />
                                <span>Sửa váy</span>
                              </button>

                              <button
                                onClick={() => onViewProduct(p.id)}
                                className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                                title="Xem chi tiết sản phẩm"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => {
                                  const newStatus = p.status === 'hidden' ? 'approved' : 'hidden';
                                  updateProduct(p.id, { status: newStatus });
                                  showToast(`Đã chuyển sản phẩm sang trạng thái ${newStatus === 'hidden' ? 'Ẩn' : 'Hiện'}`, 'info');
                                }}
                                className="px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                {p.status === 'hidden' ? 'Hiện lại' : 'Ẩn đi'}
                              </button>

                              <button
                                onClick={async () => {
                                  if (window.confirm(`Bạn có chắc chắn muốn xóa bài đăng "${p.title}" không? Hành động này sẽ xóa sản phẩm khỏi Database và không thể hoàn tác.`)) {
                                    await deleteProduct(p.id);
                                    showToast('Đã xóa bài đăng khỏi hệ thống thành công!', 'success');
                                  }
                                }}
                                className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Xóa bài đăng này"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400 text-xs space-y-2">
                      <p>Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.</p>
                      <button
                        onClick={() => {
                          setProductSearch('');
                          setProductCategory('all');
                          setProductRentalFilter('all');
                          setProductTypeFilter('all');
                        }}
                        className="text-brand-600 font-semibold underline text-xs"
                      >
                        Xóa toàn bộ bộ lọc
                      </button>
                    </div>
                  )}

                  {/* Pagination */}
                  {totalProductPages > 1 && (
                    <div className="pt-4 border-t border-gray-100">
                      <Pagination
                        currentPage={productPage}
                        totalPages={totalProductPages}
                        onPageChange={(p) => {
                          setProductPage(p);
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })()}

            {/* TAB: BUYER ORDERS */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
                <div className="pb-3 border-b border-gray-100">
                  <h3 className="font-serif font-bold text-lg text-gray-900">Đơn Hàng Mua & Thuê Của Tôi</h3>
                  <p className="text-xs text-gray-500">Theo dõi hành trình trang phục thuê và đồ mua</p>
                </div>

                {myOrders.length > 0 ? (
                  <div className="space-y-4">
                    {myOrders.map((order) => (
                      <div key={order.id} className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-gray-200/60">
                          <div>
                            <span className="font-mono font-bold text-brand-700 text-xs">{order.code}</span>
                            <span className="text-gray-400 text-xs ml-2">• {formatDateVN(order.createdAt)}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            order.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'rented'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.status === 'rented' ? 'Đang trong thời gian thuê' : order.status === 'returned' ? 'Đã hoàn trả đồ (Chờ kiểm cọc)' : order.status}
                          </span>
                        </div>

                        {/* Items in order */}
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <img
                                src={item.productImage}
                                alt={item.productTitle}
                                className="w-12 h-14 object-cover rounded-lg shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-xs text-gray-900 truncate">{item.productTitle}</h5>
                                <div className="text-[11px] text-gray-500">
                                  {item.mode === 'rent' ? (
                                    <span className="text-emerald-700 font-medium">
                                      Thuê {item.rentalDays} ngày ({formatDateVN(item.rentalStartDate)} → {formatDateVN(item.rentalEndDate)})
                                    </span>
                                  ) : (
                                    <span>Mua {item.quantity} sản phẩm • Size: {item.size}</span>
                                  )}
                                </div>
                              </div>
                              <span className="text-xs font-bold text-gray-900">{formatVND(item.price)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-gray-200/60 flex justify-between items-center text-xs">
                          <span className="text-gray-500">
                            Cọc: <strong>{formatVND(order.depositTotal)}</strong>
                          </span>
                          <span className="font-bold text-gray-900 text-sm">
                            Tổng thanh toán: <strong className="text-brand-600">{formatVND(order.totalAmount)}</strong>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400 text-xs">
                    Bạn chưa có đơn đặt hàng nào.
                  </div>
                )}
              </div>
            )}

            {/* TAB: SELLER INCOMING ORDERS */}
            {activeTab === 'seller-orders' && (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
                <div className="pb-3 border-b border-gray-100">
                  <h3 className="font-serif font-bold text-lg text-gray-900">Đơn Khách Đặt Của Shop</h3>
                  <p className="text-xs text-gray-500">Quản lý khách đặt mua và khách thuê đồ của bạn</p>
                </div>

                {sellerOrders.length > 0 ? (
                  <div className="space-y-4">
                    {sellerOrders.map((order) => (
                      <div key={order.id} className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
                        <div className="flex flex-wrap justify-between items-center pb-2 border-b border-gray-200/60 text-xs gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-brand-700">{order.code}</span>
                            <span className="text-gray-400">•</span>
                            <span className="font-semibold text-gray-800">{order.customerName}</span>
                          </div>
                          
                          {/* Order actions: Edit, Print bill, Call, Zalo, Delete */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              onClick={() => setEditingOrder(order)}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[11px] hover:bg-amber-100 flex items-center gap-1 transition-colors shadow-2xs"
                              title="Chỉnh sửa thông tin đơn hàng này"
                            >
                              <Edit3 className="w-3 h-3 text-amber-600" />
                              <span>Sửa đơn</span>
                            </button>
                            <button
                              onClick={() => setInvoiceOrder(order)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold text-[11px] hover:bg-indigo-100 flex items-center gap-1 transition-colors shadow-2xs"
                              title="In hóa đơn / bill"
                            >
                              <Printer className="w-3 h-3 text-indigo-600" />
                              <span>In bill</span>
                            </button>
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px] hover:bg-emerald-100 flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span>Gọi</span>
                            </a>
                            <a
                              href={`https://zalo.me/${order.customerPhone.replace(/\s+/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[11px] hover:bg-blue-100 flex items-center gap-1"
                            >
                              <span>Zalo</span>
                            </a>
                            <button
                              onClick={() => {
                                if (window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng ${order.code}? Thao tác này không thể hoàn tác.`)) {
                                  deleteOrder(order.id);
                                }
                              }}
                              className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Xóa đơn hàng"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-gray-600 space-y-1">
                          <p><strong>Địa chỉ giao / lấy:</strong> {order.shippingAddress || 'Khách nhận tại shop'}</p>
                          <p><strong>Sản phẩm:</strong> {order.items.map((i) => i.productTitle).join(', ')}</p>
                          {(() => {
                            const rentItem = order.items.find((i) => i.mode === 'rent' && i.rentalStartDate && i.rentalEndDate);
                            return rentItem ? (
                              <p className="text-emerald-700 font-medium">
                                📅 <strong>Lịch thuê:</strong> {formatDateVN(rentItem.rentalStartDate!)} ➔ {formatDateVN(rentItem.rentalEndDate!)} ({rentItem.rentalDays || 1} ngày)
                              </p>
                            ) : null;
                          })()}
                          {order.depositTotal > 0 ? (
                            <p className="text-amber-800 font-medium">
                              💰 <strong>Tiền cọc:</strong> {formatVND(order.depositTotal)}
                            </p>
                          ) : null}
                          {order.notes && (
                            <p className="italic text-gray-500 bg-white/60 p-1.5 rounded border border-gray-100">
                              <strong>Ghi chú:</strong> {order.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-gray-200/60 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Đổi trạng thái:</span>
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-800 focus:ring-1 focus:ring-brand-500"
                            >
                              <option value="pending">Chờ xác nhận</option>
                              <option value="preparing">Đang chuẩn bị</option>
                              <option value="shipping">Đang giao</option>
                              <option value="rented">Đang cho thuê</option>
                              <option value="returned">Đã nhận lại đồ</option>
                              <option value="completed">Đã hoàn cọc / Hoàn thành</option>
                              <option value="cancelled">Đã hủy đơn</option>
                            </select>
                          </div>

                          <div className="text-right">
                            <span className="text-gray-400 text-[10px] block">Tổng thanh toán</span>
                            <span className="font-bold text-sm text-brand-600">{formatVND(order.totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400 text-xs">
                    Chưa có đơn hàng nào từ khách.
                  </div>
                )}
              </div>
            )}

            {/* TAB: WISHLIST */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
                <div className="pb-3 border-b border-gray-100">
                  <h3 className="font-serif font-bold text-lg text-gray-900">Danh Sách Yêu Thích</h3>
                  <p className="text-xs text-gray-500">Các món đồ bạn đã bấm trái tim lưu lại</p>
                </div>

                {wishlistProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlistProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => onViewProduct(p.id)}
                        className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80 cursor-pointer hover:shadow-md transition-all flex gap-3"
                      >
                        <img
                          src={p.featuredImage}
                          alt={p.title}
                          className="w-16 h-20 object-cover rounded-xl shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-xs text-gray-900 truncate">{p.title}</h5>
                          <span className="text-[10px] text-gray-500 block mt-0.5">{p.brand}</span>
                          <div className="mt-2 text-xs font-bold text-brand-600">
                            {p.rentPrice1Day ? `${formatVND(p.rentPrice1Day)}/ngày` : formatVND(p.buyPrice)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400 text-xs">
                    Bạn chưa lưu sản phẩm nào vào danh sách yêu thích.
                  </div>
                )}
              </div>
            )}

            {/* TAB: EDIT PROFILE */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="pb-3 border-b border-gray-100">
                  <h3 className="font-serif font-bold text-lg text-gray-900">Thông Tin Cá Nhân & Liên Hệ</h3>
                  <p className="text-xs text-gray-500">Cập nhật họ tên, số điện thoại và địa chỉ để giao nhận nhanh chóng</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Họ và tên</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Số điện thoại</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-gray-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Địa chỉ mặc định</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Giới thiệu ngắn (Bio)</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors shadow-md shadow-brand-500/20"
                  >
                    Lưu Thông Tin Cá Nhân
                  </button>
                </div>
              </form>

              {/* Password Change Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newPassword !== confirmPassword) {
                    showToast('Mật khẩu xác nhận không khớp với mật khẩu mới!', 'error');
                    return;
                  }
                  const res = changePassword(oldPassword, newPassword);
                  if (res.success) {
                    showToast(res.message, 'success');
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  } else {
                    showToast(res.message, 'error');
                  }
                }}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4"
              >
                <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-base text-gray-900">Đổi Mật Khẩu Đăng Nhập</h3>
                    <p className="text-xs text-gray-500">Bảo mật tài khoản của bạn bằng mật khẩu mạnh</p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Bảo mật 2 lớp
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Nhập mật khẩu cũ"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Mật khẩu mới</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-colors"
                  >
                    Cập Nhật Mật Khẩu Mới
                  </button>
                </div>
              </form>
            </div>
            )}

          </div>

        </div>
      </div>

      {/* Modal Quản lý lịch thuê từng sản phẩm */}
      {scheduleProduct && (
        <ProductScheduleManagerModal
          product={scheduleProduct}
          onClose={() => setScheduleProduct(null)}
        />
      )}

      {/* Modal Tạo đơn hàng nhanh tại quầy (POS) */}
      <QuickCreateOrderModal
        isOpen={isQuickOrderOpen}
        initialProductId={quickOrderInitialProdId}
        onClose={() => {
          setIsQuickOrderOpen(false);
          setQuickOrderInitialProdId(undefined);
        }}
        onOrderCreated={(createdOrder) => {
          setInvoiceOrder(createdOrder);
        }}
      />

      {/* Modal Cấu hình STK Ngân Hàng VietQR In Bill */}
      <BankConfigModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        onUpdated={() => {
          showToast('Đã đồng bộ thông tin tài khoản in bill mới nhất!', 'success');
        }}
      />

      {/* Modal In Hóa Đơn Bill Ngay Lập Tức */}
      {invoiceOrder && (
        <OrderInvoiceModal
          isOpen={!!invoiceOrder}
          order={invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
        />
      )}

      {/* Modal Chỉnh Sửa Đơn Hàng Nhanh / Khách Đặt */}
      {editingOrder && (
        <EditOrderModal
          isOpen={!!editingOrder}
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onPrintBill={(ord) => {
            setEditingOrder(null);
            setInvoiceOrder(ord);
          }}
        />
      )}

      {/* Modal Chỉnh Sửa Thông Tin Váy / Sản Phẩm */}
      {editingProduct && (
        <EditProductModal
          isOpen={!!editingProduct}
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
};
