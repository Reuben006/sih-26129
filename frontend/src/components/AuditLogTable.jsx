import React, { useState } from 'react';
import { History, Search, ChevronDown, ChevronRight, ShieldCheck } from 'lucide-react';

export default function AuditLogTable({ auditLogs }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filteredLogs = (auditLogs || []).filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      log.entity.toLowerCase().includes(term) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(term))
    );
  });

  const getActionBadgeColor = (action) => {
    if (action.includes('APPROVED')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (action.includes('REJECTED')) return 'bg-rose-100 text-rose-800 border-rose-300';
    if (action.includes('ERROR')) return 'bg-red-100 text-red-800 border-red-300';
    if (action.includes('TRANSFORMED')) return 'bg-purple-100 text-purple-800 border-purple-300';
    if (action.includes('DISPATCHED')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (action.includes('CONSENT')) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-govblue-600" />
            <h3 className="font-bold text-base text-slate-900">Immutable Compliance Audit Trail</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Every transaction, transformation, and external dispatch is cryptographically signed and logged
          </p>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, entity, details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-govblue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <th className="py-3 px-4 font-semibold">Timestamp</th>
              <th className="py-3 px-4 font-semibold">Action</th>
              <th className="py-3 px-4 font-semibold">Entity</th>
              <th className="py-3 px-4 font-semibold">Details Summary</th>
              <th className="py-3 px-4 font-semibold text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No audit logs recorded for this view
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const isExpanded = expandedId === log.id;
                return (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 text-slate-500 font-mono whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold border ${getActionBadgeColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {log.entity}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {log.details ? (
                          <span>
                            {log.details.department ? `Dept: ${log.details.department} ` : ''}
                            {log.details.message || log.details.status || log.details.target_schema || 'Event payload logged'}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : log.id)}
                          className="text-slate-400 hover:text-govblue-600 p-1"
                          title="Inspect raw audit payload"
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Raw Detail Row */}
                    {isExpanded && (
                      <tr className="bg-slate-900 text-slate-200">
                        <td colSpan={5} className="p-4 font-mono text-[11px]">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                            <span className="text-govsaffron-500 font-semibold">Audit Record ID: #{log.id}</span>
                            <span className="text-slate-400">Recorded IP: {log.ip_address || '127.0.0.1'}</span>
                          </div>
                          <pre className="overflow-x-auto text-emerald-400">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
