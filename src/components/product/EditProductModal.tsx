import React, { useState, useEffect, useRef } from "react";
import { X, Sparkles, DollarSign, Image as ImageIcon, Layers, Tag, Check, RefreshCw, Upload, Loader2, Trash2 } from "lucide-react";
import { Product } from "../../types";
import { useProducts } from "../../context/ProductContext";
import { useToast } from "../../context/ToastContext";
import { CATEGORIES } from "../../data/initialCategories";
import { formatVND } from "../../utils/helpers";
import api from "../../lib/api";

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
  const [category, setCategory] = useState(CATEGORIES[0]?.id || "dam-dai");
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
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setTitle(product.title || "");
      setSku(product.sku || (product.id ? product.id.replace("prod-", "BB-") : "BB-001"));
      setCategory(product.category || CATEGORIES[0]?.id || "dam-dai");
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
      setImages(product.images && product.images.length > 0 ? product.images : (product.featuredImage ? [product.featuredImage] : []));
      setDescription(product.description || "");
    }
  }, [product]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      showToast("Đang tải ảnh lên máy chủ Vietnix S3...", "info");

      const filesArray = Array.from(files);
      if (filesArray.length === 1) {
        const res = await api.upload.single(filesArray[0]);
        if (res && res.url) {
          const newUrl = res.url;
          setImages(prev => [...prev, newUrl]);
          if (!featuredImage) setFeaturedImage(newUrl);
          showToast("Tải ảnh lên thành công!", "success");
        }
      } else {
        const res = await api.upload.multiple(filesArray);
        if (res && res.urls && res.urls.length > 0) {
          setImages(prev => [...prev, ...res.urls]);
          if (!featuredImage) setFeaturedImage(res.urls[0]);
          showToast(`Đã tải lên thành công ${res.urls.length} ảnh!`, "success");
        }
      }
    } catch (err: any) {
      console.error("Lỗi tải ảnh lên:", err);
      showToast(err.message || "Tải ảnh thất bại. Vui lòng thử lại!", "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    setImages(updated);
    if (featuredImage === images[indexToRemove]) {
      setFeaturedImage(updated[0] || "");
    }
  };

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

    const finalFeaturedImage = featuredImage.trim() || (images.length > 0 ? images[0] : "");
    const finalImages = images.length > 0 ? images : (finalFeaturedImage ? [finalFeaturedImage] : []);

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
      featuredImage: finalFeaturedImage,
      images: finalImages,
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

          {/* Quản lý & Tải hình ảnh váy */}
          <div className="space-y-3 p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80">
            <div className="flex items-center justify-between">
              <div>
                <label className="block font-bold text-gray-900 text-xs">
                  Hình ảnh váy ({images.length} ảnh)
                </label>
                <p className="text-[11px] text-gray-500">
                  Tải ảnh trực tiếp từ máy tính/điện thoại hoặc dán link ảnh. Bấm ảnh để chọn làm ảnh bìa chính.
                </p>
              </div>

              {/* Nút Tải Ảnh Mới */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang tải lên...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải Ảnh Mới</span>
                  </>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Danh sách thumbnails ảnh hiện tại */}
            {images.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 pt-1">
                {images.map((imgUrl, idx) => {
                  const isMain = featuredImage === imgUrl || (!featuredImage && idx === 0);
                  return (
                    <div
                      key={idx}
                      className={`relative group rounded-xl overflow-hidden border-2 aspect-[3/4] bg-white cursor-pointer transition-all ${
                        isMain ? "border-brand-600 ring-2 ring-brand-500/20 shadow-sm" : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setFeaturedImage(imgUrl)}
                    >
                      <img
                        src={imgUrl}
                        alt={`Ảnh ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Badge Ảnh Bìa Chính */}
                      {isMain && (
                        <span className="absolute top-1.5 left-1.5 bg-brand-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                          Ảnh bìa
                        </span>
                      )}

                      {/* Nút Xóa Ảnh */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(idx);
                        }}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Xóa ảnh này"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-brand-500 bg-white rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all text-center"
              >
                <Upload className="w-7 h-7 text-brand-500 mb-1.5" />
                <p className="text-xs font-bold text-gray-800">Chưa có ảnh nào được tải lên</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Nhấn vào đây để tải ảnh từ máy của bạn</p>
              </div>
            )}

            {/* Hoặc nhập link ảnh trực tiếp */}
            <div className="pt-2 border-t border-gray-200/60">
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Hoặc nhập/sửa nhanh link ảnh (URL):
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={featuredImage}
                  onChange={(e) => {
                    setFeaturedImage(e.target.value);
                    if (e.target.value && !images.includes(e.target.value)) {
                      setImages(prev => [e.target.value, ...prev]);
                    }
                  }}
                  className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
                  placeholder="https://..."
                />
              </div>
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