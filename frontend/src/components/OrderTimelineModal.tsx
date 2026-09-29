import React from 'react';
import { Order, OrderTimeline } from '../types';
import { X, CheckCircle2, Clock, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

interface OrderTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeline: OrderTimeline | null;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const OrderTimelineModal: React.FC<OrderTimelineModalProps> = ({
  isOpen,
  onClose,
  timeline,
  onRefresh,
  isLoading,
}) => {
  if (!isOpen || !timeline) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Order Fulfillment Status</h3>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                timeline.orderStatus === 'CONFIRMED' || timeline.orderStatus === 'PAID'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : timeline.orderStatus === 'FAILED' || timeline.orderStatus === 'CANCELLED'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {timeline.orderStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">Order #{timeline.orderNumber}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Refresh timeline"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Saga Info Banner */}
        <div className="px-6 py-3 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Saga Status:</span>
            <span className="font-mono font-semibold text-indigo-400">{timeline.sagaStatus}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Step:</span>
            <span className="font-mono text-slate-300">{timeline.currentStep}</span>
          </div>
        </div>

        {/* Timeline body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {timeline.timeline.map((event, idx) => {
            const isCompleted = event.status === 'COMPLETED';
            const isFailed = event.status === 'FAILED';

            return (
              <div key={idx} className="flex gap-4 relative">
                {idx !== timeline.timeline.length - 1 && (
                  <div className="absolute left-4 top-8 -bottom-6 w-0.5 bg-slate-800" />
                )}

                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                  isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : isFailed
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isFailed ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 pt-0.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">{event.title}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{event.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
