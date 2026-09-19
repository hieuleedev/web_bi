import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, ProductStatus, RentalBookingDate, Review } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { api } from '../lib/api';

interface ProductContextType {
  products: Product[];
  wishlistIds: string[];
  addProduct: (
    product: Omit<Product, 'id' | 'views' | 'likes' | 'rating' | 'reviewsCount' | 'createdAt' | 'bookedDates'>,
    imageFiles?: File[]
  ) => Promise<Product>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleLike: (productId: string) => void;
  addReview: (productId: string, review: Omit<Review, 'id' | 'createdAt'>) => void;
  adminUpdateStatus: (productId: string, status: ProductStatus) => void;
  addRentalBookingToProduct: (productId: string, booking: RentalBookingDate) => void;
  removeRentalBookingFromProduct: (productId: string, bookingId: string) => void;
  getProductById: (id: string) => Product | undefined;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const PRODUCTS_KEY = 'bibi_products_store_v3';
const WISHLIST_KEY = 'bibi_wishlist_ids';

// Check if an item is an old hardcoded template mock item (e.g. prod-1 to prod-8, white-..., demo-...)
function isLegacyMockId(id: string): boolean {
  if (!id) return true;
  // Match single digit mock IDs like prod-1, prod-2. Real products have 13-digit timestamps like prod-1789657...
  if (/^prod-[1-9]$/.test(id)) return true;
  if (id.startsWith('white-') || id.startsWith('demo-')) return true;
  return false;
}

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    // Proactively wipe all legacy mock/seed caches from browser storage
    const purgeKeys = [
      'bibi_products_store_v1',
      'bibi_products_store_v2',
      'bibi_products_v6_white_dresses',
      'bibi_products_v5_full_seed',
      'bibi_products_v4_local_v2',
    ];
    purgeKeys.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch (e) {}
    });

    const saved = localStorage.getItem(PRODUCTS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Strictly filter out only old mock dummy items, keep all user created products
          return parsed.filter((p: Product) => p && p.id && !isLegacyMockId(p.id));
        }
      } catch (e) {
        console.error('Error loading products from localStorage', e);
      }
    }
    return [];
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(WISHLIST_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Sync with Backend API on mount
  const refreshProducts = async () => {
    try {
      const data = await api.products.getAll({ status: 'all' });
      if (data && data.length > 0) {
        const realRows = data.filter((row: any) => row.id && !isLegacyMockId(row.id));
        setProducts((prev) => {
          const dbIds = new Set(realRows.map((p: any) => p.id));
          // Preserve any newly created products in local storage that haven't been synced or fetched yet
          const localOnly = prev.filter((p) => !dbIds.has(p.id) && !isLegacyMockId(p.id));
          const merged = [...realRows, ...localOnly];
          localStorage.setItem(PRODUCTS_KEY, JSON.stringify(merged));
          return merged;
        });
      }
    } catch (e) {
      console.warn('Backend API products fetch failed, using local/fallback', e);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const addProduct = async (
    productData: Omit<Product, 'id' | 'views' | 'likes' | 'rating' | 'reviewsCount' | 'createdAt' | 'bookedDates'>,
    imageFiles: File[] = []
  ): Promise<Product> => {
    const newId = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id: newId,
      views: 1,
      likes: 0,
      rating: 5.0,
      reviewsCount: 0,
      createdAt: new Date().toISOString(),
      bookedDates: [],
      reviews: []
    };

    let createdResult: any;
    try {
      if (imageFiles && imageFiles.length > 0) {
        // Gửi cùng lúc qua Multipart FormData: thông tin sản phẩm + toàn bộ file ảnh
        const formData = new FormData();
        formData.append('id', String(newProduct.id || ''));
        formData.append('sku', String(newProduct.sku || ''));
        formData.append('title', String(newProduct.title || ''));
        formData.append('description', String(newProduct.description || ''));
        formData.append('category', String(newProduct.category || ''));
        formData.append('gender', String(newProduct.gender || ''));
        formData.append('brand', String(newProduct.brand || ''));
        formData.append('type', String(newProduct.type || ''));
        formData.append('status', String(newProduct.status || ''));
        formData.append('buyPrice', String(newProduct.buyPrice || 0));
        formData.append('rentPrice1Day', String(newProduct.rentPrice1Day || 0));
        formData.append('rentPrice3Days', String(newProduct.rentPrice3Days || 0));
        formData.append('rentPrice7Days', String(newProduct.rentPrice7Days || 0));
        formData.append('deposit', String(newProduct.deposit || 0));
        formData.append('sizes', JSON.stringify(newProduct.sizes || ['Free size']));
        formData.append('colors', JSON.stringify(newProduct.colors || ['Đa sắc']));
        formData.append('material', String(newProduct.material || ''));
        formData.append('condition', String(newProduct.condition || ''));
        formData.append('sellerId', String(newProduct.sellerId || ''));
        formData.append('sellerName', String(newProduct.sellerName || ''));
        formData.append('sellerAvatar', String(newProduct.sellerAvatar || ''));
        formData.append('sellerRating', String(newProduct.sellerRating || 5.0));
        formData.append('location', String(newProduct.location || ''));

        // Lọc các URL ảnh mẫu nếu có
        const sampleUrls = (newProduct.images || []).filter(url => !url.startsWith('blob:'));
        if (sampleUrls.length > 0) {
          formData.append('images', JSON.stringify(sampleUrls));
        }

        // Đính kèm các file ảnh nhị phân gửi cùng
        imageFiles.forEach(file => {
          formData.append('images', file);
        });

        createdResult = await api.products.create(formData);
      } else {
        // Gửi dạng JSON nếu không có file nhị phân đính kèm
        createdResult = await api.products.create({
          id: newProduct.id,
          sku: newProduct.sku,
          title: newProduct.title,
          description: newProduct.description,
          category: newProduct.category,
          gender: newProduct.gender,
          brand: newProduct.brand,
          type: newProduct.type,
          status: newProduct.status,
          buyPrice: newProduct.buyPrice || 0,
          rentPrice1Day: newProduct.rentPrice1Day || 0,
          rentPrice3Days: newProduct.rentPrice3Days || 0,
          rentPrice7Days: newProduct.rentPrice7Days || 0,
          deposit: newProduct.deposit || 0,
          sizes: newProduct.sizes,
          colors: newProduct.colors,
          material: newProduct.material,
          condition: newProduct.condition,
          featuredImage: newProduct.featuredImage,
          images: newProduct.images,
          sellerId: newProduct.sellerId,
          sellerName: newProduct.sellerName,
          sellerAvatar: newProduct.sellerAvatar,
          sellerRating: newProduct.sellerRating,
          location: newProduct.location
        });
      }
    } catch (err: any) {
      console.error('❌ Lỗi khi đăng sản phẩm lên Database API:', err);
      // Ném lỗi trực tiếp để UI hiển thị thông báo, TUYỆT ĐỐI KHÔNG LƯU LOCALSTORAGE KHI LỖI
      throw new Error(err.message || 'Lỗi kết nối máy chủ Database khi lưu sản phẩm');
    }

    // 2. Chỉ khi Database trả về thành công mới cập nhật giao diện và bộ nhớ cache
    const finalProduct: Product = createdResult && createdResult.id ? { ...newProduct, ...createdResult } : newProduct;

    setProducts((prev) => {
      const next = [finalProduct, ...prev.filter((p) => p.id !== finalProduct.id)];
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(next));
      return next;
    });

    return finalProduct;
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    // Gọi API cập nhật Database trước
    try {
      await api.products.update(id, data);
    } catch (e: any) {
      console.error('❌ Lỗi cập nhật sản phẩm trên Database:', e);
      throw new Error(e.message || 'Lỗi cập nhật sản phẩm trên máy chủ');
    }

    // Database thành công mới cập nhật UI
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...data } : p));
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const deleteProduct = async (id: string) => {
    // Gọi API xóa trên Database trước
    try {
      await api.products.delete(id);
    } catch (e: any) {
      console.error('❌ Lỗi xóa sản phẩm trên Database:', e);
      throw new Error(e.message || 'Lỗi xóa sản phẩm trên máy chủ');
    }

    // Database thành công mới xóa khỏi UI
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const toggleLike = (productId: string) => {
    setWishlistIds((prev) => {
      const isLiked = prev.includes(productId);
      const nextWishlist = isLiked
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];

      // Update like count in product
      setProducts((currentProducts) =>
        currentProducts.map((p) =>
          p.id === productId
            ? { ...p, likes: Math.max(0, p.likes + (isLiked ? -1 : 1)) }
            : p
        )
      );

      return nextWishlist;
    });

    // Notify Backend
    api.products.like(productId).catch(() => {});
  };

  const addReview = async (productId: string, reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    let updatedRating = 5.0;
    let updatedCount = 1;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const currentReviews = p.reviews || [];
        const nextReviews = [newReview, ...currentReviews];
        const nextCount = nextReviews.length;
        const nextRating = +(
          nextReviews.reduce((sum, r) => sum + r.rating, 0) / nextCount
        ).toFixed(1);

        updatedRating = nextRating;
        updatedCount = nextCount;

        // Save reviews per product in localStorage
        try {
          localStorage.setItem(`bibi_reviews_${productId}`, JSON.stringify(nextReviews));
        } catch (e) {}

        return {
          ...p,
          reviews: nextReviews,
          reviewsCount: nextCount,
          rating: nextRating,
        };
      })
    );

    // Sync review record into Backend API
    try {
      await api.reviews.create({
        productId,
        userId: newReview.userId,
        userName: newReview.userName,
        userAvatar: newReview.userAvatar,
        rating: newReview.rating,
        comment: newReview.comment,
        type: newReview.type
      });
    } catch (err) {
      console.warn('Could not insert review to Backend API', err);
    }
  };

  const adminUpdateStatus = async (productId: string, status: ProductStatus) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status } : p))
    );
    try {
      await api.products.update(productId, { status });
    } catch (e) {
      console.warn('Error updating status in Backend API', e);
    }
  };

  const addRentalBookingToProduct = (productId: string, booking: RentalBookingDate) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          bookedDates: [...(p.bookedDates || []), booking],
        };
      })
    );
  };

  const removeRentalBookingFromProduct = (productId: string, bookingId: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          bookedDates: (p.bookedDates || []).filter((b) => b.id !== bookingId),
        };
      })
    );
  };

  const getProductById = (id: string): Product | undefined => {
    return products.find((p) => p.id === id);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        wishlistIds,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleLike,
        addReview,
        adminUpdateStatus,
        addRentalBookingToProduct,
        removeRentalBookingFromProduct,
        getProductById,
        refreshProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
