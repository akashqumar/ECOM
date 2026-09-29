import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { OrderTimelineModal } from './components/OrderTimelineModal';
import { OrderListModal } from './components/OrderListModal';
import { NotificationModal } from './components/NotificationModal';
import { Product, Category, Cart, Order, OrderTimeline, NotificationItem } from './types';
import { catalogApi, cartApi, orderApi, notificationApi } from './services/api';
import { Sparkles, Shield, Cpu, RefreshCw, Zap } from 'lucide-react';

export function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<Cart | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [currentTimeline, setCurrentTimeline] = useState<OrderTimeline | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // States
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isTimelineLoading, setIsTimelineLoading] = useState(false);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  // Load Categories & Products on initial mount
  useEffect(() => {
    loadCategories();
    loadCart();
    loadOrders();
    loadNotifications();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchQuery]);

  // Polling for active order timeline if modal open
  useEffect(() => {
    if (!isTimelineOpen || !activeOrderId) return;
    const interval = setInterval(() => {
      fetchOrderTimeline(activeOrderId, false);
    }, 2000);
    return () => clearInterval(interval);
  }, [isTimelineOpen, activeOrderId]);

  const loadCategories = async () => {
    try {
      const res = await catalogApi.getCategories();
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await catalogApi.getProducts({
        categoryId: selectedCategory || undefined,
        search: searchQuery || undefined,
        size: 50,
      });
      if (res.success) setProducts(res.data.content);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const loadCart = async () => {
    try {
      const res = await cartApi.getCart();
      if (res.success) setCart(res.data);
    } catch (err) {
      console.error('Failed to load cart', err);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await orderApi.getOrders();
      if (res.success) setOrders(res.data.content);
    } catch (err) {
      console.error('Failed to load orders', err);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await notificationApi.getNotifications();
      if (res.success) setNotifications(res.data.content);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  const handleAddToCart = async (product: Product) => {
    setAddingProductId(product.id);
    try {
      const res = await cartApi.addItem(product.id, 1);
      if (res.success) setCart(res.data);
    } catch (err) {
      console.error('Failed to add item to cart', err);
    } finally {
      setTimeout(() => setAddingProductId(null), 400);
    }
  };

  const handleUpdateQty = async (productId: string, quantity: number) => {
    try {
      const res = await cartApi.updateQuantity(productId, quantity);
      if (res.success) setCart(res.data);
    } catch (err) {
      console.error('Failed to update quantity', err);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      const res = await cartApi.removeItem(productId);
      if (res.success) setCart(res.data);
    } catch (err) {
      console.error('Failed to remove item', err);
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return;
    setIsCheckingOut(true);
    try {
      const idempotencyKey = 'key-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
      const itemsPayload = cart.items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        sku: i.sku,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
      }));

      const res = await orderApi.checkout({
        idempotencyKey,
        shippingAddress: '742 Evergreen Terrace, Springfield, OR 97477',
        items: itemsPayload,
      });

      if (res.success) {
        // Clear local cart
        await cartApi.clearCart();
        setCart(null);
        setIsCartOpen(false);

        // Open timeline modal for this order
        const newOrderId = res.data.orderId;
        setActiveOrderId(newOrderId);
        await fetchOrderTimeline(newOrderId, true);
        setIsTimelineOpen(true);

        // Refresh orders and notifications
        loadOrders();
        loadNotifications();
      }
    } catch (err) {
      console.error('Checkout failed', err);
      alert('Checkout failed. Please check network logs.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const fetchOrderTimeline = async (orderId: string, showSpinner = true) => {
    if (showSpinner) setIsTimelineLoading(true);
    try {
      const res = await orderApi.getOrderTimeline(orderId);
      if (res.success) {
        setCurrentTimeline(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch timeline', err);
    } finally {
      if (showSpinner) setIsTimelineLoading(false);
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setIsOrdersOpen(false);
    setActiveOrderId(orderId);
    fetchOrderTimeline(orderId, true);
    setIsTimelineOpen(true);
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        cartCount={cart?.itemCount || 0}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={categories}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-Throughput Distributed Microservices</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
            Engineered for Concurrency. Resilient by Design.
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
            Experience an e-commerce platform built with an event-driven Kafka backbone, database-per-service isolation, Saga transaction orchestrator, and zero-overselling inventory guards.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Orchestrated Sagas with Rollback</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Sub-50ms Redis Read Cache</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Transactional Outbox & Skip-Locked Relayer</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog View */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Product Catalog</h2>
            <p className="text-xs text-slate-400 mt-1">
              Showing {products.length} verified products with real-time stock allocation
            </p>
          </div>

          <button
            onClick={loadProducts}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 transition"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingProducts ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-sm">No products found matching your filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={handleAddToCart}
                isAdding={addingProductId === p.id}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>AuraCommerce • Distributed Microservices E-Commerce Platform</p>
          <p className="mt-1 font-mono text-[10px]">
            Java 21/25 • Spring Cloud Gateway • Apache Kafka • PostgreSQL 16 • Redis • Docker
          </p>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
        isCheckingOut={isCheckingOut}
      />

      {/* Order Timeline Modal */}
      <OrderTimelineModal
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        timeline={currentTimeline}
        onRefresh={() => activeOrderId && fetchOrderTimeline(activeOrderId, true)}
        isLoading={isTimelineLoading}
      />

      {/* Orders List Modal */}
      <OrderListModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
        onSelectOrder={handleSelectOrder}
      />

      {/* Notifications Modal */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
      />
    </div>
  );
}

export default App;
