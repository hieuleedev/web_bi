import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, ProductStatus, RentalBookingDate, Review } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { supabase } from '../lib/supabase';

interface ProductContextType {
  products: Product[];
  wishlistIds: string[];
  addProduct: (product: Omit<Product, 'id' | 'views' | 'likes' | 'rating' | 'reviewsCount' | 'createdAt' | 'bookedDates'>) => Promise<Product>;
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

const PRODUCTS_KEY = 'bibi_products_v6_white_dresses';
const WISHLIST_KEY = 'bibi_wishlist_ids';

// Helper to map Supabase row to Product model
function mapDbToProduct(row: any): Product {
  return {
    id: row.id,
    title: row.title || '',
    description: row.description || '',
    category: row.category || 'party-dress',
    gender: row.gender || 'women',
    brand: row.brand || 'Bi Bi Collection',
    type: row.type || 'both',
    status: row.status === 'active' ? 'approved' : (row.status || 'approved'),
    buyPrice: row.buy_price,
    originalPrice: row.original_price,
    rentPrice1Day: row.rent_price_1day,
    rentPrice3Days: row.rent_price_3days,
    rentPrice7Days: row.rent_price_7days,
    deposit: row.deposit,
    sizes: row.sizes && row.sizes.length > 0 ? row.sizes : ['S', 'M', 'L'],
    colors: row.colors && row.colors.length > 0 ? row.colors : ['Trắng'],
    material: row.material || '',
    condition: row.condition || 'Mới 100%',
    featuredImage: row.featured_image || '',
    images: row.images && row.images.length > 0 ? row.images : [row.featured_image || ''],
    sellerId: row.seller_id || 'user-seller-1',
    sellerName: row.seller_name || 'Bi Bi Boutique (Linh Bi)',
    sellerAvatar: row.seller_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    sellerRating: row.seller_rating || 5.0,
    location: row.location || 'Khối 1 - Xã Núi Thành - Thành Phố Đà Nẵng',
    hasShipping: row.has_shipping ?? true,
    shippingFee: row.shipping_fee ?? 30000,
    shippingArea: row.shipping_area || 'Toàn quốc',
    views: row.views || 1,
    likes: row.likes || 0,
    rating: row.rating || 5.0,
    reviewsCount: row.reviews_count || 0,
    createdAt: row.created_at || new Date().toISOString(),
    careInstructions: row.care_instructions,
    sizeGuide: row.size_guide,
    bookedDates: row.booked_dates || [],
    reviews: row.reviews || []
  };
}

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(PRODUCTS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading products from localStorage', e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(WISHLIST_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return ['prod-1', 'prod-4'];
  });

  // Sync with Supabase on mount
  const refreshProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const mapped = data.map(mapDbToProduct);
        setProducts(mapped);
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(mapped));
      }
    } catch (e) {
      console.warn('Supabase fetch failed, using local/fallback', e);
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

  const addProduct = async (productData: Omit<Product, 'id' | 'views' | 'likes' | 'rating' | 'reviewsCount' | 'createdAt' | 'bookedDates'>): Promise<Product> => {
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

    // Optimistic UI update
    setProducts((prev) => [newProduct, ...prev]);

    // Save to Supabase Cloud DB
    try {
      await supabase.from('products').insert({
        id: newProduct.id,
        title: newProduct.title,
        description: newProduct.description,
        category: newProduct.category,
        brand: newProduct.brand,
        type: newProduct.type,
        status: newProduct.status,
        buy_price: newProduct.buyPrice || 0,
        rent_price_1day: newProduct.rentPrice1Day || 0,
        rent_price_3days: newProduct.rentPrice3Days || 0,
        rent_price_7days: newProduct.rentPrice7Days || 0,
        deposit: newProduct.deposit || 0,
        sizes: newProduct.sizes,
        colors: newProduct.colors,
        material: newProduct.material,
        condition: newProduct.condition,
        featured_image: newProduct.featuredImage,
        images: newProduct.images,
        seller_id: newProduct.sellerId,
        seller_name: newProduct.sellerName,
        seller_avatar: newProduct.sellerAvatar,
        seller_rating: newProduct.sellerRating,
        location: newProduct.location,
        views: newProduct.views,
        rating: newProduct.rating,
        reviews_count: newProduct.reviewsCount
      });
    } catch (err) {
      console.warn('Error syncing product to Supabase', err);
    }

    return newProduct;
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );

    try {
      const updateData: any = {};
      if (data.title) updateData.title = data.title;
      if (data.status) updateData.status = data.status;
      if (data.buyPrice !== undefined) updateData.buy_price = data.buyPrice;
      if (data.rentPrice1Day !== undefined) updateData.rent_price_1day = data.rentPrice1Day;
      if (data.rentPrice3Days !== undefined) updateData.rent_price_3days = data.rentPrice3Days;
      if (data.rentPrice7Days !== undefined) updateData.rent_price_7days = data.rentPrice7Days;
      if (data.deposit !== undefined) updateData.deposit = data.deposit;
      if (data.featuredImage) updateData.featured_image = data.featuredImage;
      if (data.images) updateData.images = data.images;

      if (Object.keys(updateData).length > 0) {
        await supabase.from('products').update(updateData).eq('id', id);
      }
    } catch (e) {
      console.warn('Error updating product in Supabase', e);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (e) {
      console.warn('Error deleting product from Supabase', e);
    }
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
  };

  const addReview = (productId: string, reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const currentReviews = p.reviews || [];
        const nextReviews = [newReview, ...currentReviews];
        const nextCount = nextReviews.length;
        const nextRating = +(
          nextReviews.reduce((sum, r) => sum + r.rating, 0) / nextCount
        ).toFixed(1);

        return {
          ...p,
          reviews: nextReviews,
          reviewsCount: nextCount,
          rating: nextRating,
        };
      })
    );
  };

  const adminUpdateStatus = (productId: string, status: ProductStatus) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status } : p))
    );
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
