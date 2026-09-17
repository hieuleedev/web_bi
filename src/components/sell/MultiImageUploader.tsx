import React from 'react';
import { UploadCloud, ImageIcon, X } from 'lucide-react';
import { fileToBase64 } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';

interface MultiImageUploaderProps {
  images: string[];
  featuredIndex: number;
  onImagesChange: (newImages: string[]) => void;
  onFeaturedIndexChange: (index: number) => void;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  images,
  featuredIndex,
  onImagesChange,
  onFeaturedIndexChange,
}) => {
  const { showToast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    try {
      const newImages: string[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        if (file.type.startsWith('image/')) {
          const base64 = await fileToBase64(file);
          newImages.push(base64);
        }
      }
      onImagesChange([...images, ...newImages]);
      showToast(`Đã tải lên thành công ${newImages.length} ảnh!`, 'success');
    } catch (err) {
      showToast('Lỗi khi tải ảnh lên. Vui lòng thử lại!', 'error');
    }
  };

  const handleAddSampleImage = (url: string) => {
    onImagesChange([...images, url]);
    showToast('Đã thêm ảnh vào bộ sưu tập', 'info');
  };

  const handleRemoveImage = (index: number) => {
    if (images.length <= 1) {
      showToast('Cần ít nhất 1 hình ảnh cho sản phẩm!', 'warning');
      return;
    }
    const updated = images.filter((_, idx) => idx !== index);
    onImagesChange(updated);
    if (featuredIndex >= updated.length) {
      onFeaturedIndexChange(0);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h3 className="font-serif font-bold text-base text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-brand-600" />
            <span>1. Hình Ảnh Sản Phẩm ({images.length} ảnh)</span>
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Tải lên ảnh từ máy tính (hỗ trợ JPG, PNG, WEBP) hoặc chọn ảnh mẫu bên dưới
          </p>
        </div>
      </div>

      {/* Drag & drop upload box */}
      <label className="border-2 border-dashed border-gray-300 hover:border-brand-500 bg-gray-50/70 hover:bg-brand-50/30 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all">
        <UploadCloud className="w-10 h-10 text-brand-500 mb-2" />
        <p className="text-xs font-semibold text-gray-800">
          Nhấn để chọn ảnh từ máy tính của bạn hoặc kéo thả vào đây
        </p>
        <p className="text-[11px] text-gray-500 mt-1">
          Tối đa 10 ảnh, kích thước ảnh sắc nét sẽ thu hút khách thuê hơn 300%
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </label>

      {/* Quick sample photo adder for convenience */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-gray-500">
        <span>Gợi ý ảnh váy trắng mẫu đẹp (không người mẫu):</span>
        <button
          type="button"
          onClick={() => handleAddSampleImage('https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80')}
          className="text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-lg transition-colors"
        >
          + Váy trắng xòe bồng
        </button>
        <button
          type="button"
          onClick={() => handleAddSampleImage('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80')}
          className="text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-lg transition-colors"
        >
          + Áo dài lụa trắng
        </button>
        <button
          type="button"
          onClick={() => handleAddSampleImage('https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80')}
          className="text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-lg transition-colors"
        >
          + Váy cưới mannequin
        </button>
      </div>

      {/* Preview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
        {images.map((img, idx) => (
          <div
            key={idx}
            className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 group bg-gray-100 ${
              featuredIndex === idx
                ? 'border-brand-600 ring-2 ring-brand-500/20 shadow-md'
                : 'border-gray-200'
            }`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />

            {/* Actions overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="self-end p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700"
                title="Xóa ảnh"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onFeaturedIndexChange(idx)}
                className={`text-[10px] font-bold px-2 py-1 rounded-md text-center transition-colors ${
                  featuredIndex === idx
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/90 text-gray-800 hover:bg-white'
                }`}
              >
                {featuredIndex === idx ? 'Ảnh Bìa ✓' : 'Đặt Làm Bìa'}
              </button>
            </div>

            {featuredIndex === idx && (
              <span className="absolute top-1.5 left-1.5 text-[9px] font-bold bg-brand-600 text-white px-1.5 py-0.5 rounded shadow">
                Ảnh bìa
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
