/**
 * BI BI FASHION - CENTRALIZED BACKEND API CLIENT
 * Kết nối toàn bộ ứng dụng tới Backend Node.js Express REST API & S3 Storage.
 */

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
export const API_BASE = `${BACKEND_URL}/api`;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {})
  };

  // Tự động thêm Content-Type: application/json nếu body là chuỗi JSON
  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data?.message || `Lỗi yêu cầu (${res.status} ${res.statusText})`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // ==========================================
  // 1. SẢN PHẨM (PRODUCTS)
  // ==========================================
  products: {
    getAll: async (params: { category?: string; type?: string; search?: string; minPrice?: number; maxPrice?: number; status?: string } = {}) => {
      const query = new URLSearchParams();
      if (params.category && params.category !== 'all') query.set('category', params.category);
      if (params.type && params.type !== 'all') query.set('type', params.type);
      if (params.search) query.set('search', params.search);
      if (params.minPrice) query.set('minPrice', String(params.minPrice));
      if (params.maxPrice) query.set('maxPrice', String(params.maxPrice));
      if (params.status) query.set('status', params.status);

      const qs = query.toString();
      const res = await request<{ success: boolean; count: number; data: any[] }>(`/products${qs ? `?${qs}` : ''}`);
      return res.data || [];
    },

    getById: async (id: string) => {
      const res = await request<{ success: boolean; data: any }>(`/products/${id}`);
      return res.data;
    },

    getCalendar: async (id: string) => {
      const res = await request<{ success: boolean; data: any }>(`/products/${id}/calendar`);
      return res.data;
    },

    create: async (productData: any) => {
      const res = await request<{ success: boolean; message: string; data: any }>('/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      });
      return res.data;
    },

    update: async (id: string, productData: any) => {
      const res = await request<{ success: boolean; message: string; data: any }>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
      });
      return res.data;
    },

    delete: async (id: string) => {
      const res = await request<{ success: boolean; message: string }>(`/products/${id}`, {
        method: 'DELETE'
      });
      return res.success;
    },

    like: async (id: string) => {
      const res = await request<{ success: boolean; message: string; data: any }>(`/products/${id}/like`, {
        method: 'POST'
      });
      return res.data;
    }
  },

  // ==========================================
  // 2. UPLOAD ẢNH LÊN VIETNIX S3
  // ==========================================
  upload: {
    single: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi tải ảnh lên Vietnix S3');
      return data as { success: boolean; message: string; url: string; key: string; size: number; storage: string };
    },

    multiple: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));

      const res = await fetch(`${API_BASE}/upload/multiple`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi tải ảnh lên Vietnix S3');
      return data as { success: boolean; message: string; urls: string[]; files: any[]; count: number };
    }
  },

  // ==========================================
  // 3. ĐƠN HÀNG (ORDERS) & VIETQR
  // ==========================================
  orders: {
    getAll: async (params: { phone?: string; status?: string; search?: string } = {}) => {
      const query = new URLSearchParams();
      if (params.phone) query.set('phone', params.phone);
      if (params.status && params.status !== 'all') query.set('status', params.status);
      if (params.search) query.set('search', params.search);

      const qs = query.toString();
      const res = await request<{ success: boolean; count: number; data: any[] }>(`/orders${qs ? `?${qs}` : ''}`);
      return res.data || [];
    },

    getById: async (id: string) => {
      const res = await request<{ success: boolean; data: any }>(`/orders/${id}`);
      return res.data;
    },

    create: async (orderData: any) => {
      const res = await request<{ success: boolean; message: string; orderCode: string; vietqrUrl: string; data: any }>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });
      return res;
    },

    updateStatus: async (id: string, statusData: { status?: string; depositStatus?: string; paymentStatus?: string }) => {
      const res = await request<{ success: boolean; message: string; data: any }>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(statusData)
      });
      return res.data;
    },

    update: async (id: string, orderData: any) => {
      const res = await request<{ success: boolean; message: string; data: any }>(`/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(orderData)
      });
      return res.data;
    },

    delete: async (id: string) => {
      const res = await request<{ success: boolean; message: string }>(`/orders/${id}`, {
        method: 'DELETE'
      });
      return res.success;
    },

    getBankConfig: async () => {
      const res = await request<{ success: boolean; data: any }>('/config/bank');
      return res.data;
    }
  },

  // ==========================================
  // 4. LỊCH THUÊ & KHÁCH THUÊ (RENTALS)
  // ==========================================
  rentals: {
    getAll: async (productId?: string) => {
      const qs = productId ? `?productId=${encodeURIComponent(productId)}` : '';
      const res = await request<{ success: boolean; count: number; data: any[] }>(`/rentals${qs}`);
      return res.data || [];
    },

    checkAvailability: async (productId: string, startDate: string, endDate: string) => {
      const res = await request<{ success: boolean; isAvailable: boolean; message: string; conflicts: any[] }>('/rentals/check', {
        method: 'POST',
        body: JSON.stringify({ productId, startDate, endDate })
      });
      return res;
    },

    create: async (bookingData: any) => {
      const res = await request<{ success: boolean; message: string; data: any }>('/rentals', {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });
      return res.data;
    },

    updateStatus: async (id: string, status: string, note?: string) => {
      const res = await request<{ success: boolean; message: string; data: any }>(`/rentals/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note })
      });
      return res.data;
    },

    getRenters: async () => {
      const res = await request<{ success: boolean; totalRenters: number; data: any[] }>('/rentals/renters');
      return res.data || [];
    }
  },

  // ==========================================
  // 5. ĐÁNH GIÁ (REVIEWS)
  // ==========================================
  reviews: {
    getByProduct: async (productId: string) => {
      const res = await request<{ success: boolean; count: number; data: any[] }>(`/reviews?productId=${encodeURIComponent(productId)}`);
      return res.data || [];
    },

    create: async (reviewData: { productId: string; comment: string; rating: number; userId?: string; userName?: string; userAvatar?: string; type?: string }) => {
      const res = await request<{ success: boolean; message: string; data: any }>('/reviews', {
        method: 'POST',
        body: JSON.stringify(reviewData)
      });
      return res.data;
    }
  },

  // ==========================================
  // 6. CHAT & HỘI THOẠI (MESSAGES & CONVERSATIONS)
  // ==========================================
  chat: {
    getConversations: async (userId?: string) => {
      const qs = userId ? `?userId=${encodeURIComponent(userId)}` : '';
      const res = await request<{ success: boolean; count: number; data: any[] }>(`/conversations${qs}`);
      return res.data || [];
    },

    getMessages: async (conversationId: string) => {
      const res = await request<{ success: boolean; data: any[] }>(`/messages?conversationId=${encodeURIComponent(conversationId)}`);
      return res.data || [];
    },

    sendMessage: async (messageData: { conversationId: string; content: string; senderId: string; senderName: string; senderAvatar?: string; imageUrl?: string }) => {
      const res = await request<{ success: boolean; data: any }>('/messages', {
        method: 'POST',
        body: JSON.stringify(messageData)
      });
      return res.data;
    }
  },

  // ==========================================
  // 7. NGƯỜI DÙNG & XÁC THỰC (USERS & AUTH)
  // ==========================================
  auth: {
    getUsers: async () => {
      const res = await request<{ success: boolean; count: number; data: any[] }>('/users');
      return res.data || [];
    },

    getUserById: async (id: string) => {
      const res = await request<{ success: boolean; data: any }>(`/users/${id}`);
      return res.data;
    },

    login: async (email: string) => {
      const res = await request<{ success: boolean; message: string; token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      return res;
    },

    register: async (userData: { name: string; email: string; phone?: string; role?: string; avatar?: string; location?: string }) => {
      const res = await request<{ success: boolean; message: string; token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      return res;
    },

    updateProfile: async (id: string, userData: any) => {
      const res = await request<{ success: boolean; message: string; data: any }>(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
      return res.data;
    }
  },

  // ==========================================
  // 8. THỐNG KÊ HỆ THỐNG (ADMIN STATS)
  // ==========================================
  admin: {
    getStats: async () => {
      const res = await request<{ success: boolean; stats: any }>('/admin/stats');
      return res.stats;
    }
  }
};

export default api;
