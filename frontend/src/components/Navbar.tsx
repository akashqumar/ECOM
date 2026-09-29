import React from 'react';
import { ShoppingBag, Search, Bell, User as UserIcon, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenNotifications: () => void;
  onOpenOrders: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categories: Array<{ id: string; name: string }>;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenNotifications,
  onOpenOrders,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categories,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectCategory('')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                AuraCommerce
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Saga 2.0
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search premium tech, apparel, audio..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenOrders}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-2"
            >
              <span>My Orders</span>
            </button>

            <button
              onClick={onOpenNotifications}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500"></span>
            </button>

            <button
              onClick={onOpenCart}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="px-1.5 py-0.2 text-xs bg-white text-indigo-700 font-bold rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none border-t border-slate-800/60 text-xs">
          <button
            onClick={() => onSelectCategory('')}
            className={`px-3 py-1 rounded-full transition whitespace-nowrap ${
              selectedCategory === ''
                ? 'bg-indigo-600 text-white font-medium'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All Products
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectCategory(c.id)}
              className={`px-3 py-1 rounded-full transition whitespace-nowrap ${
                selectedCategory === c.id
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
