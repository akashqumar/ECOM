import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import type { User } from '../types';

export interface AdminCustomization {
  accentColor: string;
  defaultWarehouse: string;
  lowStockThreshold: number;
  autoRefreshInterval: number; // in seconds
  soundAlerts: boolean;
  compactMode: boolean;
}

const DEFAULT_CUSTOMIZATION: AdminCustomization = {
  accentColor: '#6366f1',
  defaultWarehouse: 'WH-MAIN-01',
  lowStockThreshold: 25,
  autoRefreshInterval: 15,
  soundAlerts: false,
  compactMode: false,
};

interface AdminContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  customization: AdminCustomization;
  updateCustomization: (updates: Partial<AdminCustomization>) => void;
}

const AdminContext = createContext<AdminContextType>(null!);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('admin_user') || 'null');
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'));
  const [isLoading, setIsLoading] = useState(false);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('admin_theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  const [customization, setCustomization] = useState<AdminCustomization>(() => {
    try {
      const saved = localStorage.getItem('admin_customization');
      return saved ? { ...DEFAULT_CUSTOMIZATION, ...JSON.parse(saved) } : DEFAULT_CUSTOMIZATION;
    } catch {
      return DEFAULT_CUSTOMIZATION;
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('admin_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', customization.accentColor);
    document.documentElement.style.setProperty('--accent-hover', `${customization.accentColor}dd`);
    document.documentElement.style.setProperty('--accent-light', `${customization.accentColor}25`);
    localStorage.setItem('admin_customization', JSON.stringify(customization));
  }, [customization]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const updateCustomization = (updates: Partial<AdminCustomization>) => {
    setCustomization((prev) => ({ ...prev, ...updates }));
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      if (res.success) {
        if (res.data.user.role !== 'ROLE_ADMIN') {
          throw new Error('Unauthorized: Account lacks ROLE_ADMIN privileges');
        }
        setToken(res.data.accessToken);
        setUser(res.data.user);
        localStorage.setItem('admin_token', res.data.accessToken);
        localStorage.setItem('admin_user', JSON.stringify(res.data.user));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  return (
    <AdminContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        theme,
        toggleTheme,
        customization,
        updateCustomization,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
