import React, { useState, useEffect } from 'react';
import { Bell, LogOut, Layers } from 'lucide-react';
import { authService } from '../services/authService';
import { applicationService } from '../services/applicationService';
import NotificationDrawer from './NotificationDrawer';

export default function Navbar({ currentUser, onSwitchPortal, currentView, setCurrentView }) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // English / Marathi Toggle (for presentation show)
  const [selectedLang, setSelectedLang] = useState('EN');

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
      {/* 1. TOP ACCESSIBILITY & STATE UTILITY BAR */}
      <div className="bg-[#081d39] text-white text-[11px] py-1.5 px-4 sm:px-8 border-b border-blue-950">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center space-x-3 text-slate-300">
            <span className="font-semibold tracking-wide text-govsaffron-500">
              महाराष्ट्र शासन | Government of Maharashtra
            </span>
            <span className="text-slate-600">|</span>
            <span className="hidden sm:inline text-slate-400">
              माहिती तंत्रज्ञान संचालनालय (Directorate of Information Technology)
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Accessibility Font Size Controls */}
            <div className="hidden sm:flex items-center space-x-1.5 bg-[#0c2d57] px-2 py-0.5 rounded border border-blue-900 text-[10px]">
              <button type="button" className="hover:text-amber-300 px-1 font-bold">A-</button>
              <button type="button" className="hover:text-amber-300 px-1 font-bold">A</button>
              <button type="button" className="hover:text-amber-300 px-1 font-bold">A+</button>
            </div>

            {/* Interactive English / Marathi Switcher */}
            <div className="flex items-center bg-white/10 rounded overflow-hidden border border-white/25 text-[11px]">
              <button
                type="button"
                onClick={() => setSelectedLang('EN')}
                className={`px-2.5 py-0.5 font-medium transition ${
                  selectedLang === 'EN'
                    ? 'bg-govsaffron-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setSelectedLang('MR')}
                className={`px-2.5 py-0.5 font-medium transition ${
                  selectedLang === 'MR'
                    ? 'bg-govsaffron-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                मराठी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN MAHARASHTRA GOVERNMENT HEADER */}
      <header className="bg-govblue-900 text-white shadow-md border-b-2 border-govsaffron-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Official Maharashtra State Emblem & Platform Title */}
            <div className="flex items-center gap-3.5">
              <img
                src="/maharashtra-emblem.png"
                alt="Government of Maharashtra Official Emblem"
                className="w-14 h-14 object-contain drop-shadow-md flex-shrink-0"
              />

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight">Maha-ICSG</span>
                  <span className="text-[10px] uppercase font-semibold tracking-wider bg-govsaffron-500/20 text-govsaffron-500 border border-govsaffron-500/40 px-1.5 py-0.5 rounded">
                    SIH 2026 • PS 26129 • Origin X (#134028)
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Maharashtra Interoperable Citizen Service Gateway • एकात्मिक सेवा महाद्वार
                </p>
              </div>
            </div>

            {/* Persona Switcher, Architecture Shortcut & Controls */}
            {currentUser && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onSwitchPortal}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-blue-700 bg-govblue-800/60 text-slate-200 hover:bg-govblue-800 transition"
                  title="Switch account and sign in again"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Switch Account</span>
                </button>

                {/* Architecture Shortcut */}
                <button
                  type="button"
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

                {/* Notifications */}
                <button
                  type="button"
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

                {/* User Info & Sign Out */}
                <div className="flex items-center gap-2 pl-2 border-l border-govblue-700">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-medium text-white leading-none">{currentUser.name}</p>
                    <p className="text-[10px] text-govsaffron-500 font-semibold mt-0.5">{currentUser.role}</p>
                  </div>
                  <button
                    type="button"
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

      {/* Notification Stream Drawer */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
      />
    </>
  );
}