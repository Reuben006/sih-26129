import React, { useState, useEffect } from 'react';
import { Shield, Bell, User, LogOut, Layers, RefreshCw } from 'lucide-react';
import { authService } from '../services/authService';
import { applicationService } from '../services/applicationService';
import NotificationDrawer from './NotificationDrawer';

export default function Navbar({ currentUser, onSwitchRole, currentView, setCurrentView }) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const data = await applicationService.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 8000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleMarkAsRead = async (id) => {
    try {
      await applicationService.markNotificationRead(id);
      fetchNotifications();
    } catch {
      // ignore
    }
  };

  return (
    <>
      {/* Top Tricolor Banner */}
      <div className="h-1.5 w-full bg-gradient-to-r from-govsaffron-500 via-white to-govgreen-600" />

      {/* Main Government Navbar */}
      <header className="bg-govblue-900 text-white shadow-md border-b border-govblue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Platform Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-govblue-800 border border-blue-400/30 flex items-center justify-center shadow-inner">
                <Shield className="w-6 h-6 text-govsaffron-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight">GovConnect</span>
                  <span className="text-[10px] uppercase font-semibold tracking-wider bg-govsaffron-500/20 text-govsaffron-500 border border-govsaffron-500/40 px-1.5 py-0.5 rounded">
                    SIH 2026 • PS 129
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Government Federated Interoperability & Middleware Service Layer
                </p>
              </div>
            </div>

            {/* Persona Switcher & Controls */}
            {currentUser && (
              <div className="flex items-center gap-4">
                {/* Fast Switcher for Judges */}
                <div className="hidden md:flex items-center bg-govblue-800/80 rounded-lg p-1 border border-blue-700/50 text-xs">
                  <span className="px-2 text-slate-400 font-medium">Demo Persona:</span>
                  <button
                    onClick={() => onSwitchRole('citizen@govconnect.in')}
                    className={`px-2.5 py-1 rounded font-medium transition ${
                      currentUser.role === 'CITIZEN'
                        ? 'bg-govblue-500 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Citizen
                  </button>
                  <button
                    onClick={() => onSwitchRole('official@govconnect.in')}
                    className={`px-2.5 py-1 rounded font-medium transition ${
                      currentUser.role === 'OFFICIAL'
                        ? 'bg-govblue-500 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Official
                  </button>
                  <button
                    onClick={() => onSwitchRole('admin@govconnect.in')}
                    className={`px-2.5 py-1 rounded font-medium transition ${
                      currentUser.role === 'ADMIN'
                        ? 'bg-govblue-500 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Admin
                  </button>
                </div>

                {/* Architecture Diagram Shortcut */}
                <button
                  onClick={() => setCurrentView('architecture')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition ${
                    currentView === 'architecture'
                      ? 'bg-govsaffron-500 text-slate-900 border-govsaffron-600 font-semibold'
                      : 'bg-govblue-800/60 text-slate-200 border-blue-700 hover:bg-govblue-800'
                  }`}
                  title="View Interoperability Architecture"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Architecture</span>
                </button>

                {/* Notifications Bell */}
                <button
                  onClick={() => setIsNotifOpen(true)}
                  className="relative p-2 rounded-lg bg-govblue-800 text-slate-200 hover:text-white hover:bg-govblue-700 transition"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-govsaffron-500 text-slate-900 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* User Menu */}
                <div className="flex items-center gap-2 pl-2 border-l border-govblue-700">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-medium text-white leading-none">{currentUser.name}</p>
                    <p className="text-[10px] text-govsaffron-500 font-semibold mt-0.5">{currentUser.role}</p>
                  </div>
                  <button
                    onClick={authService.logout}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-govblue-800 transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
      />
    </>
  );
}
