import React, { useState, useEffect } from "react";
import { X, Sparkles, DollarSign, Image, Layers, Tag, Check, RefreshCw } from "lucide-react";
import { Product } from "../../types";
import { useProducts } from "../../context/ProductContext";
import { useToast } from "../../context/ToastContext";
import { CATEGORIES } from "../../data/initialCategories";
import { formatVND } from "../../utils/helpers";

interface EditProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSaved?: (updatedProduct: Product) => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  product,
  onClose,
  onSaved,
}) => {
  const { updateProduct } = useProducts();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("party-dress");
  const [type, setType] = useState<"rent" | "buy" | "both">("rent");
  const [rentPrice1Day, setRentPrice1Day] = useState<number>(0);
  const [rentPrice2Days, setRentPrice2Days] = useState<number>(0);
  const [rentPrice3Days, setRentPrice3Days] = useState<number>(0);
  const [rentPrice7Days, setRentPrice7Days] = useState<number>(0);
  const [extraDayPrice, setExtraDayPrice] = useState<number>(50000);
  const [deposit, setDeposit] = useState<number>(0);
  const [buyPrice, setBuyPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [sizesStr, setSizesStr] = useState("S, M, L");
  const [colorsStr, setColorsStr] = useState("Trắng");
  const [material, setMaterial] = useState("");
  const [condition, setCondition] = useState("Mới 100%");
  const [featuredImage, setFeaturedImage] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (product) {
      setTitle(product.title || "");
      setSku(product.sku || (product.id ? product.id.replace("prod-", "BB-") : "BB-001"));
      setCategory(product.category || "party-dress");
      setType(product.type || "both");
      setRentPrice1Day(product.rentPrice1Day || 0);
      setRentPrice2Days(product.rentPrice2Days || 0);
      setRentPrice3Days(product.rentPrice3Days || 0);
      setRentPrice7Days(product.rentPrice7Days || 0);
      setExtraDayPrice(product.extraDayPrice || 50000);
      setDeposit(product.deposit || 0);
      setBuyPrice(product.buyPrice || 0);
      setOriginalPrice(product.originalPrice || 0);
      setSizesStr((product.sizes || []).join(", "));
      setColorsStr((product.colors || []).join(", "));
      setMaterial(product.material || "");
      setCondition(product.condition || "Mới 100%");
      setFeaturedImage(product.featuredImage || "");
      setDescription(product.description || "");
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleGenerateSku = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    setSku("BB-" + randomNum);
    showToast("Đã sinh mã SKU ngẫu nhiên!", "info");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("Vui lòng nhập tên váy!", "error");
      return;
    }

    const sizes = sizesStr.split(",").map((s) => s.trim()).filter(Boolean);
    const colors = colorsStr.split(",").map((c) => c.trim()).filter(Boolean);

    const updatedData: Partial<Product> = {
      title: title.trim(),
      sku: sku.trim() || "BB-001",
      category,
      type,
      rentPrice1Day: Number(rentPrice1Day) || undefined,
      rentPrice2Days: Number(rentPrice2Days) || undefined,
      rentPrice3Days: Number(rentPrice3Days) || undefined,
      rentPrice7Days: Number(rentPrice7Days) || undefined,
      extraDayPrice: Number(extraDayPrice) || undefined,
      deposit: Number(deposit) || undefined,
      buyPrice: Number(buyPrice) || undefined,
      originalPrice: Number(originalPrice) || undefined,
      sizes: sizes.length > 0 ? sizes : ["Freesize"],
      colors: colors.length > 0 ? colors : ["Mặc định"],
      material: material.trim(),
      condition: condition.trim(),
      featuredImage: featuredImage.trim(),
      description: description.trim(),
    };

    await updateProduct(product.id, updatedData);

    const updatedProduct: Product = {
      ...product,
      ...updatedData,
    };

    if (onSaved) {
      onSaved(updatedProduct);
    }

    showToast("Đã lưu thông tin mẫu váy thành công!", "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-brand-50 via-white to-brand-50/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-gray-900">
                Chỉnh Sửa Thông Tin Mẫu Váy
              </h3>
              <p className="text-xs text-brand-700 font-mono font-bold">
                Mã SKU: {sku}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Tên & Mã SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">Tên váy / Tiêu đề bài đăng *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500 font-medium"
                placeholder="Ví dụ: Đầm Trắng Nàng Thơ Cổ Vuông..."
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Mã sản phẩm (SKU) *</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-brand-700 uppercase focus:bg-white focus:outline-none focus:border-brand-500"
                  placeholder="BB-001"
                  required
                />
                <button
                  type="button"
                  onClick={handleGenerateSku}
                  className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
                  title="Tự sinh mã mới"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Danh mục & Hình thức */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Danh mục sản phẩm</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:border-brand-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Hình thức cung cấp</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-brand-500"
              >
                <option value="both">Cả Bán & Cho Thuê</option>
                <option value="rent">Chỉ Cho Thuê Theo Ngày</option>
                <option value="buy">Chỉ Bán Đứt</option>
              </select>
            </div>
          </div>

          {/* Bảng giá thuê & cọc */}
          <div className="bg-brand-50/40 p-4 rounded-2xl border border-brand-100 space-y-3">
            <h4 className="font-bold text-brand-900 text-xs flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-brand-600" />
              <span>Giá Thuê & Tiền Cọc</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Giá thuê 1 ngày (₫)</label>
                <input
                  type="number"
                  value={rentPrice1Day}
                  onChange={(e) => setRentPrice1Day(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Giá thuê 2 ngày (₫)</label>
                <input
                  type="number"
                  value={rentPrice2Days || ''}
                  placeholder={String(Math.round((rentPrice3Days || rentPrice1Day * 2) * 0.75))}
                  onChange={(e) => setRentPrice2Days(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Giá thuê 3 ngày (₫)</label>
                <input
                  type="number"
                  value={rentPrice3Days}
                  onChange={(e) => setRentPrice3Days(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-brand-700 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Phí thêm ngày (₫)</label>
                <input
                  type="number"
                  value={extraDayPrice}
                  onChange={(e) => setExtraDayPrice(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-xl text-xs font-bold text-rose-700 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tiền cọc giữ đồ (₫)</label>
                <input
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-amber-700 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Giá bán đứt (₫)</label>
                <input
                  type="number"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Giá niêm yết / Giá gốc (₫)</label>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Size & Màu sắc & Chất liệu */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Size có sẵn (phẩy cách)</label>
              <input
                type="text"
                value={sizesStr}
                onChange={(e) => setSizesStr(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500"
                placeholder="S, M, L, Freesize"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Màu sắc</label>
              <input
                type="text"
                value={colorsStr}
                onChange={(e) => setColorsStr(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500"
                placeholder="Trắng, Trắng kem"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Độ mới</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:border-brand-500"
              >
                <option value="Mới 100%">Mới 100% (Chưa qua sử dụng)</option>
                <option value="Mới 98%">Mới 98% (Như mới)</option>
                <option value="Mới 95%">Mới 95% (Tốt)</option>
              </select>
            </div>
          </div>

          {/* Image URL & Preview */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-gray-700">Link hình ảnh váy (URL)</label>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500"
                placeholder="https://images.unsplash.com/..."
              />
              {featuredImage && (
                <img
                  src={featuredImage}
                  alt="Preview"
                  className="w-10 h-12 object-cover rounded-lg border border-gray-200 shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Mô tả chi tiết</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500 leading-relaxed"
              placeholder="Thông tin phom dáng, xuất xứ, điểm nhấn thiết kế..."
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-brand-500/20"
            >
              <Check className="w-4 h-4" />
              <span>Lưu Cập Nhật Váy</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};