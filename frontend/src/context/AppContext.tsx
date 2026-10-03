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
  addItem: (product: { id: string; sku: string; name: string; price: number; images?: string[] }, qty?: number) => Promise<void>;
  updateQty: (productId: string, qty: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  isUpdating: boolean;
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

const AuthContext = createContext<AuthContextType>(null!);
const CartContext = createContext<CartContextType>(null!);
const WishlistContext = createContext<WishlistContextType>(null!);
const ThemeContext = createContext<ThemeContextType>(null!);

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
    <CartContext.Provider value={{ cart, itemCount, subtotal, addItem, updateQty, removeItem, clearCart, refreshCart, isUpdating }}>
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

export const useAuth = () => useContext(AuthContext);
export const useCart = () => useContext(CartContext);
export const useWishlist = () => useContext(WishlistContext);
export const useTheme = () => useContext(ThemeContext);
