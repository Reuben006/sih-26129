import React, { useState, useEffect } from 'react';
import { PlusCircle, FileText, CheckCircle2, Clock, XCircle, ArrowRight, Building2, RefreshCw } from 'lucide-react';
import { applicationService } from '../services/applicationService';
import StatusBadge from '../components/StatusBadge';

export default function CitizenDashboard({ onNavigateNew, onSelectApplication }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const data = await applicationService.getApplications();
      setApplications(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const total = applications.length;
  const inProgress = applications.filter((a) => a.overall_status === 'IN_PROGRESS').length;
  const approved = applications.filter((a) => a.overall_status === 'APPROVED').length;
  const rejected = applications.filter((a) => a.overall_status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      {/* Top Welcome Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-govblue-700 uppercase tracking-wider bg-govblue-50 px-2.5 py-1 rounded-md border border-govblue-200">
            Citizen Single Window Portal
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">
            Establishment Clearances & Interoperable Applications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Submit information once to automatically orchestrate Municipal Corporation, FSSAI, and Fire Department compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchApps}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Refresh applications"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onNavigateNew}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-govblue-900 hover:bg-govblue-800 shadow-md transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-govsaffron-500" />
            <span>New Establishment Application</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Applications</span>
            <FileText className="w-4 h-4 text-govblue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{total}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">In Verification</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">{inProgress}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Clearances Granted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{approved}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Rejections</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-2">{rejected}</p>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-base text-slate-900">Your Filed Submissions</h2>
          <span className="text-xs text-slate-500">{applications.length} applications tracked</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-govblue-600" />
            <p className="text-xs">Synchronizing federated registries...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No applications filed yet</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Submit your restaurant or business establishment once to initiate automated federated clearance across all departments.
            </p>
            <button
              onClick={onNavigateNew}
              className="mt-2 px-4 py-2 bg-govblue-900 text-white rounded-xl text-xs font-semibold hover:bg-govblue-800 transition"
            >
              Start First Application
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold">Application Number</th>
                  <th className="py-3 px-4 font-semibold">Business Establishment</th>
                  <th className="py-3 px-4 font-semibold">Proprietor</th>
                  <th className="py-3 px-4 font-semibold">PAN</th>
                  <th className="py-3 px-4 font-semibold">Department Breakdown</th>
                  <th className="py-3 px-4 font-semibold">Overall Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-govblue-700">
                      {app.application_number}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {app.business_name}
                      <span className="text-[10px] text-slate-400 block font-normal">{app.address}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{app.owner_name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{app.pan}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {app.department_statuses?.map((ds) => {
                          const code = ds.department?.code || 'DEP';
                          let pillColor = 'bg-slate-100 text-slate-600';
                          if (ds.status === 'APPROVED') pillColor = 'bg-emerald-100 text-emerald-800 font-bold';
                          if (ds.status === 'REJECTED') pillColor = 'bg-rose-100 text-rose-800 font-bold';
                          if (ds.status === 'SUBMITTED') pillColor = 'bg-blue-100 text-blue-800';
                          if (ds.status === 'ERROR') pillColor = 'bg-red-100 text-red-800';
                          return (
                            <span
                              key={ds.id}
                              className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono ${pillColor}`}
                              title={`${ds.department?.name}: ${ds.status}`}
                            >
                              {code.substring(0, 4)}: {ds.status.substring(0, 3)}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.overall_status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectApplication(app.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-govblue-900 hover:text-white text-slate-700 font-medium transition flex items-center gap-1 ml-auto"
                      >
                        <span>View Tracking</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
