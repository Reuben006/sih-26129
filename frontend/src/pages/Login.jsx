import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, UserCheck, AlertCircle, ShieldCheck } from 'lucide-react';
import { authService } from '../services/authService';

export default function Login({ onLoginSuccess, onNavigateRegister }) {
  const [email, setEmail] = useState('citizen@govconnect.in');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [digiLoading, setDigiLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.login(email, password);
      onLoginSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (personaEmail) => {
    setEmail(personaEmail);
    setPassword('Password123!');
    setError('');
    setLoading(true);
    try {
      await authService.login(personaEmail, 'Password123!');
      onLoginSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  // Demo DigiLocker Federated Auth Handler
  const handleDigiLockerLogin = async () => {
    setError('');
    setDigiLoading(true);
    try {
      // Simulate DigiLocker OAuth handshake delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      await authService.login('citizen@govconnect.in', 'Password123!');
      onLoginSuccess();
    } catch (err) {
      setError('DigiLocker authentication failed.');
    } finally {
      setDigiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col justify-between font-sans">
      {/* Top Government Masthead */}
      <div className="bg-[#081d39] text-white text-[11px] py-1.5 px-4 sm:px-8 border-b border-blue-950">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-slate-300">
          <span className="font-semibold text-govsaffron-500">
            महाराष्ट्र शासन | Government of Maharashtra
          </span>
          <span className="hidden sm:inline text-slate-400">
            माहिती तंत्रज्ञान संचालनालय (Directorate of Information Technology)
          </span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center p-4 my-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-[#0c2d57] p-6 text-center text-white border-b-4 border-govsaffron-500">
            <img
              src="/maharashtra-emblem.png"
              alt="Government of Maharashtra"
              className="w-16 h-16 mx-auto object-contain drop-shadow-md mb-2"
            />
            <h1 className="text-xl font-black tracking-tight">Maha-ICSG SSO Gateway</h1>
            <p className="text-xs text-blue-200 mt-0.5">
              Federated Single Sign-On • एकात्मिक नागरिक ओळख प्रणाली
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            
            {/* 1. Official DigiLocker Federated Login Button */}
            <div>
             <button
              type="button"
              disabled={digiLoading || loading}
              onClick={handleDigiLockerLogin}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 shadow-sm transition flex items-center justify-center gap-3 border border-slate-300 hover:border-[#4B23D9] disabled:opacity-50 group"
             >
             <img
              src="/digilocker.png"
              alt="DigiLocker"
              className="h-7 w-auto object-contain group-hover:scale-105 transition-transform"
             />
    <span className="text-slate-700 font-bold text-xs">
      {digiLoading ? 'Connecting to MahaDigiLocker...' : 'Sign In with DigiLocker'}
    </span>
  </button>
  <p className="text-[10px] text-center text-slate-500 mt-1.5 flex items-center justify-center gap-1">
    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
    <span>Direct e-KYC consent integration under DPDP Act 2023</span>
  </p>
</div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[10px] uppercase font-bold text-slate-400 absolute">
                or sign in with credentials
              </span>
            </div>

            {/* SIH Evaluator Fast Personas */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                <UserCheck className="w-3.5 h-3.5 text-govsaffron-600" />
                <span>SIH Evaluator Demo Personas (1-Click):</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('citizen@govconnect.in')}
                  className="py-1 px-2 text-xs font-bold rounded-lg bg-white border border-amber-300 text-slate-800 hover:bg-govsaffron-500 hover:text-slate-950 hover:border-govsaffron-600 shadow-sm transition"
                >
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('official@govconnect.in')}
                  className="py-1 px-2 text-xs font-bold rounded-lg bg-white border border-amber-300 text-slate-800 hover:bg-govsaffron-500 hover:text-slate-950 hover:border-govsaffron-600 shadow-sm transition"
                >
                  Official
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@govconnect.in')}
                  className="py-1 px-2 text-xs font-bold rounded-lg bg-white border border-amber-300 text-slate-800 hover:bg-govsaffron-500 hover:text-slate-950 hover:border-govsaffron-600 shadow-sm transition"
                >
                  Admin
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Standard Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0c2d57]"
                    placeholder="user@govconnect.in"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0c2d57]"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || digiLoading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-govsaffron-500 hover:bg-govsaffron-600 shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In with Password'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={onNavigateRegister}
                className="text-xs text-[#0c2d57] hover:text-blue-800 font-bold hover:underline"
              >
                New applicant? Register for Maha-ICSG Identity
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Identity */}
      <div className="bg-[#081d39] text-white text-xs py-3 px-4 text-center border-t border-blue-950">
        <p className="text-slate-400 text-[11px]">
          © 2026 Government of Maharashtra • Developed by <strong className="text-white">Origin X</strong> (Team ID: 134028) for SIH 2026 (PS-26129)
        </p>
      </div>
    </div>
  );
}