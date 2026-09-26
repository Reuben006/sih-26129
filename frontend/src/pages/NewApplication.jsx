import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, Building2, Send, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { applicationService } from '../services/applicationService';

export default function NewApplication({
  onCancel,
  onSuccess,
  currentUser
}) {
  console.log("currentUser =", currentUser);
  const [formData, setFormData] = useState({
    business_name: '',
    owner_name: '',
    address: '',
    pan: '',
    mobile: '',
    seating_capacity: 50,
    building_area_sqft: 1200,
    food_category: 'Multi-Cuisine Non-Veg & Veg',
    grant_consent: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const [documents, setDocuments] = useState([]);

  const [selectedDocs, setSelectedDocs] = useState({
    pan_document: '',
    aadhaar_document: '',
    license_document: ''
  });

  // Auto-fill demo values requested in SIH prompt
  const handlePrefillDemo = () => {
    setFormData({
      business_name: 'ABC Restaurant',
      owner_name: 'Swayam Dudhela',
      address: 'Shop 12, High Street, Bandra West, Mumbai 400050',
      pan: 'ABCDE1234F',
      mobile: '9876543210',
      seating_capacity: 65,
      building_area_sqft: 1450,
      food_category: 'Multi-Cuisine Food & Beverages',
      grant_consent: true,
    });
    setValidationErrors({});
    setError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.business_name.trim()) errs.business_name = 'Establishment name is required';
    if (!formData.owner_name.trim()) errs.owner_name = 'Owner name is required';
    if (!formData.address.trim()) errs.address = 'Premises address is required';

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(formData.pan.trim().toUpperCase())) {
      errs.pan = 'Invalid PAN format. Must be 5 uppercase letters, 4 digits, 1 letter (e.g. ABCDE1234F)';
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.mobile.trim())) {
      errs.mobile = 'Invalid Indian mobile number. Must be 10 digits starting with 6-9';
    }

    if (!formData.grant_consent) {
      errs.consent = 'Statutory consent is required for federated data exchange across departments';
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  useEffect(() => {
    if (currentUser?.id) {
        loadDocuments();
      }
    }, [currentUser]);

  const loadDocuments = async () => {
    try {
       console.log(currentUser);
      const token = localStorage.getItem("govconnect_token");

      const res = await axios.get(
         `http://localhost:8000/api/v1/documents/${currentUser.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          } 
        }
      );

      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const created = await applicationService.createApplication({
        ...formData,
        pan: formData.pan.trim().toUpperCase(),

        selected_documents: [
          Number(selectedDocs.pan_document)
        ]
      });
      onSuccess(created.id);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === 'object'
          ? detail.message || JSON.stringify(detail)
          : detail || 'Failed to submit application. Please verify details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <h1 className="text-xl font-black text-slate-900">
            New Restaurant Establishment Clearance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Single Window Common Information Form • Automated federated dispatch
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrefillDemo}
          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-govsaffron-500 text-slate-950 hover:bg-govsaffron-600 shadow-sm transition flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4" />
          <span>Pre-fill SIH Demo Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-bold">Submission Blocked</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-govblue-600" />
            <span>Common Establishment & Applicant KYC</span>
          </h2>

          <div className="mb-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">
              Attached Documents
            </h3>

            <div>
              <label className="block text-xs font-semibold mb-1">
                PAN Document
              </label>

              <select
                value={selectedDocs.pan_document}
                onChange={(e) =>
                  setSelectedDocs({
                    ...selectedDocs,
                    pan_document: e.target.value
                  })
                }
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              >
                <option value="">Select PAN</option>

                {documents
                  .filter((d) => d.document_type.toLowerCase() === "pan")
                  .map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.file_name}
                    </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Establishment / Firm Name *
              </label>
              <input
                type="text"
                required
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                placeholder="e.g. ABC Restaurant"
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-govblue-500 ${
                  validationErrors.business_name ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
              {validationErrors.business_name && (
                <p className="text-[11px] text-rose-600 mt-1">{validationErrors.business_name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Proprietor / Applicant Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.owner_name}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                placeholder="e.g. Swayam Dudhela"
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-govblue-500 ${
                  validationErrors.owner_name ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
              {validationErrors.owner_name && (
                <p className="text-[11px] text-rose-600 mt-1">{validationErrors.owner_name}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Physical Premise Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Shop 12, High Street, Mumbai"
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-govblue-500 ${
                  validationErrors.address ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
              {validationErrors.address && (
                <p className="text-[11px] text-rose-600 mt-1">{validationErrors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Permanent Account Number (PAN) *
              </label>
              <input
                type="text"
                required
                maxLength={10}
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                placeholder="e.g. ABCDE1234F"
                className={`w-full px-3 py-2 text-xs font-mono bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-govblue-500 ${
                  validationErrors.pan ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
              {validationErrors.pan && (
                <p className="text-[11px] text-rose-600 mt-1">{validationErrors.pan}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Contact Mobile Number *
              </label>
              <input
                type="text"
                required
                maxLength={10}
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="e.g. 9876543210"
                className={`w-full px-3 py-2 text-xs font-mono bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-govblue-500 ${
                  validationErrors.mobile ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
              {validationErrors.mobile && (
                <p className="text-[11px] text-rose-600 mt-1">{validationErrors.mobile}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Carpet Area (Sq. Ft.) - For Fire & Trade Specs
              </label>
              <input
                type="number"
                min={100}
                max={50000}
                value={formData.building_area_sqft}
                onChange={(e) => setFormData({ ...formData, building_area_sqft: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-govblue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Seating Capacity - For FSSAI License Grading
              </label>
              <input
                type="number"
                min={10}
                max={1000}
                value={formData.seating_capacity}
                onChange={(e) => setFormData({ ...formData, seating_capacity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-govblue-500"
              />
            </div>
          </div>
        </div>

        {/* DPDP Consent Box */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="consent-check"
              checked={formData.grant_consent}
              onChange={(e) => setFormData({ ...formData, grant_consent: e.target.checked })}
              className="mt-1 w-4 h-4 rounded text-govblue-600 focus:ring-govblue-500 border-slate-300"
            />
            <label htmlFor="consent-check" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
              <span className="font-bold text-slate-900 block mb-0.5">
                DPDP Act 2023 Consent for Inter-Departmental Federation
              </span>
              I hereby grant explicit statutory consent to the GovConnect Interoperability Middleware layer to transform and share my PAN, contact information, premises address, and architectural specifications with the Municipal Corporation, FSSAI FoSCoS portal, and Directorate of Fire Services solely for single-window restaurant licensing.
            </label>
          </div>
          {validationErrors.consent && (
            <p className="text-[11px] text-rose-600 font-medium pl-7">{validationErrors.consent}</p>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-govblue-900 hover:bg-govblue-800 shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Orchestrating Interoperability...' : 'Submit & Initiate Clearance'}
            <Send className="w-3.5 h-3.5 text-govsaffron-500" />
          </button>
        </div>
      </form>
    </div>
  );
}
