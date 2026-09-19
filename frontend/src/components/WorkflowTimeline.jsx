import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, Building2, UtensilsCrossed, Flame, Award } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function WorkflowTimeline({ steps, overallStatus, currentStepOrder }) {
  const getDeptIcon = (code) => {
    switch (code) {
      case 'MUNICIPALITY':
        return Building2;
      case 'FSSAI':
        return UtensilsCrossed;
      case 'FIRE':
        return Flame;
      default:
        return Building2;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Sequential Inter-Departmental Workflow</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configured dynamic pipeline orchestrating federated stage approvals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Overall Status:</span>
          <StatusBadge status={overallStatus} size="lg" />
        </div>
      </div>

      <div className="relative">
        {/* Horizontal Connector Line (desktop) */}
        <div className="hidden md:block absolute top-1/2 left-8 right-8 h-0.5 bg-slate-200 -translate-y-6 z-0" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
          {steps.map((step, idx) => {
            const Icon = getDeptIcon(step.department_code);
            const isApproved = step.status === 'APPROVED';
            const isRejected = step.status === 'REJECTED';
            const isError = step.status === 'ERROR';
            const isCurrent = step.is_current || (overallStatus === 'IN_PROGRESS' && step.step_order === currentStepOrder);
            const isPending = step.status === 'PENDING' && !isCurrent;

            let iconBg = 'bg-slate-100 text-slate-400 border-slate-300';
            if (isApproved) {
              iconBg = 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20';
            } else if (isRejected) {
              iconBg = 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20';
            } else if (isError) {
              iconBg = 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20';
            } else if (isCurrent) {
              iconBg = 'bg-govblue-600 text-white border-govblue-600 ring-4 ring-blue-100 shadow-md';
            }

            return (
              <div
                key={step.step_order || idx}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-300 shadow-sm'
                    : isRejected
                    ? 'bg-rose-50/40 border-rose-200'
                    : isApproved
                    ? 'bg-emerald-50/30 border-emerald-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Stage {step.step_order}
                  </span>
                  <StatusBadge status={step.status} />
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm ${iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {step.department_name}
                    </h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                      {step.department_code}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-slate-500">
                    <span>Reference:</span>
                    <span className="font-mono font-semibold text-slate-700">
                      {step.external_reference || '—'}
                    </span>
                  </div>
                  {step.submitted_at && (
                    <div className="flex justify-between text-slate-400">
                      <span>Submitted:</span>
                      <span>
                        {new Date(step.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  {step.completed_at && (
                    <div className="flex justify-between text-slate-400">
                      <span>Completed:</span>
                      <span>
                        {new Date(step.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Stage 4: Final Outcome Node */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              overallStatus === 'APPROVED'
                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/30'
                : overallStatus === 'REJECTED'
                ? 'bg-rose-50 border-rose-300'
                : 'bg-slate-50/70 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Stage 4
              </span>
              <StatusBadge status={overallStatus} />
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm ${
                  overallStatus === 'APPROVED'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : overallStatus === 'REJECTED'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-slate-200 text-slate-500 border-slate-300'
                }`}
              >
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  Unified Clearance
                </h4>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Final Establishment License
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
              {overallStatus === 'APPROVED' ? (
                <p className="text-emerald-700 font-medium">✓ All 3 departments granted clearance</p>
              ) : overallStatus === 'REJECTED' ? (
                <p className="text-rose-700 font-medium">✕ Workflow terminated due to rejection</p>
              ) : (
                <p className="text-slate-500">Awaiting prior stages completion</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
