import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { CATEGORIES } from '../data/initialCategories';
import { ProductType, GenderCategory } from '../types';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MultiImageUploader } from '../components/sell/MultiImageUploader';
import { PricingTierForm } from '../components/sell/PricingTierForm';

interface SellPageProps {
  onSuccess: (newProductId: string) => void;
  onCancel: () => void;
}

export const SellPage: React.FC<SellPageProps> = ({ onSuccess, onCancel }) => {
  const { addProduct } = useProducts();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  // Basic Information
  const [sku, setSku] = useState(() => `BB-${Math.floor(100 + Math.random() * 900)}`);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [gender, setGender] = useState<GenderCategory>('women');

  const handleGenerateSku = () => {
    const prefix = category ? category.substring(0, 2).toUpperCase() : 'BB';
    setSku(`BB-${prefix}${Math.floor(100 + Math.random() * 900)}`);
  };
  const [brand, setBrand] = useState('Thiết Kế Tự May');
  const [condition, setCondition] = useState('99% Like New');
  const [material, setMaterial] = useState('Lụa cao cấp, voan tơ');
  const [sizesInput, setSizesInput] = useState('S, M, L');
  const [colorsInput, setColorsInput] = useState('Trắng, Đen, Hồng pastel');

  // Type & Pricing
  const [productType, setProductType] = useState<ProductType>('rent');
  const [buyPrice, setBuyPrice] = useState<number>(1500000);
  const [originalPrice, setOriginalPrice] = useState<number>(1850000);
  const [rentPrice1Day, setRentPrice1Day] = useState<number>(200000);
  const [rentPrice3Days, setRentPrice3Days] = useState<number>(450000);
  const [rentPrice7Days, setRentPrice7Days] = useState<number>(800000);
  const [deposit, setDeposit] = useState<number>(0);

  // Description & Location
  const [description, setDescription] = useState('');
  const [careInstructions, setCareInstructions] = useState('Giặt tay hoặc giặt khô nhẹ nhàng, ủi hơi nước.');
  const [sizeGuide, setSizeGuide] = useState('Phù hợp cho bạn từ 45kg đến 54kg, eo 64-70cm.');
  const [location, setLocation] = useState(currentUser?.location || 'Khối 1 - Xã Núi Thành - Thành Phố Đà Nẵng, Da Nang, Vietnam, 560000');
  const [hasShipping] = useState(true);
  const [shippingFee, setShippingFee] = useState<number>(30000);
  const [shippingArea] = useState('Toàn quốc');

  // Image Upload state
  const [images, setImages] = useState<string[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (isDraft = false) => {
    if (!title.trim()) {
      showToast('Vui lòng nhập tên sản phẩm!', 'error');
      return;
    }

    if (images.length === 0) {
      showToast('Vui lòng tải lên ít nhất 1 hình ảnh sản phẩm!', 'error');
      return;
    }

    const sizesArray = sizesInput.split(',').map((s) => s.trim()).filter(Boolean);
    const colorsArray = colorsInput.split(',').map((c) => c.trim()).filter(Boolean);

    setIsSubmitting(true);
    try {
      const newProd = await addProduct({
        sku: sku.trim() || `BB-${Date.now().toString().slice(-4)}`,
        title: title.trim(),
        description: description.trim() || 'Trang phục thời trang cao cấp phù hợp cho các sự kiện, dạ hội hoặc dạo phố.',
        category,
        gender,
        brand: brand.trim() || 'Bi Bi Collection',
        type: productType,
        status: isDraft ? 'pending' : 'approved',
        buyPrice: (productType === 'buy' || productType === 'both') ? Number(buyPrice) : undefined,
        originalPrice: (productType === 'buy' || productType === 'both') ? Number(originalPrice) : undefined,
        rentPrice1Day: (productType === 'rent' || productType === 'both') ? Number(rentPrice1Day) : undefined,
        rentPrice3Days: (productType === 'rent' || productType === 'both') ? Number(rentPrice3Days) : undefined,
        rentPrice7Days: (productType === 'rent' || productType === 'both') ? Number(rentPrice7Days) : undefined,
        deposit: (productType === 'rent' || productType === 'both') ? Number(deposit) : undefined,
        sizes: sizesArray.length > 0 ? sizesArray : ['Free size'],
        colors: colorsArray.length > 0 ? colorsArray : ['Đa sắc'],
        material,
        condition,
        images,
        featuredImage: images[featuredIndex] || images[0],
        sellerId: currentUser?.id || 'user-seller-1',
        sellerName: currentUser?.name || 'Bi Bi Boutique (Linh Bi)',
        sellerAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        sellerRating: currentUser?.rating || 5.0,
        location,
        hasShipping,
        shippingFee: Number(shippingFee),
        shippingArea,
        careInstructions,
        sizeGuide,
      });

      showToast(
        isDraft ? 'Đã lưu bản nháp sản phẩm thành công lên Database!' : 'Đã đăng sản phẩm thành công lên sàn Bi Bi (Đã lưu Database)!',
        'success'
      );
      onSuccess(newProd.id);
    } catch (err: any) {
      console.error('Lỗi khi đăng sản phẩm:', err);
      showToast(`Đăng sản phẩm thất bại: ${err.message || 'Không thể lưu vào Database'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#faf9f8] min-h-screen py-8 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Marketplace Thời Trang
          </span>
          <h1 className="font-serif text-3xl font-bold text-gray-900 mt-2">
            Đăng Bán & Cho Thuê Quần Áo
          </h1>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            Biến tủ quần áo không dùng đến của bạn thành thu nhập thụ động bền vững hoặc tiếp cận hàng ngàn khách hàng thuê đồ dự tiệc mỗi ngày.
          </p>
        </div>

        {/* Multi-section Form */}
        <div className="space-y-8">
          
          {/* 1. MEDIA UPLOAD COMPONENT */}
          <MultiImageUploader
            images={images}
            featuredIndex={featuredIndex}
            onImagesChange={setImages}
            onFeaturedIndexChange={setFeaturedIndex}
          />

          {/* 2. BASIC INFORMATION SECTION */}
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-gray-900 pb-3 border-b border-gray-100">
              2. Thông Tin Chi Tiết Trang Phục
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* SKU code input */}
              <div className="md:col-span-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    Mã sản phẩm (SKU)
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSku}
                    className="text-[10px] text-brand-600 hover:text-brand-700 font-bold underline"
                  >
                    Tự sinh mã
                  </button>
                </div>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  placeholder="VD: BB-VC01"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 uppercase tracking-wider"
                />
              </div>

              {/* Product Title input */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Tên sản phẩm <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Đầm Dạ Hội Lụa Đỏ Burgundy Trễ Vai Đính Đá Pha Lê"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Danh mục trang phục
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-brand-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Giới tính / Đối tượng
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as GenderCategory)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-brand-500"
                >
                  <option value="women">Nữ (Thời trang nữ)</option>
                  <option value="men">Nam (Thời trang nam)</option>
                  <option value="unisex">Unisex (Cả nam và nữ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Thương hiệu / Xuất xứ
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Ví dụ: Bi Bi Atelier, Zara, Mango, May đo..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Tình trạng độ mới
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-brand-500"
                >
                  <option value="Mới 100%">Mới 100% (Nguyên tem mác)</option>
                  <option value="99% Like New">99% Like New (Mặc 1 lần chụp ảnh)</option>
                  <option value="95% Tốt">95% Tốt (Được bảo quản cẩn thận)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Các size có sẵn (cách nhau dấu phẩy)
                </label>
                <input
                  type="text"
                  value={sizesInput}
                  onChange={(e) => setSizesInput(e.target.value)}
                  placeholder="S, M, L, Free size"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Các màu sắc (cách nhau dấu phẩy)
                </label>
                <input
                  type="text"
                  value={colorsInput}
                  onChange={(e) => setColorsInput(e.target.value)}
                  placeholder="Đỏ rượu, Trắng kem, Đen tuyền"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Chất liệu vải
                </label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="Ví dụ: 100% Lụa satin, Ren Pháp dệt kim tuyến, Lót habutai..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* 3. PRICING TIER COMPONENT */}
          <PricingTierForm
            productType={productType}
            onProductTypeChange={setProductType}
            buyPrice={buyPrice}
            onBuyPriceChange={setBuyPrice}
            originalPrice={originalPrice}
            onOriginalPriceChange={setOriginalPrice}
            rentPrice1Day={rentPrice1Day}
            onRentPrice1DayChange={setRentPrice1Day}
            rentPrice3Days={rentPrice3Days}
            onRentPrice3DaysChange={setRentPrice3Days}
            rentPrice7Days={rentPrice7Days}
            onRentPrice7DaysChange={setRentPrice7Days}
            deposit={deposit}
            onDepositChange={setDeposit}
          />

          {/* 4. DESCRIPTION & SHIPPING */}
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-gray-900 pb-3 border-b border-gray-100">
              4. Mô Tả Chi Tiết & Giao Nhận
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Mô tả sản phẩm, dáng váy, cách phối đồ
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả phong cách, điểm nhấn, dịp sử dụng phù hợp (tiệc cưới, sự kiện, chụp ảnh kỷ yếu...)"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Địa chỉ showroom / Kho hàng
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Phí ship mặc định (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={shippingFee}
                    onChange={(e) => setShippingFee(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-gray-900 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onCancel}
              className="px-6 py-3.5 rounded-2xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
              className="px-6 py-3.5 rounded-2xl border border-brand-300 bg-brand-50 text-brand-700 text-xs font-semibold hover:bg-brand-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-brand-600" /> : null}
              <span>{isSubmitting ? 'Đang lưu vào Database...' : 'Lưu Bản Nháp'}</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              className="px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang đẩy lên Database...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Đăng Sản Phẩm Ngay</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
