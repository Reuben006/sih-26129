import React, { useState } from 'react';
import { Layers, Shield, Database, ArrowRight, ArrowDown, Server, Cpu, CheckCircle2, Lock, GitBranch } from 'lucide-react';

export default function ArchitectureView() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-govsaffron-600 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
            SIH Problem Statement 129 Technical Architecture
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">
            Federated Interoperability Middleware Layer
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            A modular federated service bus connecting siloed government systems without database merging, vendor lock-in, or replacing existing infrastructure.
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'overview' ? 'bg-govblue-900 text-white shadow-sm' : 'text-slate-600'
            }`}
          >
            System Diagram
          </button>
          <button
            onClick={() => setActiveTab('capabilities')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'capabilities' ? 'bg-govblue-900 text-white shadow-sm' : 'text-slate-600'
            }`}
          >
            PS 129 Capabilities Matrix
          </button>
        </div>
      </div>

      {/* DIAGRAM VIEW */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-8">
          {/* Layer 1: Citizen / Business Consumer */}
          <div className="text-center">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Layer 1: Unified Access Channel
            </span>
            <div className="mt-2 inline-flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-md border border-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-left">
                <p className="text-xs font-bold">Single Window Citizen Portal / Mobile App</p>
                <p className="text-[10px] text-slate-400">Submits Common Canonical Data ONCE with DPDP Consent</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-6 h-6 text-govblue-500 animate-bounce" />
          </div>

          {/* Layer 2: GovConnect Interoperability Middleware Core */}
          <div className="p-6 rounded-3xl bg-govblue-950 text-white shadow-xl border border-blue-800 relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl" />
            <div className="flex items-center justify-between border-b border-blue-800/80 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-govsaffron-500 flex items-center justify-center text-slate-950 font-bold text-sm">
                  GC
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    GovConnect Interoperability Middleware Core
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    FastAPI • Modular Monolith • Pydantic Canonical Engine • SQLAlchemy
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-govsaffron-500 border border-govsaffron-500/40 px-2 py-0.5 rounded">
                REST / JSON / SOAP / Asynchronous
              </span>
            </div>

            {/* Internal Micro-modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-govblue-900/80 border border-blue-700/60 space-y-2">
                <div className="flex items-center gap-2 text-govsaffron-500 text-xs font-bold">
                  <Database className="w-4 h-4" />
                  <span>Canonical Data Engine</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Validates PAN, phone, address, and creates standardized application entity.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-govblue-900/80 border border-blue-700/60 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <GitBranch className="w-4 h-4" />
                  <span>Workflow State Machine</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Configurable step orchestration: Municipality → FSSAI → Fire Services.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-govblue-900/80 border border-blue-700/60 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                  <Lock className="w-4 h-4" />
                  <span>Consent & DPDP Ledger</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Verifies statutory citizen consent before inter-departmental data routing.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-govblue-900/80 border border-blue-700/60 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                  <Shield className="w-4 h-4" />
                  <span>Immutable Audit Bus</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Captures cryptographic transaction logs and schema transformation traces.
                </p>
              </div>
            </div>

            {/* Connectors Layer */}
            <div className="mt-6 pt-6 border-t border-blue-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Proprietary Adapters & Transformation Connectors
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-900/90 rounded-lg border border-blue-600/40 text-xs font-mono text-center">
                  <span className="text-emerald-400 font-bold">MunicipalityConnector</span>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Transforms to enterpriseName, proprietor
                  </p>
                </div>
                <div className="p-3 bg-slate-900/90 rounded-lg border border-blue-600/40 text-xs font-mono text-center">
                  <span className="text-blue-400 font-bold">FSSAIConnector</span>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Transforms to firm_name, applicant
                  </p>
                </div>
                <div className="p-3 bg-slate-900/90 rounded-lg border border-blue-600/40 text-xs font-mono text-center">
                  <span className="text-rose-400 font-bold">FireConnector</span>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Transforms to establishment, owner
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-6 h-6 text-govblue-500 animate-bounce" />
          </div>

          {/* Layer 3: Simulated Heterogeneous Legacy Systems */}
          <div>
            <div className="text-center mb-4">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Layer 3: Existing Independent Department Portals & Legacy Registries (Untouched)
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-300 text-center space-y-1.5 shadow-sm">
                <Server className="w-6 h-6 text-slate-700 mx-auto" />
                <h4 className="font-bold text-xs text-slate-900">Municipal Trade License Portal</h4>
                <p className="text-[10px] text-slate-500 font-mono">/mock/municipality/applications</p>
                <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px]">
                  Legacy SOAP / REST System
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-300 text-center space-y-1.5 shadow-sm">
                <Server className="w-6 h-6 text-slate-700 mx-auto" />
                <h4 className="font-bold text-xs text-slate-900">FSSAI FoSCoS Registry</h4>
                <p className="text-[10px] text-slate-500 font-mono">/mock/fssai/licenses</p>
                <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px]">
                  Central Food Safety Portal
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-300 text-center space-y-1.5 shadow-sm">
                <Server className="w-6 h-6 text-slate-700 mx-auto" />
                <h4 className="font-bold text-xs text-slate-900">Fire Safety NOC Portal</h4>
                <p className="text-[10px] text-slate-500 font-mono">/mock/fire/noc-requests</p>
                <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px]">
                  State Emergency Services API
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CAPABILITIES MATRIX */}
      {activeTab === 'capabilities' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 mb-2">
            PS 129 Required Capabilities Compliance Matrix
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: '1. API-Based Data Exchange', desc: 'FastAPI REST gateway with standard JSON payloads, HTTP headers, and status contracts.' },
              { title: '2. Common Data Standards', desc: 'Pydantic Canonical Establishment Model defining normalized fields (business_name, owner_name, pan, mobile).' },
              { title: '3. Data Mapping / Transformation', desc: 'DepartmentConnector transforms canonical schema to legacy schemas (e.g. enterpriseName, firm_name, establishment).' },
              { title: '4. Master-Data Handling', desc: 'Centralized lookup for departments, workflows, and application tracking IDs (APP-1001).' },
              { title: '5. Consent-Based Data Sharing', desc: 'Explicit DPDP Act compliant consent mechanism with grant, revoke, and audit records.' },
              { title: '6. Role-Based Access Control', desc: 'JWT security with distinct permissions for CITIZEN, OFFICIAL, and ADMIN personas.' },
              { title: '7. Configurable Workflow Engine', desc: 'Database-driven workflow definitions and sequential state transitions without hardcoding.' },
              { title: '8. Unified Application Tracking', desc: 'Single reference number (APP-1001) mapping to MUNI-XXXX, FSSAI-XXXX, and FIRE-XXXX.' },
              { title: '9. Event-Driven Notifications', desc: 'Instant user notifications on dispatch, stage approval, rejection, or system error.' },
              { title: '10. Legacy & Modern Connectors', desc: 'Abstract connector interface extensible for SOAP, gRPC, and REST government portals.' },
              { title: '11. Comprehensive Audit Logs', desc: 'Cryptographic event trail recording payload transformations, timestamps, and officer remarks.' },
              { title: '12. Data-Quality Validation', desc: 'Regex validation for PAN (ABCDE1234F), Indian mobile (10 digits), and duplicate prevention.' },
              { title: '13. Exception & Fault Handling', desc: 'Graceful degradation on external gateway timeouts with standardized error codes and simulation toggles.' },
              { title: '14. Monitoring & Telemetry', desc: 'Administrative dashboard tracking KPIs, average processing SLAs, and connector health.' },
            ].map((cap, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{cap.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{cap.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
