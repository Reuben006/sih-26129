import api from './api';

export const applicationService = {
  // Applications
  async createApplication(data) {
    const res = await api.post('/applications', data);
    return res.data;
  },

  async getApplications() {
    const res = await api.get('/applications');
    return res.data;
  },

  async getApplication(id) {
    const res = await api.get(`/applications/${id}`);
    return res.data;
  },

  async getApplicationDepartments(id) {
    const res = await api.get(`/applications/${id}/departments`);
    return res.data;
  },

  async updateDepartmentStatus(appId, departmentId, status, remarks = '') {
    const res = await api.patch(`/applications/${appId}/departments/${departmentId}`, {
      status,
      remarks,
    });
    return res.data;
  },

  // Payments
  async getPayment(appId) {
    const res = await api.get(`/payments/applications/${appId}`);
    return res.data;
  },

  async makePayment(appId) {
    const res = await api.post(`/payments/applications/${appId}/pay`);
    return res.data;
  },

  // Workflows
  async getWorkflows() {
    const res = await api.get('/workflows');
    return res.data;
  },

  async getApplicationWorkflow(appId) {
    const res = await api.get(`/applications/${appId}/workflow`);
    return res.data;
  },

  // Consents
  async getConsents(appId) {
    const res = await api.get(`/applications/${appId}/consent`);
    return res.data;
  },

  async grantConsent(appId, payload) {
    const res = await api.post(`/applications/${appId}/consent`, payload);
    return res.data;
  },

  async revokeConsent(appId) {
    const res = await api.delete(`/applications/${appId}/consent`);
    return res.data;
  },

  // Audit Logs
  async getApplicationAudit(appId) {
    const res = await api.get(`/applications/${appId}/audit`);
    return res.data;
  },

  async getAllAuditLogs(limit = 100) {
    const res = await api.get(`/audit/logs?limit=${limit}`);
    return res.data;
  },

  // Dashboard & Monitoring
  async getDashboardSummary() {
    const res = await api.get('/dashboard/summary');
    return res.data;
  },

  // Notifications
  async getNotifications() {
    const res = await api.get('/notifications');
    return res.data;
  },

  async markNotificationRead(id) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  // Simulation Toggles (for SIH Judges resilience demo)
  async toggleSimulatedFailure(department, simulateFail) {
    const res = await api.post('/mock/simulate-failure', {
      department,
      simulate_fail: simulateFail,
    });
    return res.data;
  },

  async getSimulationStatus() {
    const res = await api.get('/mock/simulate-failure/status');
    return res.data;
  },
};
