import React from 'react';
import { CheckCircle2, XCircle, Eye } from 'lucide-react';
import { Product, ProductStatus } from '../../types';
import { formatVND } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';

interface AdminProductApprovalsProps {
  products: Product[];
  onViewProduct: (productId: string) => void;
  onUpdateStatus: (productId: string, status: ProductStatus) => void;
}

export const AdminProductApprovals: React.FC<AdminProductApprovalsProps> = ({
  products,
  onViewProduct,
  onUpdateStatus,
}) => {
  const { showToast } = useToast();

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
      <div>
        <h3 className="font-serif font-bold text-base text-gray-900">
          Kiểm Duyệt Sản Phẩm Mới Đăng ({products.length})
        </h3>
        <p className="text-xs text-gray-500">Phê duyệt để trang phục hiển thị công khai trên sàn</p>
      </div>

      {products.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {products.map((p) => (
            <div key={p.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex gap-4">
                <img
                  src={p.featuredImage}
                  alt={p.title}
                  className="w-16 h-20 rounded-xl object-cover shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                    {p.type === 'both' ? 'Bán & Cho thuê' : p.type === 'rent' ? 'Cho thuê' : 'Bán'}
                  </span>
                  <h4 className="font-semibold text-xs text-gray-900 mt-1">{p.title}</h4>
                  <p className="text-[11px] text-gray-500 line-clamp-1">{p.description}</p>
                  <div className="text-[11px] text-gray-600 mt-1 flex gap-3">
                    <span>Người đăng: <strong>{p.sellerName}</strong></span>
                    <span>Giá thuê: <strong>{formatVND(p.rentPrice1Day)}</strong></span>
                    <span>Giá bán: <strong>{formatVND(p.buyPrice)}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewProduct(p.id)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem chi tiết</span>
                </button>

                <button
                  onClick={() => {
                    onUpdateStatus(p.id, 'approved');
                    showToast(`Đã duyệt sản phẩm "${p.title}" thành công!`, 'success');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Phê Duyệt</span>
                </button>

                <button
                  onClick={() => {
                    onUpdateStatus(p.id, 'rejected');
                    showToast(`Đã từ chối sản phẩm "${p.title}"`, 'info');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Từ Chối</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 text-xs">
          Không có sản phẩm nào đang chờ kiểm duyệt!
        </div>
      )}
    </div>
  );
};
