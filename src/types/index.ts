export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
  rating: number;
  ratingCount: number;
  location: string;
  joinedDate: string;
  bio?: string;
}

export type ProductType = 'buy' | 'rent' | 'both';

export type ProductStatus = 'pending' | 'approved' | 'rejected' | 'hidden' | 'sold' | 'rented';

export type GenderCategory = 'women' | 'men' | 'unisex';

export interface RentalBookingDate {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  renterName?: string;
  status: 'confirmed' | 'active' | 'completed' | 'cancelled';
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
  type: 'buy' | 'rent';
}

export interface Product {
  id: string;
  sku?: string;
  title: string;
  description: string;
  category: string;
  gender: GenderCategory;
  brand: string;
  type: ProductType;
  status: ProductStatus;
  
  // Pricing
  buyPrice?: number;
  originalPrice?: number;
  
  // Rental specific
  rentPrice1Day?: number;
  rentPrice3Days?: number;
  rentPrice7Days?: number;
  deposit?: number;
  
  // Attributes
  sizes: string[];
  colors: string[];
  material: string;
  condition: string; // e.g., 'Mới 100%', '99% Like New', '95% Tốt'
  images: string[];
  featuredImage: string;
  
  // Seller & Meta
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerRating: number;
  location: string;
  
  // Shipping
  hasShipping: boolean;
  shippingFee: number;
  shippingArea: string;
  
  // Stats
  views: number;
  likes: number;
  rating: number;
  reviewsCount: number;
  createdAt: string;
  
  // Care & sizing guide
  careInstructions?: string;
  sizeGuide?: string;
  
  // Existing bookings for rental items to prevent overlap
  bookedDates: RentalBookingDate[];
  reviews?: Review[];
}

export interface CartItem {
  cartItemId: string; // Unique id for cart item
  productId: string;
  product: Product;
  selectedSize: string;
  selectedColor: string;
  mode: 'buy' | 'rent';
  quantity: number;
  
  // If mode === 'rent'
  rentalStartDate?: string;
  rentalEndDate?: string;
  rentalDays?: number;
  rentalPriceTotal?: number;
  depositAmount?: number;
}

export type OrderStatus = 
  | 'pending'    // Chờ xác nhận
  | 'preparing'  // Đang chuẩn bị hàng
  | 'shipping'   // Đang giao hàng
  | 'rented'     // Đang trong thời gian thuê
  | 'returned'   // Khách đã hoàn trả đồ (chờ kiểm tra cọc)
  | 'completed'  // Đã hoàn thành (đã hoàn cọc)
  | 'cancelled'; // Đã hủy

export interface OrderItem {
  productId: string;
  productTitle: string;
  productImage: string;
  mode: 'buy' | 'rent';
  size: string;
  color: string;
  quantity: number;
  price: number;
  deposit?: number;
  rentalStartDate?: string;
  rentalEndDate?: string;
  rentalDays?: number;
  sellerId: string;
  sellerName: string;
}

export interface Order {
  id: string;
  code: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  deliveryMethod: 'shipping' | 'pickup';
  paymentMethod: 'cod' | 'bank_transfer' | 'momo' | 'vnpay';
  paymentStatus: 'unpaid' | 'paid';
  items: OrderItem[];
  subtotal: number;
  depositTotal: number;
  shippingFee: number;
  serviceFee: number;
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  vietqrUrl?: string;
  vietqrBank?: string;
  vietqrAccountNo?: string;
  vietqrAccountName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  productId?: string;
  productTitle?: string;
  productImage?: string;
  participants: {
    id: string;
    name: string;
    avatar: string;
    role: UserRole;
  }[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'rental' | 'product' | 'system' | 'chat';
  isRead: boolean;
  createdAt: string;
  link?: string;
}
