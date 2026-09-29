export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  discountPrice?: number;
  currency: string;
  images: string[];
  status: string;
  rating: number;
  reviewCount: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: 'PENDING' | 'INVENTORY_RESERVED' | 'PAYMENT_PENDING' | 'PAID' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'FAILED' | 'REFUND_PENDING' | 'REFUNDED';
  subtotal: number;
  discount: number;
  tax: number;
  shippingFee: number;
  totalAmount: number;
  currency: string;
  shippingAddress: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  eventType: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

export interface OrderTimeline {
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  sagaStatus: string;
  currentStep: string;
  errorMessage?: string;
  timeline: TimelineEvent[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  orderId?: string;
  channel: string;
  title: string;
  message: string;
  status: string;
  readAt?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
