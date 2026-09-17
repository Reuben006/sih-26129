import React, { useState } from 'react';
import { 
  Shield, FileText, CheckCircle2, Clock, AlertTriangle, 
  Upload, ArrowRight, Bell, User, LogOut, Search, 
  ExternalLink, ChevronRight, Building2, Flame, UtensilsCrossed 
} from 'lucide-react';

export default function App() {
  // Navigation & session state
  const [currentView, setCurrentView] = useState('login'); // 'login' | 'dashboard' | 'apply' | 'track'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState('MH-2026-8942');
  
  // Auth Mode State (Fixes the white screen crash)
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  // Multi-step Application Form State
  const [formStep, setFormStep] = useState(1);
  const [useDigiLocker, setUseDigiLocker] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: 'Unified Business & Food Safety License',
    fullName: '',
    aadhaarPan: '',
    businessName: '',
    address: '',
    phone: '',
    departmentsRequired: ['BMC', 'Fire', 'FDA'],
    documentsUploaded: { idProof: false, premisesProof: false, fireSafetyPlan: false }
  });

  // Mock citizen applications showing cross-departmental progress
  const [applications, setApplications] = useState([
    {
      id: 'MH-2026-8942',
      service: 'Composite Commercial Enterprise Permit',
      appliedOn: '12 Sep 2026',
      overallStatus: 'In Review',
      slaDaysRemaining: 4,
      departments: [
        { name: 'Brihanmumbai Municipal Corp (BMC)', code: 'BMC', status: 'Completed', date: '14 Sep 2026' },
        { name: 'Maharashtra Fire Services', code: 'FIRE', status: 'In Review', date: 'Pending Site Audit' },
        { name: 'Food & Drug Admin (FDA)', code: 'FDA', status: 'Pending', date: 'Awaiting Fire Clearance' }
      ]
    },
    {
      id: 'MH-2026-7719',
      service: 'Trade & Water Discharge Endorsement',
      appliedOn: '28 Aug 2026',
      overallStatus: 'Approved',
      slaDaysRemaining: 0,
      departments: [
        { name: 'Brihanmumbai Municipal Corp (BMC)', code: 'BMC', status: 'Completed', date: '30 Aug 2026' },
        { name: 'Maharashtra Pollution Control Board', code: 'MPCB', status: 'Completed', date: '02 Sep 2026' }
      ]
    }
  ]);

  // Handle DigiLocker Auto-fill (eliminating duplicate data submission)
  const handleDigiLockerSync = () => {
    setUseDigiLocker(true);
    setFormData(prev => ({
      ...prev,
      fullName: 'Vikramaditya Sharma',
      aadhaarPan: 'XXXX-XXXX-4821 / ABCPS1234D',
      phone: '+91 98765 43210',
      address: 'Plot 42, Bandra Kurla Complex, Mumbai, Maharashtra - 400051'
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newApp = {
      id: `MH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      service: formData.serviceType,
      appliedOn: new Date().toLocaleDateString('en-GB'),
      overallStatus: 'In Review',
      slaDaysRemaining: 7,
      departments: [
        { name: 'Brihanmumbai Municipal Corp (BMC)', code: 'BMC', status: 'In Review', date: 'Initiated' },
        { name: 'Maharashtra Fire Services', code: 'FIRE', status: 'Queued', date: 'Pending Routing' },
        { name: 'Food & Drug Admin (FDA)', code: 'FDA', status: 'Queued', date: 'Pending Routing' }
      ]
    };
    setApplications([newApp, ...applications]);
    setSelectedAppId(newApp.id);
    setCurrentView('track');
    setFormStep(1);
  };

  const activeApp = applications.find(a => a.id === selectedAppId) || applications[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* 1. Maharashtra Gov Top Utility & Accessibility Bar */}
      <div className="bg-[#1a202c] text-slate-300 text-xs py-1 px-4 sm:px-8 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-amber-500">महाराष्ट्र शासन</span>
          <span>|</span>
          <span>Government of Maharashtra</span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="hover:text-white transition">English</button>
          <span>|</span>
          <button className="hover:text-white transition font-medium">मराठी</button>
          <span>|</span>
          <div className="flex items-center space-x-1 border border-slate-600 px-1 rounded">
            <button className="px-1 text-[11px] hover:text-white">A-</button>
            <button className="px-1 text-[11px] font-bold hover:text-white">A</button>
            <button className="px-1 text-[11px] hover:text-white">A+</button>
          </div>
          <a 
            href="#officer-portal-route" 
            onClick={() => alert("Officer Portal route will be linked here by your teammate.")}
            className="flex items-center text-amber-400 hover:text-amber-300 font-medium pl-2"
          >
            Officer Portal <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>

      {/* Tricolor Ribbon */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      {/* 2. Official Portal Header */}
      <header className="bg-white border-b border-slate-200 py-3 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-14 bg-slate-100 border border-slate-300 rounded flex flex-col items-center justify-center p-1 text-center shadow-inner">
              <span className="text-[10px] font-bold text-slate-700 leading-tight">सत्यमेव जयते</span>
              <div className="w-6 h-6 border-2 border-[#000080] rounded-full flex items-center justify-center mt-1">
                <div className="w-2 h-2 bg-[#000080] rounded-full"></div>
              </div>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-[#0B3C5D] leading-tight">
                महाराष्ट्र एकात्मिक सेवा पोर्टल
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-600 tracking-wide">
                Maharashtra Interoperable Citizen Service Gateway (Maha-ICSG)
              </p>
              <p className="text-[11px] text-slate-400">Department of Information Technology, Govt of Maharashtra</p>
            </div>
          </div>

          {isLoggedIn && (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-full relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-50">
                    <p className="text-xs font-bold text-slate-700 uppercase border-b pb-1">Notifications</p>
                    <div className="divide-y divide-slate-100 text-xs">
                      <div className="py-2">
                        <p className="font-semibold text-slate-800">Fire NOC Verification Scheduled</p>
                        <p className="text-slate-500">Inspection slated for 20 Sep 2026 for App #8942</p>
                      </div>
                      <div className="py-2">
                        <p className="font-semibold text-slate-800">BMC Clearance Granted</p>
                        <p className="text-slate-500">Data automatically synced with FDA repository.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden sm:flex items-center space-x-2 pl-3 border-l border-slate-200">
                <div className="w-8 h-8 bg-[#0B3C5D] text-white rounded-full flex items-center justify-center font-bold text-xs">
                  VS
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800">Vikramaditya S.</p>
                  <p className="text-[10px] text-slate-500">Verified Citizen</p>
                </div>
              </div>

              <button 
                onClick={() => { setIsLoggedIn(false); setCurrentView('login'); }}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 3. Navigation Ribbon */}
      {isLoggedIn && (
        <nav className="bg-[#0B3C5D] text-white px-4 sm:px-8 text-sm">
          <div className="max-w-7xl mx-auto flex space-x-1">
            <button 
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-2.5 font-medium transition ${currentView === 'dashboard' ? 'bg-[#002244] border-b-2 border-amber-400' : 'hover:bg-blue-900/50'}`}
            >
              Citizen Dashboard
            </button>
            <button 
              onClick={() => { setCurrentView('apply'); setFormStep(1); }}
              className={`px-4 py-2.5 font-medium transition ${currentView === 'apply' ? 'bg-[#002244] border-b-2 border-amber-400' : 'hover:bg-blue-900/50'}`}
            >
              Apply for New Service
            </button>
            <button 
              onClick={() => setCurrentView('track')}
              className={`px-4 py-2.5 font-medium transition ${currentView === 'track' ? 'bg-[#002244] border-b-2 border-amber-400' : 'hover:bg-blue-900/50'}`}
            >
              Unified Application Tracker
            </button>
          </div>
        </nav>
      )}

      {/* 4. Main Body Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">

        {/* VIEW A: CITIZEN LOGIN / REGISTRATION */}
        {!isLoggedIn && currentView === 'login' && (
          <div className="max-w-md mx-auto my-12 bg-white border border-slate-200 rounded-lg shadow-md p-6">
            
            <div className="flex border-b border-slate-200 mb-6">
              <button 
                onClick={() => setAuthMode('login')}
                className={`flex-1 pb-2 text-sm font-bold text-center border-b-2 transition ${
                  authMode === 'login' ? 'border-[#0B3C5D] text-[#0B3C5D]' : 'border-transparent text-slate-400'
                }`}
              >
                Sign In (SSO)
              </button>
              <button 
                onClick={() => setAuthMode('register')}
                className={`flex-1 pb-2 text-sm font-bold text-center border-b-2 transition ${
                  authMode === 'register' ? 'border-[#0B3C5D] text-[#0B3C5D]' : 'border-transparent text-slate-400'
                }`}
              >
                New Citizen Registration
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-blue-50 text-[#0B3C5D] rounded-full mb-2">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">
                {authMode === 'login' ? 'Citizen Single Sign-On' : 'Create Federated ID'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {authMode === 'login' 
                  ? 'Access all Maharashtra Inter-Departmental Services' 
                  : 'Link your Aadhaar/DigiLocker to generate a unified ID'}
              </p>
            </div>

            <div className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name (As per Aadhaar)</label>
                  <input 
                    type="text" 
                    placeholder="Enter full name"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3C5D]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Mobile / Aadhaar Number</label>
                <input 
                  type="text" 
                  placeholder="Enter 12-digit Aadhaar or Mobile"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3C5D]"
                  defaultValue="9876543210"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">OTP Verification</label>
                <div className="flex space-x-2">
                  <input 
                    type="password" 
                    placeholder="Enter 6-digit OTP"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3C5D]"
                    defaultValue="123456"
                  />
                  <button type="button" className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 rounded font-semibold whitespace-nowrap">
                    Get OTP
                  </button>
                </div>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-2 text-[11px] text-amber-800">
                Data exchange between departments is conducted securely to provide unified application tracking and avoid repeated submissions.
              </div>

              <button 
                onClick={() => { setIsLoggedIn(true); setCurrentView('dashboard'); }}
                className="w-full bg-[#0B3C5D] hover:bg-[#082b43] text-white py-2.5 rounded font-semibold text-sm transition"
              >
                {authMode === 'login' ? 'Authenticate & Login' : 'Verify & Register Account'}
              </button>
              
              {authMode === 'login' && (
                <>
                  <div className="relative my-4 text-center">
                    <span className="bg-white px-2 text-xs text-slate-400">or login via federated providers</span>
                  </div>

                  <button 
                    onClick={() => { setIsLoggedIn(true); setCurrentView('dashboard'); }}
                    className="w-full border border-slate-300 hover:bg-slate-50 text-slate-700 py-2 rounded text-xs font-semibold flex items-center justify-center space-x-2"
                  >
                    <span className="text-blue-700 font-bold">MahaDigiLocker</span>
                    <span>SSO Integration</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* VIEW B: CITIZEN DASHBOARD */}
        {isLoggedIn && currentView === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Citizen Service Desk</h2>
                <p className="text-xs text-slate-500">Track and manage multi-agency submissions without visiting multiple offices.</p>
              </div>
              <button 
                onClick={() => { setCurrentView('apply'); setFormStep(1); }}
                className="mt-3 sm:mt-0 bg-[#0B3C5D] hover:bg-[#072a42] text-white px-4 py-2 rounded text-sm font-medium flex items-center self-start"
              >
                + New Inter-Department Application
              </button>
            </div>

            {/* Application Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-blue-600">
                <p className="text-xs text-slate-500 font-medium">Total Applications</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{applications.length}</p>
                <p className="text-[11px] text-slate-400 mt-1">Across State Departments</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
                <p className="text-xs text-slate-500 font-medium">Pending Approvals</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {applications.filter(a => a.overallStatus === 'In Review').length}
                </p>
                <p className="text-[11px] text-amber-700 mt-1">Within SLA timeline</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-emerald-600">
                <p className="text-xs text-slate-500 font-medium">Approved & Issued</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {applications.filter(a => a.overallStatus === 'Approved').length}
                </p>
                <p className="text-[11px] text-emerald-700 mt-1">Ready to download credentials</p>
              </div>
            </div>

            {/* Applications List */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm">Active Unified Submissions</h3>
                <span className="text-xs text-slate-500">Real-time sync enabled</span>
              </div>
              <div className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <div key={app.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-blue-900 text-sm">{app.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          app.overallStatus === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {app.overallStatus}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 mt-1">{app.service}</p>
                      <p className="text-xs text-slate-400">Submission Date: {app.appliedOn}</p>
                    </div>

                    <div className="mt-3 md:mt-0 flex items-center space-x-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-medium text-slate-600">Departments Involved:</p>
                        <p className="text-xs text-slate-400">
                          {app.departments.map(d => d.code).join(' • ')}
                        </p>
                      </div>
                      <button 
                        onClick={() => { setSelectedAppId(app.id); setCurrentView('track'); }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded text-xs font-semibold flex items-center"
                      >
                        Track Progress <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW C: MULTI-STEP UNIFIED APPLICATION FORM */}
        {isLoggedIn && currentView === 'apply' && (
          <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <div className="border-b border-slate-200 pb-4 mb-6">
              <h2 className="text-xl font-bold text-slate-800">New Interoperable Service Request</h2>
              <p className="text-xs text-slate-500">Single application automatically registered across BMC, Fire Services, and FDA.</p>
            </div>

            {/* Stepper Wizard */}
            <div className="flex justify-between items-center mb-8 px-4">
              <div className={`flex flex-col items-center ${formStep >= 1 ? 'text-[#0B3C5D]' : 'text-slate-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  formStep >= 1 ? 'bg-[#0B3C5D] text-white' : 'bg-slate-200'
                }`}>1</div>
                <span className="text-[11px] mt-1 font-semibold">Basic Details</span>
              </div>
              <div className="flex-1 h-0.5 bg-slate-200 mx-2"></div>
              <div className={`flex flex-col items-center ${formStep >= 2 ? 'text-[#0B3C5D]' : 'text-slate-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  formStep >= 2 ? 'bg-[#0B3C5D] text-white' : 'bg-slate-200'
                }`}>2</div>
                <span className="text-[11px] mt-1 font-semibold">Consent & Uploads</span>
              </div>
              <div className="flex-1 h-0.5 bg-slate-200 mx-2"></div>
              <div className={`flex flex-col items-center ${formStep === 3 ? 'text-[#0B3C5D]' : 'text-slate-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  formStep === 3 ? 'bg-[#0B3C5D] text-white' : 'bg-slate-200'
                }`}>3</div>
                <span className="text-[11px] mt-1 font-semibold">Review & Submit</span>
              </div>
            </div>

            <form onSubmit={handleFormSubmit}>
              {formStep === 1 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-blue-900">Avoid Repeated Submissions</p>
                      <p className="text-[11px] text-blue-700">Pre-fill verified information directly from repository.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={handleDigiLockerSync}
                      className="bg-blue-700 text-white text-xs px-3 py-1.5 rounded font-semibold hover:bg-blue-800"
                    >
                      {useDigiLocker ? '✓ Synced' : 'Auto-Fill Details'}
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Applicant Full Name *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      placeholder="As per Aadhaar Card"
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Aadhaar / PAN Identifier *</label>
                      <input 
                        type="text" 
                        required
                        value={formData.aadhaarPan}
                        onChange={(e) => setFormData({...formData, aadhaarPan: e.target.value})}
                        placeholder="Identities will be hashed"
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone *</label>
                      <input 
                        type="text" 
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+91"
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Business Premise Address *</label>
                    <textarea 
                      required
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Complete address with ward number and pin code"
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      type="button" 
                      onClick={() => setFormStep(2)}
                      className="bg-[#0B3C5D] text-white px-5 py-2 rounded text-sm font-semibold flex items-center"
                    >
                      Next Step <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}

              {formStep === 2 && (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded p-3 bg-slate-50">
                    <p className="text-xs font-bold text-slate-700 mb-1">Integrated Department Endorsements Required:</p>
                    <div className="flex space-x-2 text-xs">
                      <span className="bg-white border px-2 py-1 rounded font-semibold text-slate-700">✓ BMC Trade Permit</span>
                      <span className="bg-white border px-2 py-1 rounded font-semibold text-slate-700">✓ Fire Department NOC</span>
                      <span className="bg-white border px-2 py-1 rounded font-semibold text-slate-700">✓ FDA Food Safety</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                      <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                      <p className="text-xs font-semibold text-slate-700">Premises Ownership / Lease Deed</p>
                      <p className="text-[10px] text-slate-400">PDF, JPG up to 5MB (Shared with BMC & Fire)</p>
                      <button type="button" className="mt-2 text-xs bg-slate-200 px-3 py-1 rounded font-medium">Select File</button>
                    </div>

                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                      <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                      <p className="text-xs font-semibold text-slate-700">Architect-Approved Fire Evacuation Plan</p>
                      <p className="text-[10px] text-slate-400">Directly routed to Fire Services</p>
                      <button type="button" className="mt-2 text-xs bg-slate-200 px-3 py-1 rounded font-medium">Select File</button>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-xs flex items-start space-x-2">
                    <input type="checkbox" required id="consent" className="mt-0.5" />
                    <label htmlFor="consent" className="text-emerald-900 text-[11px] leading-tight">
                      <strong>Consent Declaration:</strong> I hereby grant consent to share my verified registry data across the BMC, State Fire Services, and FDA for unified appraisal through consent-based data sharing.
                    </label>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button 
                      type="button" 
                      onClick={() => setFormStep(1)}
                      className="border border-slate-300 text-slate-700 px-4 py-2 rounded text-sm font-semibold"
                    >
                      Back
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFormStep(3)}
                      className="bg-[#0B3C5D] text-white px-5 py-2 rounded text-sm font-semibold flex items-center"
                    >
                      Review Summary <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}

              {formStep === 3 && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded p-4 text-xs space-y-2">
                    <p><strong>Applicant:</strong> {formData.fullName || 'Vikramaditya Sharma'}</p>
                    <p><strong>Identifier:</strong> {formData.aadhaarPan || 'XXXX-XXXX-4821'}</p>
                    <p><strong>Address:</strong> {formData.address || 'Bandra Kurla Complex, Mumbai'}</p>
                    <p><strong>Federated Services:</strong> BMC Trade Permit, Fire NOC, FDA Registration</p>
                  </div>

                  <div className="p-3 bg-amber-50 text-amber-900 text-xs rounded border border-amber-200">
                    Once submitted, a single Master Application Number will be issued. Progress in all three departments will update automatically via event-driven notifications.
                  </div>

                  <div className="flex justify-between pt-4">
                    <button 
                      type="button" 
                      onClick={() => setFormStep(2)}
                      className="border border-slate-300 text-slate-700 px-4 py-2 rounded text-sm font-semibold"
                    >
                      Back
                    </button>
                    <button 
                      type="submit" 
                      className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2 rounded text-sm font-semibold"
                    >
                      Confirm & Submit Application
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

        {/* VIEW D: UNIFIED APPLICATION TRACKER */}
        {isLoggedIn && currentView === 'track' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400">APPLICATION TRACKING IDENTIFIER</span>
                  <div className="flex items-center space-x-3 mt-0.5">
                    <h2 className="text-xl font-bold text-[#0B3C5D]">{activeApp.id}</h2>
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-bold">
                      {activeApp.overallStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{activeApp.service}</p>
                </div>
                <div className="mt-4 md:mt-0 text-left md:text-right">
                  <p className="text-xs font-semibold text-slate-500">Target SLA Clearance</p>
                  <p className="text-sm font-bold text-slate-800">{activeApp.slaDaysRemaining} Business Days</p>
                  <p className="text-[10px] text-slate-400">Zero physical office visits needed</p>
                </div>
              </div>

              {/* Department-wise Interoperability Progress Pipeline */}
              <div className="mt-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
                  Inter-Departmental Workflow Orchestration Status
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Department 1: Municipal */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 relative overflow-hidden">
                    <div className="flex items-center space-x-2 text-[#0B3C5D] mb-2">
                      <Building2 className="w-5 h-5" />
                      <h4 className="font-bold text-sm">BMC Authority</h4>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">Zonal Trade & Land Verification</p>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-700">Cleared & Approved</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">NOC Ref: BMC/2026/MUM-901</p>
                  </div>

                  {/* Department 2: Fire */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 relative overflow-hidden">
                    <div className="flex items-center space-x-2 text-amber-600 mb-2">
                      <Flame className="w-5 h-5" />
                      <h4 className="font-bold text-sm">Fire & Emergency</h4>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">Safety NOC & Site Compliance</p>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                      <span className="text-xs font-bold text-amber-700">Officer Review Active</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Pending Station Inspector sign-off</p>
                  </div>

                  {/* Department 3: FDA */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 relative overflow-hidden">
                    <div className="flex items-center space-x-2 text-slate-500 mb-2">
                      <UtensilsCrossed className="w-5 h-5" />
                      <h4 className="font-bold text-sm">FDA Authority</h4>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">Food Safety Registration</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full border border-slate-400"></div>
                      <span className="text-xs font-semibold text-slate-500">Awaiting Fire Clearance</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Auto-triggers on Fire clearance</p>
                  </div>

                </div>
              </div>

              {/* Real-Time Audit Log Timeline */}
              <div className="mt-8 border-t border-slate-100 pt-5">
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">Inter-Agency Audit Trail</h4>
                <div className="space-y-3 text-xs">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5"></div>
                    <div>
                      <span className="font-semibold text-slate-800">14 Sep 2026, 11:20 AM: </span>
                      <span className="text-slate-600">BMC completed building appraisal; auto-forwarded dossier to Fire Directorate.</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                    <div>
                      <span className="font-semibold text-slate-800">12 Sep 2026, 03:45 PM: </span>
                      <span className="text-slate-600">Citizen submitted master dossier with consent verification token.</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* 5. Maharashtra Gov Standard Footer */}
      <footer className="bg-[#1a202c] text-slate-400 text-xs py-6 px-4 sm:px-8 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div>
            <p className="text-slate-200 font-semibold">Maharashtra Information Technology Corporation (MahaIT)</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Designed for SIH 2026 - Problem Statement ID: 26129</p>
          </div>
          <div className="flex space-x-4 text-[11px]">
            <a href="#" className="hover:text-slate-200">Terms of Service</a>
            <a href="#" className="hover:text-slate-200">Data Sharing Policy</a>
            <a href="#" className="hover:text-slate-200">Helpdesk</a>
          </div>
        </div>
      </footer>

    </div>
  );
}