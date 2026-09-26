import React from 'react';
import {
  LayoutDashboard,
  FilePlus2,
  FileText,
  ShieldCheck,
  History,
  Activity,
  Layers
} from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, currentUser }) {
  const role = currentUser?.role || 'CITIZEN';

  const navItems = [
    {
      id: 'dashboard',
      label:
        role === 'CITIZEN'
          ? 'My Applications'
          : role === 'OFFICIAL'
          ? 'Verification Queue'
          : 'Admin Operations',
      icon: LayoutDashboard,
      roles: ['CITIZEN', 'OFFICIAL', 'ADMIN']
    },
    {
      id: 'new_application',
      label: 'New Single Window Application',
      icon: FilePlus2,
      roles: ['CITIZEN']
    },
    {
      id: 'documents',
      label: 'My Documents',
      icon: FileText,
      roles: ['CITIZEN']
    },
    {
      id: 'architecture',
      label: 'Interoperability Architecture',
      icon: Layers,
      roles: ['CITIZEN', 'OFFICIAL', 'ADMIN']
    },
    {
      id: 'audit_logs',
      label: 'System Audit Trail',
      icon: History,
      roles: ['OFFICIAL', 'ADMIN']
    },
    {
      id: 'health_monitor',
      label: 'Gateways & Fault Simulation',
      icon: Activity,
      roles: ['OFFICIAL', 'ADMIN']
    }
  ];

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 shadow-sm">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </div>

        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-govblue-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive
                    ? 'text-govsaffron-500'
                    : 'text-slate-500'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
          <ShieldCheck className="w-4 h-4 text-govgreen-600" />
          <span>Interoperability Guarantee</span>
        </div>

        <p className="text-[11px] text-slate-500 leading-normal">
          Connected to simulated independent gateways without
          database unification or legacy system replacement.
        </p>
      </div>
    </aside>
  );
}