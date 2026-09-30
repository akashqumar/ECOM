export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
  phoneNumber?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  brand: string;
  categoryId: string;
  images: string[];
  attributes?: Record<string, any>;
  rating: number;
  reviewCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  availableQuantity: number;
  reservedQuantity: number;
  totalQuantity: number;
  warehouseId: string;
  lowStock: boolean;
  updatedAt: string;
  product?: Product;
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
  status: 'PENDING' | 'INVENTORY_RESERVED' | 'PAYMENT_PENDING' | 'PAID' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'FAILED';
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
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED' | 'PENDING';
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

export interface SystemMetrics {
  totalOrders: number;
  grossRevenue: number;
  totalAvailableUnits: number;
  totalReservedUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  readyToShipCount: number;
  inTransitCount: number;
  completedOrdersCount: number;
}
