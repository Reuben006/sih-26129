import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';

export default function Login({ onLoginSuccess, onNavigateRegister }) {
  const [email, setEmail] = useState('citizen@govconnect.in');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.login(email, password);
      onLoginSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
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

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        {/* Emblem & Portal Header */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-govblue-900 border border-govblue-700 flex items-center justify-center shadow-md">
            <Shield className="w-8 h-8 text-govsaffron-500" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
            GovConnect Portal
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Federated Interoperability Middleware • Single Sign-On
          </p>
        </div>

        {/* Quick Demo Personas For Judges */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <UserCheck className="w-4 h-4 text-govblue-600" />
            <span>SIH 2026 Judge Demo Personas (1-Click Login):</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleQuickLogin('citizen@govconnect.in')}
              className="py-1.5 px-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-800 hover:border-govblue-500 hover:text-govblue-600 shadow-sm transition"
            >
              Citizen
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('official@govconnect.in')}
              className="py-1.5 px-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-800 hover:border-govblue-500 hover:text-govblue-600 shadow-sm transition"
            >
              Official
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@govconnect.in')}
              className="py-1.5 px-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-800 hover:border-govblue-500 hover:text-govblue-600 shadow-sm transition"
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

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Official / Citizen Email ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-govblue-500"
                placeholder="user@govconnect.in"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Secure Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-govblue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-govblue-900 hover:bg-govblue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-govblue-500 shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={onNavigateRegister}
            className="text-xs text-govblue-600 hover:text-govblue-800 font-medium"
          >
            New citizen applicant? Register for Single Window Access
          </button>
        </div>
      </div>
    </div>
  );
}
