import React from 'react';
import { Bell, Check, AlertCircle, Info, CheckCircle, X } from 'lucide-react';

export default function NotificationDrawer({ isOpen, onClose, notifications, onMarkAsRead }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-govblue-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-govsaffron-500" />
              <h2 className="font-semibold text-base">Notifications & Event Stream</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-govblue-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              notifications.map((n) => {
                const isSuccess = n.type === 'SUCCESS';
                const isDanger = n.type === 'DANGER';
                return (
                  <div
                    key={n.id}
                    className={`p-3 rounded-lg border transition ${
                      n.is_read
                        ? 'bg-slate-50 border-slate-200 text-slate-600'
                        : 'bg-blue-50/70 border-blue-200 text-slate-800 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        {isSuccess ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        ) : isDanger ? (
                          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <h4 className="text-xs font-semibold">{n.title}</h4>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {!n.is_read && (
                        <button
                          onClick={() => onMarkAsRead(n.id)}
                          title="Mark as read"
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
