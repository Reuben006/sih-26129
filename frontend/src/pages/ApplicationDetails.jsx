import axios from 'axios';
import React, { useState, useEffect } from 'react';
import DocumentVerificationCard from '../components/DocumentVerificationCard';
import {
  ArrowLeft,
  Building2,
  Calendar,
  FileCheck2,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  Code2
} from 'lucide-react';
import { applicationService } from '../services/applicationService';
import WorkflowTimeline from '../components/WorkflowTimeline';
import TransformationViewer from '../components/TransformationViewer';
import AuditLogTable from '../components/AuditLogTable';
import ConsentModal from '../components/ConsentModal';
import StatusBadge from '../components/StatusBadge';

export default function ApplicationDetails({ applicationId, onBack, currentUser }) {
  const [app, setApp] = useState(null);
  const [workflow, setWorkflow] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('workflow'); // 'workflow', 'transformation', 'audit'

  const fetchData = async () => {
    try {
      const [appData, wfData, auditData] = await Promise.all([
        applicationService.getApplication(applicationId),
        applicationService.getApplicationWorkflow(applicationId),
        applicationService.getApplicationAudit(applicationId),
      ]);
      setApp(appData);
      setWorkflow(wfData);
      setAuditLogs(auditData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const token = localStorage.getItem("govconnect_token");

      const res = await axios.get(
        `http://localhost:8000/api/v1/applications/${applicationId}/documents`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadPage = async () => {
      try {
        const appData = await applicationService.getApplication(applicationId);

        setApp(appData);

        await loadDocuments(appData.user_id);

        const [wfData, auditData] = await Promise.all([
          applicationService.getApplicationWorkflow(applicationId),
          applicationService.getApplicationAudit(applicationId),
        ]);

        setWorkflow(wfData);
        setAuditLogs(auditData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [applicationId]);

  const handleDepartmentAction = async (departmentId, status, remarks) => {
    setActionLoading(true);
    try {
      await applicationService.updateDepartmentStatus(applicationId, departmentId, status, remarks);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to process department action');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeConsent = async () => {
    try {
      await applicationService.revokeConsent(applicationId);
      await fetchData();
      setIsConsentModalOpen(false);
    } catch (err) {
      alert('Failed to revoke consent');
    }
  };

  const handleGrantConsent = async () => {
    try {
      await applicationService.grantConsent(applicationId, {
        data_scope: 'Identity, Business Details, Premises Address, Contact',
        purpose: 'Inter-departmental clearance across Municipal, FSSAI, and Fire Services',
      });
      await fetchData();
      setIsConsentModalOpen(false);
    } catch (err) {
      alert('Failed to grant consent');
    }
  };

  if (loading || !app) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-govblue-600 mb-2" />
        <p className="text-xs text-slate-500 font-medium">Loading federated application metadata...</p>
      </div>
    );
  }

  const isOfficialOrAdmin = currentUser?.role === 'OFFICIAL' || currentUser?.role === 'ADMIN';

  // Find active department step for demo action
  const currentStep = workflow?.steps?.find(
    (s) => s.step_order === app.current_step_order && app.overall_status === 'IN_PROGRESS'
  );

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-slate-900 font-mono">
              {app.application_number}
            </h1>
            <StatusBadge status={app.overall_status} size="lg" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Establishment: <span className="font-bold text-slate-800">{app.business_name}</span> • Proprietor:{' '}
            <span className="font-semibold text-slate-700">{app.owner_name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsConsentModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-govgreen-600" />
            <span>DPDP Consent Info</span>
          </button>
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Refresh status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* QUICK OFFICIAL / DEMO ACTION PANEL */}
      {isOfficialOrAdmin && app.overall_status === 'IN_PROGRESS' && currentStep && (
        <div className="bg-gradient-to-r from-govblue-900 to-govblue-800 text-white rounded-2xl p-5 shadow-md border border-blue-700">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-govsaffron-500 bg-govblue-950/80 px-2 py-0.5 rounded border border-blue-600/60">
                Official Review Console • Active Stage: {currentStep.department_name}
              </span>
              <h2 className="text-sm font-bold mt-1 text-white">
                Simulate Department Decision for {currentStep.department_name}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                External ID: <span className="font-mono text-govsaffron-500">{currentStep.external_reference || 'Assigned'}</span>. Click to simulate department response and trigger automated middleware workflow.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={actionLoading}
                onClick={() =>
                  handleDepartmentAction(
                    currentStep.department_id,
                    'APPROVED',
                    `Compliance verified by ${currentStep.department_name} field inspector`
                  )
                }
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve {currentStep.department_code}</span>
              </button>

              <button
                disabled={actionLoading}
                onClick={() =>
                  handleDepartmentAction(
                    currentStep.department_id,
                    'REJECTED',
                    `Fire safety distance & ventilation non-compliance reported by ${currentStep.department_name}`
                  )
                }
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Stage</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('workflow')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'workflow'
              ? 'bg-govblue-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Workflow Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('transformation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'transformation'
              ? 'bg-govblue-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Code2 className="w-4 h-4 text-govsaffron-500" />
          <span>Data Transformation Diff Viewer</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-govblue-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Immutable Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

     <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4">
          Attached Documents
        </h3>

        {documents.length === 0 ? (
          <p className="text-xs text-slate-500">
            No documents uploaded.
          </p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
             <DocumentVerificationCard
                key={doc.id}
                document={doc}
                onRefresh={loadDocuments}
                currentUser={currentUser}
            />
            ))}
          </div>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'workflow' && (
        <div className="space-y-6">
          <WorkflowTimeline
            steps={workflow?.steps || []}
            overallStatus={app.overall_status}
            currentStepOrder={app.current_step_order}
          />

          {/* Department Responses Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {app.department_statuses?.map((ds) => (
              <div key={ds.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">{ds.department?.name}</span>
                  <StatusBadge status={ds.status} />
                </div>
                <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                  <p>
                    External Reference:{' '}
                    <span className="font-mono font-bold text-slate-700">{ds.external_reference || 'Pending'}</span>
                  </p>
                  {ds.error_message && (
                    <p className="text-rose-600 font-medium">Error: {ds.error_message}</p>
                  )}
                  {ds.response_data?.officer_remarks && (
                    <p className="text-slate-700 italic">"{ds.response_data.officer_remarks}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'transformation' && (
        <TransformationViewer
          canonicalData={app.canonical_payload}
          departmentStatuses={app.department_statuses}
        />
      )}

      {activeTab === 'audit' && (
        <AuditLogTable auditLogs={auditLogs} />
      )}

      <ConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        consents={app.consents}
        onRevoke={handleRevokeConsent}
        onGrant={handleGrantConsent}
        isCitizen={currentUser?.role === 'CITIZEN'}
      />
    </div>
  );
}
