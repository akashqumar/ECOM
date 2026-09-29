import React from 'react';
import { NotificationItem } from '../types';
import { X, Bell, Check } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Event Notifications</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-3">
          {notifications.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">No notifications received yet.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                  n.readAt ? 'bg-slate-900/60 border-slate-800/80 opacity-70' : 'bg-slate-800/50 border-slate-700/80'
                }`}
              >
                <div>
                  <h4 className="text-xs font-semibold text-white">{n.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-500 font-mono mt-2 block">
                    {new Date(n.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                {!n.readAt && (
                  <button
                    onClick={() => onMarkRead(n.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition shrink-0"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
