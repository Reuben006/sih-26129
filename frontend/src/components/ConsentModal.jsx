import React from 'react';
import { ShieldCheck, ShieldAlert, X, AlertTriangle } from 'lucide-react';

export default function ConsentModal({ isOpen, onClose, consents, onRevoke, onGrant, isCitizen }) {
  if (!isOpen) return null;

  const activeConsent = consents?.find((c) => c.status === 'ACTIVE');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-govblue-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-govsaffron-500" />
            <div>
              <h3 className="font-bold text-base">DPDP Data Sharing Consent Ledger</h3>
              <p className="text-xs text-slate-300">Digital Personal Data Protection Act 2023 Framework</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          <div className="p-3.5 rounded-xl border bg-slate-50 border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900">Current Consent Status:</span>
              <span
                className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                  activeConsent
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {activeConsent ? 'ACTIVE & VALID' : 'REVOKED / WITHHELD'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Authorized Data Scope:</span>
              <p className="font-medium text-slate-800 mt-0.5">
                {activeConsent?.data_scope || 'Identity (PAN), Premises Address, Contact, Building Dimensions'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Statutory Purpose:</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                {activeConsent?.purpose || 'Automated federated routing across Municipal Corporation, FSSAI FoSCoS, and Directorate of Fire Services for unified establishment clearance.'}
              </p>
            </div>

            {activeConsent?.granted_at && (
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-200">
                Granted on: {new Date(activeConsent.granted_at).toLocaleString()}
              </div>
            )}
          </div>

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-amber-900 text-[11px]">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p>
              In accordance with DPDP regulations, citizens possess the statutory right to withdraw consent at any time. Revoking consent will freeze subsequent department routing.
            </p>
          </div>

          {/* Action Buttons */}
          {isCitizen && (
            <div className="pt-2 flex justify-end gap-3">
              {activeConsent ? (
                <button
                  onClick={onRevoke}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-sm transition"
                >
                  Revoke Consent
                </button>
              ) : (
                <button
                  onClick={onGrant}
                  className="px-4 py-2 bg-govblue-600 hover:bg-govblue-700 text-white font-semibold rounded-lg shadow-sm transition"
                >
                  Re-Grant Statutory Consent
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
