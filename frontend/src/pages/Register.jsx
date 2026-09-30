import React, { useState } from 'react';
import { User, Mail, Lock, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { authService } from '../services/authService';

export default function Register({ onRegisterSuccess, onNavigateLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // English / Marathi Toggle (for presentation show)
  const [selectedLang, setSelectedLang] = useState('EN');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.register({
        name,
        email,
        password,
        role: 'CITIZEN',
      });
      onRegisterSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please verify details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col justify-between font-sans">
      {/* 1. TOP ACCESSIBILITY & STATE UTILITY BAR */}
      <div className="bg-[#081d39] text-white text-[11px] py-1.5 px-4 sm:px-8 border-b border-blue-950">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center space-x-3 text-slate-300">
            <span className="font-semibold text-govsaffron-500">
              महाराष्ट्र शासन | Government of Maharashtra
            </span>
            <span className="text-slate-600">|</span>
            <span className="hidden sm:inline text-slate-400">
              माहिती तंत्रज्ञान संचालनालय (Directorate of Information Technology)
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Accessibility Controls */}
            <div className="hidden sm:flex items-center space-x-1.5 bg-[#0c2d57] px-2 py-0.5 rounded border border-blue-900 text-[10px]">
              <button type="button" className="hover:text-amber-300 px-1 font-bold">A-</button>
              <button type="button" className="hover:text-amber-300 px-1 font-bold">A</button>
              <button type="button" className="hover:text-amber-300 px-1 font-bold">A+</button>
            </div>

            {/* Language Switcher */}
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

      {/* 2. REGISTRATION CARD */}
      <div className="flex-1 flex items-center justify-center p-4 my-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* Official Emblem Banner */}
          <div className="bg-[#0c2d57] p-6 text-center text-white border-b-4 border-govsaffron-500">
            <img
              src="/maharashtra-emblem.png"
              alt="Government of Maharashtra"
              className="w-16 h-16 mx-auto object-contain drop-shadow-md mb-2"
            />
            <h1 className="text-xl font-black tracking-tight">Citizen Single Window Registration</h1>
            <p className="text-xs text-blue-200 mt-0.5">
              Create Maha-ICSG Federated Identity • नवीन नागरिक नोंदणी
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Legal Name (as on Identity Records) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0c2d57]"
                    placeholder="e.g. Swayam Dudhela"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Email ID *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0c2d57]"
                    placeholder="citizen@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Create Password (minimum 6 characters) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0c2d57]"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0c2d57] flex-shrink-0 mt-0.5" />
                <span>
                  Your profile serves as a unified digital identifier across all connected municipal and state departmental gateways.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-govsaffron-500 hover:bg-govsaffron-600 shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Creating Identity...' : 'Complete Registration'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={onNavigateLogin}
                className="text-xs text-[#0c2d57] hover:text-blue-800 font-bold hover:underline"
              >
                Already have an account? Sign in here
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. GOVERNMENT FOOTER */}
      <div className="bg-[#081d39] text-white text-xs py-3 px-4 text-center border-t border-blue-950">
        <p className="text-slate-400 text-[11px]">
          © 2026 Government of Maharashtra • Developed by <strong className="text-white">Origin X</strong> (Team ID: 134028) for SIH 2026 (PS-26129)
        </p>
      </div>
    </div>
  );
}