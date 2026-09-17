import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, ProductStatus, RentalBookingDate, Review } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

interface ProductContextType {
  products: Product[];
  wishlistIds: string[];
  addProduct: (product: Omit<Product, 'id' | 'views' | 'likes' | 'rating' | 'reviewsCount' | 'createdAt' | 'bookedDates'>) => Product;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleLike: (productId: string) => void;
  addReview: (productId: string, review: Omit<Review, 'id' | 'createdAt'>) => void;
  adminUpdateStatus: (productId: string, status: ProductStatus) => void;
  addRentalBookingToProduct: (productId: string, booking: RentalBookingDate) => void;
  removeRentalBookingFromProduct: (productId: string, bookingId: string) => void;
  getProductById: (id: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const PRODUCTS_KEY = 'bibi_products_v2';
const WISHLIST_KEY = 'bibi_wishlist_ids';

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
      } catch (e) {
        // ignore
      }
    }
    return ['prod-1', 'prod-4'];
  });

  useEffect(() => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const addProduct = (productData: Omit<Product, 'id' | 'views' | 'likes' | 'rating' | 'reviewsCount' | 'createdAt' | 'bookedDates'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      views: 1,
      likes: 0,
      rating: 5.0,
      reviewsCount: 0,
      createdAt: new Date().toISOString(),
      bookedDates: [],
      reviews: []
    };

    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
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
