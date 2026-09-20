import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import NewApplication from './pages/NewApplication';
import ApplicationDetails from './pages/ApplicationDetails';
import OfficialDashboard from './pages/OfficialDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ArchitectureView from './pages/ArchitectureView';
import { authService } from './services/authService';

export default function App() {
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [authPage, setAuthPage] = useState('login'); // 'login' | 'register'
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAppId, setSelectedAppId] = useState(null);

  const refreshUser = () => {
    setCurrentUser(authService.getCurrentUser());
  };

  useEffect(() => {
    const handleAuthChange = () => {
      refreshUser();
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const handleSwitchPersona = async (email) => {
    try {
      await authService.login(email, 'Password123!');
      refreshUser();
      setCurrentView('dashboard');
      setSelectedAppId(null);
    } catch {
      alert('Failed to switch persona');
    }
  };

  const handleSelectApplication = (id) => {
    setSelectedAppId(id);
    setCurrentView('application_details');
  };

  if (!currentUser) {
    return authPage === 'login' ? (
      <Login
        onLoginSuccess={() => {
          refreshUser();
          setCurrentView('dashboard');
        }}
        onNavigateRegister={() => setAuthPage('register')}
      />
    ) : (
      <Register
        onRegisterSuccess={() => {
          refreshUser();
          setCurrentView('dashboard');
        }}
        onNavigateLogin={() => setAuthPage('login')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col font-sans text-slate-800">
      <Navbar
        currentUser={currentUser}
        onSwitchRole={handleSwitchPersona}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      <div className="flex-1 flex">
        <Sidebar
          currentView={currentView}
          setCurrentView={(view) => {
            setCurrentView(view);
            setSelectedAppId(null);
          }}
          currentUser={currentUser}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {currentView === 'dashboard' && (
            <>
              {currentUser.role === 'CITIZEN' && (
                <CitizenDashboard
                  onNavigateNew={() => setCurrentView('new_application')}
                  onSelectApplication={handleSelectApplication}
                />
              )}
              {currentUser.role === 'OFFICIAL' && (
                <OfficialDashboard onSelectApplication={handleSelectApplication} />
              )}
              {currentUser.role === 'ADMIN' && (
                <AdminDashboard onSelectApplication={handleSelectApplication} />
              )}
            </>
          )}

          {currentView === 'new_application' && (
            <NewApplication
              onCancel={() => setCurrentView('dashboard')}
              onSuccess={(id) => {
                setSelectedAppId(id);
                setCurrentView('application_details');
              }}
            />
          )}

          {currentView === 'application_details' && selectedAppId && (
            <ApplicationDetails
              applicationId={selectedAppId}
              onBack={() => {
                setSelectedAppId(null);
                setCurrentView('dashboard');
              }}
              currentUser={currentUser}
            />
          )}

          {currentView === 'architecture' && <ArchitectureView />}

          {currentView === 'official_queue' && (
            <OfficialDashboard onSelectApplication={handleSelectApplication} />
          )}

          {currentView === 'health_monitor' && (
            <AdminDashboard onSelectApplication={handleSelectApplication} />
          )}

          {currentView === 'audit_logs' && (
            <AdminDashboard onSelectApplication={handleSelectApplication} />
          )}
        </main>
      </div>

      {/* 4. OFFICIAL MAHARASHTRA STATE GOVERNMENT FOOTER */}
      <footer className="bg-[#0c2d57] text-white text-xs mt-auto border-t-4 border-govsaffron-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-blue-900/60">
            <div className="space-y-2 md:col-span-2">
              <h5 className="font-bold text-sm text-govsaffron-500">
                महाराष्ट्र शासन | Government of Maharashtra
              </h5>
              <p className="text-slate-300 text-[11px] leading-relaxed max-w-md">
                Interoperability Citizen Service Gateway (Maha-ICSG) provides a unified middleware layer connecting Municipal Corporations, FSSAI FoSCoS, and the Directorate of Fire Services without replacing legacy departmental systems.
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <span className="inline-block bg-blue-950 text-amber-300 font-mono text-[10px] px-2.5 py-1 rounded border border-blue-800">
                  SIH 2026 PS-26129 Prototype
                </span>
                <span className="inline-block bg-blue-950 text-emerald-300 font-mono text-[10px] px-2.5 py-1 rounded border border-emerald-800/60 font-semibold">
                  Team: Origin X • ID: 134028
                </span>
              </div>
            </div>

            <div>
              <h6 className="font-bold text-xs text-white uppercase mb-2">महत्त्वाचे दुवे (Portal Links)</h6>
              <ul className="space-y-1 text-[11px] text-slate-300">
                <li><span className="hover:text-amber-400 cursor-pointer">Aaple Sarkar Portal</span></li>
                <li><span className="hover:text-amber-400 cursor-pointer">MahaDigiLocker Integration</span></li>
                <li><span className="hover:text-amber-400 cursor-pointer">National Data Sharing (NDSAP)</span></li>
                <li><span className="hover:text-amber-400 cursor-pointer">Maharashtra IT e-Governance Policy</span></li>
              </ul>
            </div>

            <div>
              <h6 className="font-bold text-xs text-white uppercase mb-2">Interoperability Standards</h6>
              <ul className="space-y-1 text-[11px] text-slate-300">
                <li>• Federated Identity (OAuth2 / SSO)</li>
                <li>• DPDP Act 2023 Consent Artifacts</li>
                <li>• Asynchronous Department Webhooks</li>
                <li>• Pydantic Canonical Data Schema</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <p>
              © 2026 Government of Maharashtra. Developed by <strong className="text-slate-200">Origin X</strong> (Team ID: <span className="font-mono text-govsaffron-500">134028</span>) for Smart India Hackathon.
            </p>
            <p className="font-mono text-slate-400">
              Gateway Status: <span className="text-emerald-400 font-bold">ACTIVE-ONLINE</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}