import React, { useState, useMemo } from 'react';
import { ShieldCheck, Eye, Trash2 } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useOrders } from '../context/OrderContext';
import { formatVND } from '../utils/helpers';
import { OrderStatus, ProductStatus } from '../types';
import { useToast } from '../context/ToastContext';
import { AdminStatsCards } from '../components/admin/AdminStatsCards';
import { AdminOrdersTable } from '../components/admin/AdminOrdersTable';
import { AdminProductApprovals } from '../components/admin/AdminProductApprovals';

interface AdminPageProps {
  onViewProduct: (productId: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onViewProduct }) => {
  const { products, adminUpdateStatus, deleteProduct } = useProducts();
  const { orders, updateOrderStatus } = useOrders();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'approvals'>('orders');
  const [orderSearchPhone, setOrderSearchPhone] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Stats calculation
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders]);

  const totalRentals = useMemo(() => {
    return orders.reduce((sum, o) => sum + o.items.filter((i) => i.mode === 'rent').length, 0);
  }, [orders]);

  const pendingApprovals = useMemo(() => {
    return products.filter((p) => p.status === 'pending');
  }, [products]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (orderSearchPhone.trim() && !o.customerPhone.includes(orderSearchPhone.trim())) return false;
      return true;
    });
  }, [orders, statusFilter, orderSearchPhone]);

  return (
    <div className="bg-[#faf9f8] min-h-screen py-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Khu Vực Quản Trị Hệ Thống
              </span>
            </div>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
              Bảng Điều Khiển Quản Trị Sàn Bi Bi
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Quản lý toàn bộ đơn hàng mua & thuê, kiểm duyệt sản phẩm mới và theo dõi cọc
            </p>
          </div>
        </div>

        {/* 4 Metric Cards Component */}
        <AdminStatsCards
          totalRevenue={totalRevenue}
          ordersCount={orders.length}
          totalRentals={totalRentals}
          productsCount={products.length}
        />

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 bg-white rounded-2xl border border-gray-200 w-fit mb-6 shadow-sm">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Quản Lý Đơn Hàng & Lịch Thuê ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'approvals'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>Duyệt Sản Phẩm Mới</span>
            {pendingApprovals.length > 0 && (
              <span className="bg-rose-500 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                {pendingApprovals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'products'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tất Cả Sản Phẩm ({products.length})
          </button>
        </div>

        {/* TAB 1: ORDERS & RENTALS TABLE COMPONENT */}
        {activeTab === 'orders' && (
          <AdminOrdersTable
            orders={filteredOrders}
            searchPhone={orderSearchPhone}
            onSearchPhoneChange={setOrderSearchPhone}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onUpdateStatus={updateOrderStatus}
          />
        )}

        {/* TAB 2: PENDING APPROVALS COMPONENT */}
        {activeTab === 'approvals' && (
          <AdminProductApprovals
            products={pendingApprovals}
            onViewProduct={onViewProduct}
            onUpdateStatus={adminUpdateStatus}
          />
        )}

        {/* TAB 3: ALL PRODUCTS */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
            <h3 className="font-serif font-bold text-base text-gray-900">
              Toàn Bộ Danh Mục Sản Phẩm ({products.length})
            </h3>

            <div className="divide-y divide-gray-100">
              {products.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.featuredImage}
                      alt={p.title}
                      className="w-12 h-14 object-cover rounded-lg shrink-0"
                    />
                    <div>
                      <h4 className="font-semibold text-xs text-gray-900">{p.title}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                        <span>Shop: {p.sellerName}</span>
                        <span>•</span>
                        <span className="font-mono text-emerald-700 font-semibold">{formatVND(p.rentPrice1Day)}/ngày</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewProduct(p.id)}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                      title="Xem"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm(`Xác nhận xóa bài đăng "${p.title}" khỏi sàn Bi Bi và cơ sở dữ liệu?`)) {
                          await deleteProduct(p.id);
                          showToast('Đã xóa sản phẩm khỏi hệ thống và database!', 'success');
                        }
                      }}
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                      title="Xóa bài đăng"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
