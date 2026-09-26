import React, { useState } from 'react';
import {
  Sparkles,
  Loader2,
  ArrowLeft,
  UploadCloud,
  Image as ImageIcon,
  X,
  Check,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Tag,
  Calendar,
  ShieldCheck,
  DollarSign
} from 'lucide-react';
import { CATEGORIES } from '../data/initialCategories';
import { ProductType, GenderCategory } from '../types';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface SellPageProps {
  onSuccess: (newProductId: string) => void;
  onCancel: () => void;
}

const COMMON_SIZES = ['S', 'M', 'L', 'XL', 'Freesize'];

export const SellPage: React.FC<SellPageProps> = ({ onSuccess, onCancel }) => {
  const { addProduct } = useProducts();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  // 1. Core State
  const [title, setTitle] = useState('');
  const [sku, setSku] = useState(() => `BB-${Math.floor(100 + Math.random() * 900)}`);
  const [category, setCategory] = useState(CATEGORIES[0]?.id || 'dam-dai');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L']);

  // 2. Pricing & Deposit
  const [rentPrice1Day, setRentPrice1Day] = useState<number>(180000);
  const [rentPrice2Days, setRentPrice2Days] = useState<number>(280000);
  const [rentPrice3Days, setRentPrice3Days] = useState<number>(350000);
  const [extraDayPrice, setExtraDayPrice] = useState<number>(20000);
  const [deposit, setDeposit] = useState<number>(200000);

  // 3. Optional Buy Mode
  const [allowBuy, setAllowBuy] = useState(false);
  const [buyPrice, setBuyPrice] = useState<number>(1200000);

  // 4. Images
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // 5. Advanced Options (Collapsed by default for simplicity)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [brand, setBrand] = useState('Bi Bi Collection');
  const [condition, setCondition] = useState('99% Like New');
  const [material, setMaterial] = useState('Lụa cao cấp, voan tơ');
  const [colors, setColors] = useState('Đa sắc');
  const [description, setDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerateSku = () => {
    setSku(`BB-${Math.floor(100 + Math.random() * 900)}`);
    showToast('Đã đổi mã váy ngẫu nhiên!', 'info');
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size)
        ? prev.length > 1
          ? prev.filter((s) => s !== size)
          : prev
        : [...prev, size]
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const filesArray = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'));
    if (filesArray.length === 0) {
      showToast('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WEBP)!', 'warning');
      return;
    }

    const previewUrls = filesArray.map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...previewUrls]);
    setImageFiles((prev) => [...prev, ...filesArray]);
    showToast(`Đã thêm ${filesArray.length} ảnh!`, 'info');
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    if (images.length <= 1) {
      showToast('Cần ít nhất 1 ảnh cho váy!', 'warning');
      return;
    }
    setImages((prev) => prev.filter((_, idx) => idx !== index));
    setImageFiles((prev) => prev.filter((_, idx) => idx !== index));
    if (featuredIndex >= index && featuredIndex > 0) {
      setFeaturedIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Vui lòng nhập tên váy!', 'error');
      return;
    }

    if (images.length === 0) {
      showToast('Vui lòng thêm ít nhất 1 hình ảnh!', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const productType: ProductType = allowBuy ? 'both' : 'rent';

      const newProd = await addProduct(
        {
          sku: sku.trim() || `BB-${Date.now().toString().slice(-4)}`,
          title: title.trim(),
          description: description.trim() || `${title.trim()} - Trang phục cho thuê cao cấp tại Bi Bi Boutique.`,
          category,
          gender: 'women',
          brand: brand.trim() || 'Bi Bi Collection',
          type: productType,
          status: 'approved',
          buyPrice: allowBuy ? Number(buyPrice) : undefined,
          rentPrice1Day: Number(rentPrice1Day) || 180000,
          rentPrice2Days: Number(rentPrice2Days) || 280000,
          rentPrice3Days: Number(rentPrice3Days) || 350000,
          extraDayPrice: Number(extraDayPrice) || 50000,
          deposit: Number(deposit) || 0,
          sizes: selectedSizes.length > 0 ? selectedSizes : ['Freesize'],
          colors: [colors.trim() || 'Đa sắc'],
          material: material.trim() || 'Lụa, voan tơ',
          condition: condition.trim() || '99% Like New',
          images,
          featuredImage: images[featuredIndex] || images[0],
          sellerId: currentUser?.id || 'user-seller-1',
          sellerName: currentUser?.name || 'Bi Bi Boutique (Linh Bi)',
          sellerAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          sellerRating: currentUser?.rating || 5.0,
          location: 'Khối 1 - Xã Núi Thành - Thành Phố Đà Nẵng',
          hasShipping: true,
          shippingFee: 0,
          shippingArea: 'Toàn quốc',
        },
        imageFiles
      );

      showToast(`Đã thêm váy "${title.trim()}" vào kho thành công!`, 'success');
      onSuccess(newProd.id);
    } catch (err: any) {
      console.error('Lỗi khi thêm sản phẩm:', err);
      showToast(`Lỗi: ${err.message || 'Không thể lưu sản phẩm'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#faf9f8] min-h-screen py-6 sm:py-10 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white px-3 py-1.5 rounded-xl border border-gray-200 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại kho váy</span>
          </button>

          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            ✓ Thêm Nhanh Gọn
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl space-y-6">
          
          {/* Title Header */}
          <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Thêm Váy Mới Vào Kho
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Chỉ cần nhập tên váy, chọn ảnh và giá thuê là váy sẽ sẵn sàng cho thuê ngay
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* CỘT TRÁI: HÌNH ẢNH (5 COLS) */}
              <div className="md:col-span-5 space-y-3">
                <label className="block text-xs font-bold text-gray-800">
                  Hình ảnh váy <span className="text-rose-500">*</span>
                </label>

                {/* Main preview */}
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center group">
                  {images.length > 0 ? (
                    <>
                      <img
                        src={images[featuredIndex] || images[0]}
                        alt="Ảnh đại diện"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="px-3 py-1.5 bg-white text-gray-900 rounded-xl text-xs font-bold shadow-md cursor-pointer hover:bg-gray-100">
                          Đổi ảnh
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center p-4 text-center">
                      <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs font-bold text-gray-700">Tải ảnh lên từ máy</span>
                      <span className="text-[11px] text-gray-400 mt-0.5">JPG, PNG hoặc chụp từ điện thoại</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Thumbnail strip & Add button */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <label className="w-14 h-16 rounded-xl border border-dashed border-brand-300 bg-brand-50 hover:bg-brand-100 flex flex-col items-center justify-center cursor-pointer shrink-0 transition-colors">
                    <UploadCloud className="w-4 h-4 text-brand-600" />
                    <span className="text-[10px] font-bold text-brand-700 mt-0.5">+ Thêm</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>

                  {images.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setFeaturedIndex(i)}
                      className={`relative w-14 h-16 rounded-xl overflow-hidden cursor-pointer border-2 shrink-0 transition-all ${
                        featuredIndex === i ? 'border-brand-600 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      {images.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(i);
                          }}
                          className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* CỘT PHẢI: THÔNG TIN CỐT LÕI (7 COLS) */}
              <div className="md:col-span-7 space-y-4">
                
                {/* 1. Tên váy */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Tên mẫu váy <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Váy ren hoa nổi nâu dài Chou Chou"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                {/* 2. Mã SKU & Danh mục */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-gray-800">Mã váy (SKU)</label>
                      <button
                        type="button"
                        onClick={handleGenerateSku}
                        className="text-[10px] text-brand-600 font-bold hover:underline flex items-center gap-0.5"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>Đổi mã</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-brand-700 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">Danh mục</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:border-brand-500"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Size váy (Chọn nhanh dạng nút bấm) */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    Kích thước (Size có sẵn)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_SIZES.map((s) => {
                      const isSelected = selectedSizes.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSize(s)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {isSelected ? `✓ Size ${s}` : `Size ${s}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Giá thuê & Phí thêm ngày & Tiền cọc */}
                <div className="p-3.5 bg-emerald-50/40 rounded-2xl border border-emerald-200 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Bảng giá cho thuê & Cọc giữ đồ</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="text-[11px] text-gray-600 block mb-1">Giá thuê 1 ngày</label>
                      <input
                        type="number"
                        step={10000}
                        value={rentPrice1Day}
                        onChange={(e) => setRentPrice1Day(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-xl font-bold text-emerald-700"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-gray-600 block mb-1">Giá thuê 2 ngày</label>
                      <input
                        type="number"
                        step={10000}
                        value={rentPrice2Days}
                        onChange={(e) => setRentPrice2Days(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-xl font-bold text-gray-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-gray-600 block mb-1">Giá thuê 3 ngày (Chuẩn)</label>
                      <input
                        type="number"
                        step={10000}
                        value={rentPrice3Days}
                        onChange={(e) => setRentPrice3Days(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-emerald-400 rounded-xl font-bold text-emerald-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-rose-700 font-semibold block mb-1">Phí thêm ngày (/ngày)</label>
                      <input
                        type="number"
                        step={5000}
                        value={extraDayPrice}
                        onChange={(e) => setExtraDayPrice(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-rose-300 rounded-xl font-bold text-rose-700"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-amber-700 font-semibold block mb-1">Tiền cọc giữ đồ</label>
                      <input
                        type="number"
                        step={50000}
                        value={deposit}
                        onChange={(e) => setDeposit(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-xl font-bold text-amber-700"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Tùy chọn nâng cao (Thu gọn) */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs text-gray-500 hover:text-gray-800 font-semibold flex items-center gap-1"
                  >
                    <span>{showAdvanced ? 'Thu gọn tùy chọn khác' : '+ Thêm giá bán / mô tả chi tiết (không bắt buộc)'}</span>
                    {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {showAdvanced && (
                    <div className="mt-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3 animate-in fade-in duration-150">
                      
                      {/* Bán đứt */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="allowBuyCheck"
                          checked={allowBuy}
                          onChange={(e) => setAllowBuy(e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded border-gray-300"
                        />
                        <label htmlFor="allowBuyCheck" className="text-xs font-bold text-gray-800 cursor-pointer">
                          Có bán mua đứt sản phẩm này
                        </label>
                      </div>

                      {allowBuy && (
                        <div>
                          <label className="text-[11px] text-gray-600 block mb-1">Giá bán thực tế (VNĐ)</label>
                          <input
                            type="number"
                            step={50000}
                            value={buyPrice}
                            onChange={(e) => setBuyPrice(Number(e.target.value))}
                            className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-purple-900"
                          />
                        </div>
                      )}

                      {/* Mô tả */}
                      <div>
                        <label className="text-[11px] text-gray-600 block mb-1">Mô tả váy (phong cách, chất liệu)</label>
                        <textarea
                          rows={2}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Mô tả phong cách, dịp sử dụng phù hợp..."
                          className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Submit Action Buttons */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl bg-[#c2185b] hover:bg-[#ad1457] text-white text-xs font-bold shadow-md shadow-pink-900/20 flex items-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang lưu vào kho...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Đăng Váy Mới Ngay</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
