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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
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
    </div>
  );
}
