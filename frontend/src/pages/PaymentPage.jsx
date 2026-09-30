import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, CreditCard, Download, FileCheck2, Loader2, ShieldCheck } from 'lucide-react';
import { applicationService } from '../services/applicationService';
import StatusBadge from '../components/StatusBadge';

export default function PaymentPage({ applicationId, onBack, onPaymentComplete }) {
  const [application, setApplication] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [app, pay] = await Promise.all([
        applicationService.getApplication(applicationId),
        applicationService.getPayment(applicationId),
      ]);
      setApplication(app);
      setPayment(pay);
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to load payment information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [applicationId]);

  const handlePay = async () => {
    setPaying(true);
    setError('');
    try {
      const paid = await applicationService.makePayment(applicationId);
      setPayment(paid);
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || 'Payment could not be completed.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-govblue-600 mb-2" />
        <p className="text-xs text-slate-500">Loading secure payment details...</p>
      </div>
    );
  }

  const paid = payment?.status === 'PAID';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <button onClick={onBack} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-govblue-700">Citizen Payment Gateway</p>
            <h1 className="text-xl font-black text-slate-900 mt-1">Final Establishment Clearance Fee</h1>
            <p className="text-xs text-slate-500 mt-1">
              {application?.application_number} • {application?.business_name}
            </p>
          </div>
          <StatusBadge status={application?.overall_status} size="lg" />
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-700">
          <span className="font-bold">Payment Error: </span>{error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-govblue-50 text-govblue-800 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-900">Government Service Fee</h2>
            <p className="text-xs text-slate-500">Mock SIH payment gateway for the prototype</p>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Unified establishment clearance</span>
            <span className="text-2xl font-black text-slate-900">₹{Number(payment?.amount || 500).toFixed(2)}</span>
          </div>
        </div>

        {!paid ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {['UPI', 'Debit / Credit Card', 'Net Banking'].map((method) => (
                <div key={method} className="border border-slate-200 rounded-xl px-3 py-2.5 text-center font-semibold text-slate-700 bg-slate-50">
                  {method}
                </div>
              ))}
            </div>
            <button
              onClick={handlePay}
              disabled={paying || application?.overall_status !== 'PAYMENT_PENDING'}
              className="w-full py-3 rounded-xl bg-govblue-900 hover:bg-govblue-800 text-white text-xs font-bold shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              {paying ? 'Processing Secure Payment...' : 'Pay ₹500 & Issue Unified License'}
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-emerald-900">Payment Successful</p>
                <p className="text-xs text-emerald-700 mt-1">
                  All departmental clearances are complete and the unified license has been issued.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="border border-slate-200 rounded-xl p-3">
                <span className="text-slate-500">Transaction ID</span>
                <p className="font-mono font-bold mt-1">{payment.transaction_id}</p>
              </div>
              <div className="border border-slate-200 rounded-xl p-3">
                <span className="text-slate-500">Receipt Number</span>
                <p className="font-mono font-bold mt-1">{payment.receipt_number}</p>
              </div>
              <div className="border border-slate-200 rounded-xl p-3 sm:col-span-2">
                <span className="text-slate-500">Unified License Number</span>
                <p className="font-mono font-bold text-govblue-800 mt-1">{payment.license_number}</p>
              </div>
            </div>

            <button
              onClick={onPaymentComplete}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" /> View Application & License
            </button>
          </div>
        )}

        <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Prototype payment only — no real money is charged.
        </p>
      </div>
    </div>
  );
}
