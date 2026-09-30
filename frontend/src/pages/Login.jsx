import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';

const PORTAL_LABELS = {
  CITIZEN: 'Citizen Portal',
  MUNICIPALITY: 'Municipality Portal',
  FSSAI: 'FSSAI Portal',
  FIRE: 'Fire Services Portal',
  GST: 'GST & Tax Portal',
  SHOPS: 'Shops & Establishments Portal',
  ADMIN: 'Administrator Portal',
};

const DEMO_EMAILS = {
  CITIZEN: 'citizen@govconnect.in',
  MUNICIPALITY: 'official@govconnect.in',
  FSSAI: 'fssai@govconnect.in',
  FIRE: 'fire@govconnect.in',
  GST: 'gst@govconnect.in',
  SHOPS: 'shops@govconnect.in',
  ADMIN: 'admin@govconnect.in',
};

export default function Login({ portal, onLoginSuccess, onNavigateRegister, onBackToPortals }) {
  const [email, setEmail] = useState(DEMO_EMAILS[portal] || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.login(email, password, portal);
      onLoginSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail(DEMO_EMAILS[portal] || '');
    setPassword('Password123!');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col justify-between font-sans">
      <div className="bg-[#081d39] text-white text-[11px] py-1.5 px-4 sm:px-8 border-b border-blue-950">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="font-semibold text-govsaffron-500">महाराष्ट्र शासन | Government of Maharashtra</span>
          <span className="hidden sm:inline text-slate-400">माहिती तंत्रज्ञान संचालनालय</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 my-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-[#0c2d57] p-6 text-center text-white border-b-4 border-govsaffron-500">
            <img src="/maharashtra-emblem.png" alt="Government of Maharashtra" className="w-16 h-16 mx-auto object-contain mb-2" />
            <h1 className="text-xl font-black tracking-tight">{PORTAL_LABELS[portal]}</h1>
            <p className="text-xs text-blue-200 mt-1">Secure GovConnect sign in</p>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            <button
              type="button"
              onClick={onBackToPortals}
              className="text-xs text-slate-500 hover:text-govblue-800 font-semibold flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Choose another portal
            </button>

            <div className="bg-govblue-50 border border-govblue-100 rounded-xl p-3">
              <p className="text-xs font-bold text-govblue-900">{PORTAL_LABELS[portal]}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                You must authenticate again when switching to another portal.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email ID</label>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
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
                type="button"
                onClick={fillDemo}
                className="w-full py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
              >
                Fill SIH Demo Credentials
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-govsaffron-500 hover:bg-govsaffron-600 shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {portal === 'CITIZEN' && (
              <div className="text-center pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onNavigateRegister}
                  className="text-xs text-[#0c2d57] hover:text-blue-800 font-bold hover:underline"
                >
                  New applicant? Register for Maha-ICSG Identity
                </button>
              </div>
            )}

            <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Portal-scoped authentication
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
