import React, { useState } from 'react';
import { Code2, ArrowRight, Check, Copy, Sparkles, Database } from 'lucide-react';

export default function TransformationViewer({ canonicalData, departmentStatuses }) {
  const [selectedDeptCode, setSelectedDeptCode] = useState('MUNICIPALITY');
  const [copied, setCopied] = useState(false);

  const selectedDept = departmentStatuses?.find(
    (d) => d.department?.code === selectedDeptCode
  );

  const handleCopy = (text) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaInfo = {
    MUNICIPALITY: {
      title: 'Municipal Corporation Gateway Schema',
      spec: 'Legacy Urban Local Body (ULB) Trade & Health Format',
      mapping: [
        { from: 'business_name', to: 'enterpriseName', note: 'Mapped to enterprise legal entity' },
        { from: 'owner_name', to: 'proprietor', note: 'Mapped to individual applicant' },
        { from: 'address', to: 'businessAddress', note: 'Standardized municipal ward address' },
        { from: 'pan', to: 'taxIdentifier', note: 'Mapped to municipal commercial tax identity' },
        { from: 'mobile', to: 'contactNumber', note: 'Applicant primary mobile' },
      ]
    },
    FSSAI: {
      title: 'FSSAI FoSCoS API v2.4 Schema',
      spec: 'Central Food Safety Regulatory Compliance Format',
      mapping: [
        { from: 'business_name', to: 'firm_name', note: 'Mapped to food establishment firm name' },
        { from: 'owner_name', to: 'applicant', note: 'Designated Food Business Operator (FBO)' },
        { from: 'address', to: 'premise_address', note: 'Geocoded manufacturing/kitchen premises' },
        { from: 'pan', to: 'pan_number', note: 'Tax registration identity' },
        { from: 'seating_capacity', to: 'seating_capacity', note: 'Used to classify State vs Central License' },
      ]
    },
    FIRE: {
      title: 'Fire & Emergency Services NOC Schema',
      spec: 'Directorate of Fire Hazard Assessment & NOC Format',
      mapping: [
        { from: 'business_name', to: 'establishment', note: 'Commercial occupancy premise' },
        { from: 'owner_name', to: 'owner', note: 'Primary building/lease holder' },
        { from: 'address', to: 'location', note: 'Emergency dispatch coordinate address' },
        { from: 'mobile', to: 'owner_phone', note: 'Emergency primary contact' },
        { from: 'building_area_sqft', to: 'total_area_sqft', note: 'Evacuation radius calculation' },
      ]
    }
  };

  const currentInfo = schemaInfo[selectedDeptCode] || schemaInfo.MUNICIPALITY;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-govsaffron-500" />
            <h3 className="font-bold text-base">Interoperability Data Transformation Engine</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Demonstrating zero-replacement schema translation from Common Model to Heterogeneous Portals
          </p>
        </div>

        {/* Department Switcher Tabs */}
        <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
          {['MUNICIPALITY', 'FSSAI', 'FIRE'].map((code) => (
            <button
              key={code}
              onClick={() => setSelectedDeptCode(code)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                selectedDeptCode === code
                  ? 'bg-govsaffron-500 text-slate-900 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Dual Column Transformation Inspector */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Pane: Common Canonical Model */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-govblue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Common Canonical Model (Submitted Once)
                </h4>
              </div>
              <button
                onClick={() => handleCopy(canonicalData)}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 text-slate-200 font-mono text-xs overflow-x-auto shadow-inner border border-slate-800">
              <pre>{JSON.stringify(canonicalData || {}, null, 2)}</pre>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 text-xs text-blue-900">
              <p className="font-semibold mb-1">Standardized Core Entity</p>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Contains unified business identifiers, owner KYC, and structural specifications submitted by citizen.
              </p>
            </div>
          </div>

          {/* Right Pane: Transformed Department Payload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-govgreen-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {currentInfo.title}
                </h4>
              </div>
              {selectedDept?.request_payload && (
                <button
                  onClick={() => handleCopy(selectedDept.request_payload)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              )}
            </div>

            <div className="bg-slate-900 rounded-xl p-4 text-emerald-400 font-mono text-xs overflow-x-auto shadow-inner border border-slate-800">
              <pre>
                {JSON.stringify(
                  selectedDept?.request_payload || {
                    message: "Awaiting stage activation in workflow sequence",
                    status: selectedDept?.status || "PENDING"
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 text-xs text-emerald-900">
              <p className="font-semibold mb-1">{currentInfo.spec}</p>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Field mappings automatically executed by <span className="font-mono font-bold">{selectedDeptCode}Connector</span> without altering the external departmental database.
              </p>
            </div>
          </div>
        </div>

        {/* Schema Mapping Table */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Field Mapping Dictionary ({selectedDeptCode})
          </h5>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-y border-slate-200">
                  <th className="py-2.5 px-3 font-semibold">Canonical Field</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Transform</th>
                  <th className="py-2.5 px-3 font-semibold">Department Field ({selectedDeptCode})</th>
                  <th className="py-2.5 px-3 font-semibold">Transformation Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {currentInfo.mapping.map((m, i) => (
                  <tr key={i} className="hover:bg-slate-50/60">
                    <td className="py-2 px-3 font-mono font-medium text-govblue-600">{m.from}</td>
                    <td className="py-2 px-3 text-center text-slate-400">
                      <ArrowRight className="w-3.5 h-3.5 mx-auto" />
                    </td>
                    <td className="py-2 px-3 font-mono font-semibold text-emerald-700">{m.to}</td>
                    <td className="py-2 px-3 text-slate-500">{m.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
