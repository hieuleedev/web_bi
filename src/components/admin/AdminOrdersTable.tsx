import React, { useState, useEffect, useMemo } from 'react';
import { Search, Printer } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { formatVND, formatDateVN } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';
import { Pagination } from '../ui/Pagination';
import { OrderInvoiceModal } from '../order/OrderInvoiceModal';

interface AdminOrdersTableProps {
  orders: Order[];
  searchPhone: string;
  onSearchPhoneChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export const AdminOrdersTable: React.FC<AdminOrdersTableProps> = ({
  orders,
  searchPhone,
  onSearchPhoneChange,
  statusFilter,
  onStatusFilterChange,
  onUpdateStatus,
}) => {
  const { showToast } = useToast();

  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchPhone, statusFilter]);

  const totalPages = Math.ceil(orders.length / PAGE_SIZE);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return orders.slice(start, start + PAGE_SIZE);
  }, [orders, currentPage, PAGE_SIZE]);

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-100">
        <div>
          <h3 className="font-serif font-bold text-base text-gray-900">
            Danh Sách Đơn Hàng & Hợp Đồng Thuê
          </h3>
          <p className="text-xs text-gray-500">Xem và cập nhật trạng thái đơn, xử lý hoàn cọc</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              placeholder="Tìm theo SĐT khách..."
              value={searchPhone}
              onChange={(e) => onSearchPhoneChange(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-mono text-gray-900 focus:outline-none focus:border-brand-500"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-800 font-medium"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="preparing">Đang chuẩn bị</option>
            <option value="shipping">Đang giao hàng</option>
            <option value="rented">Đang thuê</option>
            <option value="returned">Đã trả (Chờ hoàn cọc)</option>
            <option value="completed">Đã hoàn tất</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-600">
          <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-700 font-semibold border-y border-gray-200">
            <tr>
              <th className="py-3 px-4">Mã Đơn</th>
              <th className="py-3 px-4">Khách Hàng & SĐT</th>
              <th className="py-3 px-4">Sản Phẩm & Lịch</th>
              <th className="py-3 px-4">Tổng Tiền / Cọc</th>
              <th className="py-3 px-4">Thanh Toán</th>
              <th className="py-3 px-4">Trạng Thái Đơn</th>
              <th className="py-3 px-4 text-right">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-brand-700">
                  {order.code}
                </td>

                <td className="py-3.5 px-4">
                  <div className="font-semibold text-gray-900">{order.customerName}</div>
                  <div className="font-mono text-gray-500 text-[11px]">{order.customerPhone}</div>
                  <div className="text-[10px] text-gray-400 truncate max-w-[150px]">{order.shippingAddress}</div>
                </td>

                <td className="py-3.5 px-4">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="mb-1">
                      <span className="font-medium text-gray-900 block truncate max-w-xs">{it.productTitle}</span>
                      {it.mode === 'rent' ? (
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                          Thuê: {formatDateVN(it.rentalStartDate)} → {formatDateVN(it.rentalEndDate)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                          Mua (SL: {it.quantity})
                        </span>
                      )}
                    </div>
                  ))}
                </td>

                <td className="py-3.5 px-4">
                  <div className="font-bold text-gray-900">{formatVND(order.totalAmount)}</div>
                  {order.depositTotal > 0 && (
                    <div className="text-[10px] text-amber-600 font-medium">
                      Cọc: {formatVND(order.depositTotal)}
                    </div>
                  )}
                </td>

                <td className="py-3.5 px-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán (COD)'}
                  </span>
                </td>

                <td className="py-3.5 px-4">
                  <select
                    value={order.status}
                    onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                    className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs font-semibold text-gray-800 focus:outline-none focus:border-brand-500"
                  >
                    <option value="pending">Chờ xác nhận</option>
                    <option value="preparing">Đang chuẩn bị</option>
                    <option value="shipping">Đang giao hàng</option>
                    <option value="rented">Đang trong kỳ thuê</option>
                    <option value="returned">Đã nhận lại đồ (Chờ kiểm cọc)</option>
                    <option value="completed">Đã hoàn thành / Đã hoàn cọc</option>
                    <option value="cancelled">Hủy đơn</option>
                  </select>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedOrderForInvoice(order)}
                      title="Xem và In Hóa Đơn (Bill)"
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-brand-50 hover:border-brand-300 text-gray-700 hover:text-brand-800 transition-colors inline-flex items-center gap-1.5 text-[11px] font-semibold"
                    >
                      <Printer className="w-3.5 h-3.5 text-brand-600" />
                      <span>In Bill</span>
                    </button>

                    {order.status === 'returned' && (
                      <button
                        onClick={() => {
                          onUpdateStatus(order.id, 'completed');
                          showToast(`Đã xác nhận hoàn cọc ${formatVND(order.depositTotal)} cho khách ${order.customerName}`, 'success');
                        }}
                        className="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap"
                      >
                        Hoàn cọc
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phân trang danh sách đơn hàng */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={orders.length}
        pageSize={PAGE_SIZE}
        itemsName="đơn hàng"
        onPageChange={setCurrentPage}
      />

      {/* Modal In Bill Hóa Đơn Cho Admin */}
      <OrderInvoiceModal
        order={selectedOrderForInvoice}
        isOpen={!!selectedOrderForInvoice}
        onClose={() => setSelectedOrderForInvoice(null)}
      />
    </div>
  );
};
