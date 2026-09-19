import api from './api';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    if (res.data.access_token) {
      localStorage.setItem('govconnect_token', res.data.access_token);
      localStorage.setItem('govconnect_user', JSON.stringify(res.data.user));
      window.dispatchEvent(new Event('auth-change'));
    }
    return res.data;
  },

  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.access_token) {
      localStorage.setItem('govconnect_token', res.data.access_token);
      localStorage.setItem('govconnect_user', JSON.stringify(res.data.user));
      window.dispatchEvent(new Event('auth-change'));
    }
    return res.data;
  },

  logout() {
    localStorage.removeItem('govconnect_token');
    localStorage.removeItem('govconnect_user');
    window.dispatchEvent(new Event('auth-change'));
  },

  getCurrentUser() {
    const stored = localStorage.getItem('govconnect_user');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('govconnect_token');
  }
};
