import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, RefreshCw, Filter, Building2, UtensilsCrossed, Flame } from 'lucide-react';
import { applicationService } from '../services/applicationService';
import StatusBadge from '../components/StatusBadge';

export default function OfficialDashboard({ onSelectApplication }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [actionRemarks, setActionRemarks] = useState('');
  const [activeAction, setActiveAction] = useState(null); // { appId, deptId, action: 'APPROVED' | 'REJECTED' }

  const fetchData = async () => {
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
    fetchData();
  }, []);

  const handleExecuteAction = async () => {
    if (!activeAction) return;
    try {
      await applicationService.updateDepartmentStatus(
        activeAction.appId,
        activeAction.deptId,
        activeAction.action,
        actionRemarks || `Processed via Official Queue as ${activeAction.action}`
      );
      setActiveAction(null);
      setActionRemarks('');
      await fetchData();
    } catch (e) {
      alert(e.response?.data?.detail || 'Action failed');
    }
  };

  // Flatten pending department tasks
  const pendingTasks = [];
  applications.forEach((app) => {
    app.department_statuses?.forEach((ds) => {
      if (['SUBMITTED', 'IN_REVIEW', 'PENDING'].includes(ds.status)) {
        if (selectedDeptFilter === 'ALL' || ds.department?.code === selectedDeptFilter) {
          pendingTasks.push({
            app,
            ds,
          });
        }
      }
    });
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-govblue-700 uppercase tracking-wider bg-govblue-50 px-2.5 py-1 rounded-md border border-govblue-200">
            Official Verification Console
          </span>
          <h1 className="text-xl font-black text-slate-900 mt-2">
            Inter-Departmental Verification Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Department officers inspect transformed applications and issue statutory clearances
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            {['ALL', 'MUNICIPALITY', 'FSSAI', 'FIRE' , 'GST' , 'SHOPS'].map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDeptFilter(dept)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  selectedDeptFilter === dept
                    ? 'bg-govblue-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Action Modal */}
      {activeAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Confirm {activeAction.action}
            </h3>
            <p className="text-xs text-slate-500">
              Submit department inspection decision to GovConnect workflow engine.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Remarks / Inspection Notes
              </label>
              <textarea
                rows={3}
                value={actionRemarks}
                onChange={(e) => setActionRemarks(e.target.value)}
                placeholder="e.g. Health sanitation criteria verified. NOC recommended."
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-govblue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveAction(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAction}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow transition ${
                  activeAction.action === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {activeAction.action}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-base text-slate-900">
            Pending Tasks ({pendingTasks.length})
          </h2>
          <span className="text-xs text-slate-400">Real-time gateway synchronization</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-govblue-600" />
            <p className="text-xs">Fetching department queue...</p>
          </div>
        ) : pendingTasks.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">All tasks completed</p>
            <p className="text-xs">No pending items for the selected department filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold">Application</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold">External Ref</th>
                  <th className="py-3 px-4 font-semibold">Submitted At</th>
                  <th className="py-3 px-4 font-semibold">Stage Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Officer Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingTasks.map(({ app, ds }) => (
                  <tr key={`${app.id}-${ds.id}`} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => onSelectApplication(app.id)}
                        className="font-mono font-bold text-govblue-700 hover:underline"
                      >
                        {app.application_number}
                      </button>
                      <span className="text-[10px] text-slate-500 block">
                        {app.business_name} ({app.owner_name})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {ds.department?.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 font-semibold">
                      {ds.external_reference || 'Assigned'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {ds.submitted_at ? new Date(ds.submitted_at).toLocaleTimeString() : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={ds.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            setActiveAction({
                              appId: app.id,
                              deptId: ds.department_id,
                              action: 'APPROVED',
                            })
                          }
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() =>
                            setActiveAction({
                              appId: app.id,
                              deptId: ds.department_id,
                              action: 'REJECTED',
                            })
                          }
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition flex items-center gap-1 shadow-sm"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
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
