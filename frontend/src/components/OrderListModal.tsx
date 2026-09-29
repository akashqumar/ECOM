import React from 'react';
import { Order } from '../types';
import { X, ExternalLink } from 'lucide-react';

interface OrderListModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onSelectOrder: (orderId: string) => void;
}

export const OrderListModal: React.FC<OrderListModalProps> = ({
  isOpen,
  onClose,
  orders,
  onSelectOrder,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white">Your Orders</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {orders.length}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {orders.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">No past orders found.</p>
          ) : (
            orders.map((o) => (
              <div
                key={o.id}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white font-mono">{o.orderNumber}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      o.status === 'CONFIRMED' || o.status === 'PAID'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : o.status === 'FAILED' || o.status === 'CANCELLED'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {o.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {new Date(o.createdAt).toLocaleString()} • {o.items.length} items
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">${o.totalAmount.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-500 uppercase">{o.currency}</div>
                  </div>

                  <button
                    onClick={() => onSelectOrder(o.id)}
                    className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition"
                    title="View Saga Timeline"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
