import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, cartApi, userApi } from '../services/api';
import type { User, Cart, Product } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  updateProfile: (data: { firstName: string; lastName: string; phone?: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  subtotal: number;
  addItem: (product: { id: string; sku?: string; name: string; price: number; images?: string[] }, qty?: number) => Promise<void>;
  updateQty: (productId: string, qty: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  isUpdating: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

interface WishlistContextType {
  wishlist: Product[];
  wishlistCount: number;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  title?: string;
  message: string;
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'error', title?: string) => void;
  removeToast: (id: string) => void;
}

const AuthContext = createContext<AuthContextType>(null!);
const CartContext = createContext<CartContextType>(null!);
const WishlistContext = createContext<WishlistContextType>(null!);
const ThemeContext = createContext<ThemeContextType>(null!);
const ToastContext = createContext<ToastContextType>(null!);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      if (res.success) {
        setToken(res.data.accessToken);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.accessToken);
        localStorage.setItem('userId', res.data.user.id);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(firstName, lastName, email, password);
      if (res.success) {
        setToken(res.data.accessToken);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.accessToken);
        localStorage.setItem('userId', res.data.user.id);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      userApi.getProfile()
        .then((res) => {
          if (res.success && res.data) {
            setUser((prev) => {
              const updated = { ...(prev || {}), ...res.data };
              localStorage.setItem('user', JSON.stringify(updated));
              return updated;
            });
          }
        })
        .catch((err) => {
          console.debug('Failed to sync user profile from server', err);
        });
    }
  }, [token]);

  const updateProfile = async (data: { firstName: string; lastName: string; phone?: string }) => {
    setIsLoading(true);
    try {
      const res = await userApi.updateProfile(data);
      if (res.success && res.data) {
        const updatedUser = { ...user, ...res.data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return;
      }
    } catch (err) {
      console.warn('Backend updateProfile failed, updating local state', err);
    } finally {
      setIsLoading(false);
    }
    // Resilient fallback: update state & localStorage
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
  };

  return <AuthContext.Provider value={{ user, token, login, register, updateProfile, logout, isLoading }}>{children}</AuthContext.Provider>;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const saveCartLocal = (newCart: Cart | null) => {
    setCart(newCart);
    try {
      if (newCart) {
        localStorage.setItem('cart', JSON.stringify(newCart));
      } else {
        localStorage.removeItem('cart');
      }
    } catch {}
  };

  const refreshCart = useCallback(async () => {
    try {
      const res = await cartApi.getCart();
      if (res.success && res.data) {
        saveCartLocal(res.data);
      }
    } catch { /* keep existing local cart */ }
  }, []);

  useEffect(() => { refreshCart(); }, [refreshCart]);

  const addItem = async (product: { id: string; sku?: string; name: string; price: number; images?: string[] }, qty = 1) => {
    setIsUpdating(true);
    const itemSku = product.sku || `SKU-${product.id.slice(0, 8)}`;
    const itemImage = product.images?.[0] || '';
    const safePrice = Number(product.price) || 0;

    // 1. Optimistic update so UI updates immediately with 100% reliability
    setCart(prev => {
      const existingItems = prev?.items ? [...prev.items] : [];
      const idx = existingItems.findIndex(i => i.productId === product.id);

      if (idx > -1) {
        const item = existingItems[idx];
        const newQty = item.quantity + qty;
        existingItems[idx] = {
          ...item,
          quantity: newQty,
          subtotal: Math.round(item.price * newQty * 100) / 100
        };
      } else {
        existingItems.push({
          productId: product.id,
          sku: itemSku,
          name: product.name,
          price: safePrice,
          quantity: qty,
          imageUrl: itemImage,
          subtotal: Math.round(safePrice * qty * 100) / 100
        });
      }

      const totalQuantity = existingItems.reduce((acc, i) => acc + i.quantity, 0);
      const subtotalAmount = Math.round(existingItems.reduce((acc, i) => acc + (i.price * i.quantity), 0) * 100) / 100;

      const updatedCart: Cart = {
        userId: prev?.userId || localStorage.getItem('userId') || 'user-demo-123',
        items: existingItems,
        totalQuantity,
        subtotalAmount,
        updatedAt: new Date().toISOString()
      };

      try { localStorage.setItem('cart', JSON.stringify(updatedCart)); } catch {}
      return updatedCart;
    });

    // 2. Background sync with backend API
    try {
      const res = await cartApi.addItem({
        ...product,
        sku: itemSku,
        price: safePrice
      }, qty);
      if (res.success && res.data) {
        saveCartLocal(res.data);
      }
    } catch (err) {
      console.warn('Backend cart sync fallback to local cart:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const updateQty = async (productId: string, qty: number) => {
    setIsUpdating(true);

    // Optimistic update
    setCart(prev => {
      if (!prev) return null;
      let existingItems = [...prev.items];
      if (qty <= 0) {
        existingItems = existingItems.filter(i => i.productId !== productId);
      } else {
        const idx = existingItems.findIndex(i => i.productId === productId);
        if (idx > -1) {
          existingItems[idx] = {
            ...existingItems[idx],
            quantity: qty,
            subtotal: Math.round(existingItems[idx].price * qty * 100) / 100
          };
        }
      }

      const totalQuantity = existingItems.reduce((acc, i) => acc + i.quantity, 0);
      const subtotalAmount = Math.round(existingItems.reduce((acc, i) => acc + (i.price * i.quantity), 0) * 100) / 100;

      const updatedCart: Cart = {
        ...prev,
        items: existingItems,
        totalQuantity,
        subtotalAmount,
        updatedAt: new Date().toISOString()
      };
      try { localStorage.setItem('cart', JSON.stringify(updatedCart)); } catch {}
      return updatedCart;
    });

    try {
      if (qty <= 0) {
        const res = await cartApi.removeItem(productId);
        if (res.success && res.data) saveCartLocal(res.data);
      } else {
        const res = await cartApi.updateQuantity(productId, qty);
        if (res.success && res.data) saveCartLocal(res.data);
      }
    } catch (err) {
      console.warn('Backend update quantity failed, used local cart:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = async (productId: string) => {
    setIsUpdating(true);

    // Optimistic removal
    setCart(prev => {
      if (!prev) return null;
      const existingItems = prev.items.filter(i => i.productId !== productId);
      const totalQuantity = existingItems.reduce((acc, i) => acc + i.quantity, 0);
      const subtotalAmount = Math.round(existingItems.reduce((acc, i) => acc + (i.price * i.quantity), 0) * 100) / 100;

      const updatedCart: Cart = {
        ...prev,
        items: existingItems,
        totalQuantity,
        subtotalAmount,
        updatedAt: new Date().toISOString()
      };
      try { localStorage.setItem('cart', JSON.stringify(updatedCart)); } catch {}
      return updatedCart;
    });

    try {
      const res = await cartApi.removeItem(productId);
      if (res.success && res.data) saveCartLocal(res.data);
    } catch (err) {
      console.warn('Backend remove item failed, used local cart:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const clearCart = async () => {
    setIsUpdating(true);
    saveCartLocal(null);
    try {
      const res = await cartApi.clearCart();
      if (res.success && res.data) saveCartLocal(res.data);
    } catch (err) {
      console.warn('Backend clear cart failed, used local cart:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const itemCount = cart?.totalQuantity || 0;
  const subtotal = cart?.subtotalAmount || 0;

  return (
    <CartContext.Provider value={{ cart, itemCount, subtotal, addItem, updateQty, removeItem, clearCart, refreshCart, isUpdating, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const isWishlisted = useCallback((productId: string) => {
    return wishlist.some(p => p.id === productId);
  }, [wishlist]);

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist(prev => prev.filter(p => p.id !== productId));
  }, []);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider value={{ wishlist, wishlistCount, isWishlisted, toggleWishlist, removeFromWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev.slice(-3), { id, message, type, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div 
        style={{
          position: 'fixed',
          bottom: 'calc(80px + env(safe-area-inset-bottom))',
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pointerEvents: 'none',
          maxWidth: 380,
          width: 'calc(100vw - 32px)',
        }}
        aria-live="polite"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              pointerEvents: 'auto',
              padding: '12px 16px',
              borderRadius: 'var(--r-md)',
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              border: `1px solid ${
                t.type === 'success' 
                  ? 'rgba(16, 185, 129, 0.4)' 
                  : t.type === 'error' 
                  ? 'rgba(239, 68, 68, 0.4)' 
                  : 'var(--glass-border)'
              }`,
              boxShadow: 'var(--glass-shadow), 0 10px 25px -5px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div 
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: t.type === 'success' ? 'var(--c-success)' : t.type === 'error' ? 'var(--c-error)' : 'var(--c-accent-2)',
                  flexShrink: 0,
                }} 
              />
              <div>
                {t.title && (
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {t.title}
                  </div>
                )}
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text-1)' }}>
                  {t.message}
                </div>
              </div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--c-text-3)',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export const useCart = () => useContext(CartContext);
export const useWishlist = () => useContext(WishlistContext);
export const useTheme = () => useContext(ThemeContext);
export const useToast = () => useContext(ToastContext);
