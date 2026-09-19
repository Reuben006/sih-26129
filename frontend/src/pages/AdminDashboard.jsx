import React, { useState, useEffect } from 'react';
import {
  Activity,
  Layers,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Server,
  Zap,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { applicationService } from '../services/applicationService';
import AuditLogTable from '../components/AuditLogTable';

export default function AdminDashboard({ onSelectApplication }) {
  const [summary, setSummary] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [simulationStatus, setSimulationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sum, logs, sim] = await Promise.all([
        applicationService.getDashboardSummary(),
        applicationService.getAllAuditLogs(50),
        applicationService.getSimulationStatus(),
      ]);
      setSummary(sum);
      setAuditLogs(logs);
      setSimulationStatus(sim);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleFault = async (dept, currentFail) => {
    setToggling(true);
    try {
      await applicationService.toggleSimulatedFailure(dept, !currentFail);
      await fetchData();
    } catch (e) {
      alert('Failed to update simulation flag');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-govblue-700 uppercase tracking-wider bg-govblue-50 px-2.5 py-1 rounded-md border border-govblue-200">
            Middleware Administrator Console
          </span>
          <h1 className="text-xl font-black text-slate-900 mt-2">
            Interoperability Health, Monitoring & Fault Injection
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry across heterogeneous legacy and modern departmental connectors
          </p>
        </div>

        <button
          onClick={fetchData}
          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
          title="Refresh metrics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* High Level KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Total Applications</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{summary?.total_applications || 0}</p>
          <span className="text-[10px] text-blue-600 font-medium mt-1 block">
            {summary?.in_progress || 0} currently traversing pipeline
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Clearances Approved</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{summary?.approved || 0}</p>
          <span className="text-[10px] text-emerald-700 font-medium mt-1 block">
            End-to-end unified licenses
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Rejections & Errors</span>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-2xl font-black text-rose-600">{summary?.rejected || 0}</span>
            <span className="text-xs text-red-500">/ {summary?.failed || 0} errors</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Handled gracefully</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Active Connectors</span>
          <p className="text-2xl font-black text-govblue-600 mt-1">{summary?.active_connectors || 3}</p>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Avg SLA: {summary?.avg_processing_time_hours || 1.8} hours
          </span>
        </div>
      </div>

      {/* Department Connectors & Resilience Fault Injection */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-govsaffron-500" />
              <h2 className="font-bold text-base text-slate-900">
                Department Gateway Health & Live Fault Injection
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Demonstrate middleware resilience to judges: Simulate a department server outage and verify error isolation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summary?.department_metrics?.map((dept) => {
            const flagKey = `${dept.department_code.toLowerCase()}_fail`;
            const isFailing = simulationStatus?.simulation_flags?.[flagKey] || false;

            return (
              <div
                key={dept.department_code}
                className={`p-4 rounded-xl border transition ${
                  isFailing
                    ? 'bg-rose-50/60 border-rose-300'
                    : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {dept.department_code}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isFailing
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {isFailing ? 'OUTAGE SIMULATED' : 'HEALTHY'}
                  </span>
                </div>

                <h3 className="text-xs font-semibold text-slate-700 mb-2">
                  {dept.department_name}
                </h3>

                <div className="space-y-1 text-[11px] text-slate-600 mb-4">
                  <div className="flex justify-between">
                    <span>Total Routed:</span>
                    <span className="font-semibold">{dept.total_assigned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approved:</span>
                    <span className="font-semibold text-emerald-600">{dept.approved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rejected:</span>
                    <span className="font-semibold text-rose-600">{dept.rejected}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Errors:</span>
                    <span className="font-semibold text-red-600">{dept.error_count}</span>
                  </div>
                </div>

                {/* Fault Simulator Button */}
                <button
                  type="button"
                  disabled={toggling}
                  onClick={() => handleToggleFault(dept.department_code.toLowerCase(), isFailing)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
                    isFailing
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  <Server className="w-3.5 h-3.5" />
                  <span>
                    {isFailing ? 'Restore Gateway' : 'Simulate Gateway Down'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Audit Trail */}
      <AuditLogTable auditLogs={auditLogs} />
    </div>
  );
}
