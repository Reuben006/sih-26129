import React from 'react';
import { UserRound, Building2, ShieldCheck, Landmark, ReceiptText, Store, Flame, ArrowRight } from 'lucide-react';

const PORTALS = [
  {
    code: 'CITIZEN',
    title: 'Citizen Portal',
    subtitle: 'Submit and track establishment applications',
    icon: UserRound,
  },
  {
    code: 'MUNICIPALITY',
    title: 'Municipality Portal',
    subtitle: 'Trade & Health License verification',
    icon: Building2,
  },
  {
    code: 'FSSAI',
    title: 'FSSAI Portal',
    subtitle: 'Food safety clearance',
    icon: ShieldCheck,
  },
  {
    code: 'FIRE',
    title: 'Fire Services Portal',
    subtitle: 'Fire & emergency clearance',
    icon: Flame,
  },
  {
    code: 'GST',
    title: 'GST & Tax Portal',
    subtitle: 'Tax registration verification',
    icon: ReceiptText,
  },
  {
    code: 'SHOPS',
    title: 'Shops & Establishments Portal',
    subtitle: 'Establishment and labour compliance',
    icon: Store,
  },
  {
    code: 'ADMIN',
    title: 'Administrator Portal',
    subtitle: 'GovConnect system administration',
    icon: Landmark,
  },
];

export default function PortalSelection({ onSelect }) {
  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col font-sans">
      <div className="bg-[#081d39] text-white text-[11px] py-1.5 px-4 sm:px-8 border-b border-blue-950">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="font-semibold text-govsaffron-500">
            महाराष्ट्र शासन | Government of Maharashtra
          </span>
          <span className="hidden sm:inline text-slate-400">
            माहिती तंत्रज्ञान संचालनालय (Directorate of Information Technology)
          </span>
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-5xl w-full">
          <div className="text-center mb-8">
            <img
              src="/maharashtra-emblem.png"
              alt="Government of Maharashtra"
              className="w-16 h-16 mx-auto object-contain mb-3"
            />
            <h1 className="text-2xl font-black text-slate-900">Maha-ICSG Portal Gateway</h1>
            <p className="text-sm text-slate-500 mt-1">
              Select the portal you want to sign in to.
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Every department has an independent authenticated portal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PORTALS.map(({ code, title, subtitle, icon: Icon }) => (
              <button
                key={code}
                type="button"
                onClick={() => onSelect(code)}
                className="group text-left bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-govblue-400 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-govblue-50 text-govblue-800 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-govblue-700 transition" />
                </div>
                <h2 className="font-bold text-sm text-slate-900 mt-4">{title}</h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{subtitle}</p>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
