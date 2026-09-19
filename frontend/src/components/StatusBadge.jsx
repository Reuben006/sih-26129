import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertTriangle, ArrowRightCircle } from 'lucide-react';

export default function StatusBadge({ status, size = 'sm' }) {
  const norm = (status || 'PENDING').toUpperCase();

  const configs = {
    APPROVED: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      icon: CheckCircle2,
      label: 'Approved',
    },
    IN_PROGRESS: {
      bg: 'bg-blue-50 text-blue-700 border-blue-300',
      icon: Clock,
      label: 'In Progress',
    },
    SUBMITTED: {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-300',
      icon: ArrowRightCircle,
      label: 'Submitted',
    },
    IN_REVIEW: {
      bg: 'bg-amber-50 text-amber-700 border-amber-300',
      icon: Clock,
      label: 'In Review',
    },
    PENDING: {
      bg: 'bg-slate-50 text-slate-600 border-slate-300',
      icon: Clock,
      label: 'Pending',
    },
    REJECTED: {
      bg: 'bg-rose-50 text-rose-700 border-rose-300',
      icon: XCircle,
      label: 'Rejected',
    },
    ERROR: {
      bg: 'bg-red-50 text-red-700 border-red-300',
      icon: AlertTriangle,
      label: 'System Error',
    },
    FAILED: {
      bg: 'bg-red-50 text-red-700 border-red-300',
      icon: AlertTriangle,
      label: 'Failed',
    },
  };

  const config = configs[norm] || configs.PENDING;
  const Icon = config.icon;
  const sizeClasses = size === 'lg' ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${sizeClasses}`}
    >
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      {config.label}
    </span>
  );
}
