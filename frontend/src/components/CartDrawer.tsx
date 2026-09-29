import React from 'react';
import { Cart } from '../types';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart | null;
  onUpdateQty: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  isCheckingOut?: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onCheckout,
  isCheckingOut,
}) => {
  if (!isOpen) return null;

  const items = cart?.items || [];
  const total = cart?.totalAmount || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Your Shopping Cart</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-mono">
                {items.length} items
              </span>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 text-sm">Your cart is currently empty.</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.productId} className="flex gap-4 p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white line-clamp-1">{item.productName}</h4>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">${item.unitPrice.toFixed(2)} each</div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden bg-slate-800">
                        <button
                          onClick={() => onUpdateQty(item.productId, item.quantity - 1)}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-mono font-medium text-white">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQty(item.productId, item.quantity + 1)}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.productId)}
                        className="text-xs text-rose-400 hover:text-rose-300 transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-sm font-bold text-white">
                    ${item.subtotal.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-800 bg-slate-900/60 flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="font-semibold text-white font-mono">${total.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Shipping & Taxes</span>
                <span className="text-emerald-400 font-medium">Free</span>
              </div>
              <div className="flex items-center justify-between text-base pt-2 border-t border-slate-800 font-bold">
                <span className="text-white">Estimated Total</span>
                <span className="text-indigo-400 font-mono">${total.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Protected by Distributed Saga Orchestration & Zero-Overselling Locks</span>
              </div>

              <button
                onClick={onCheckout}
                disabled={isCheckingOut}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                <span>{isCheckingOut ? 'Processing Saga Transaction...' : 'Proceed to Checkout'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
