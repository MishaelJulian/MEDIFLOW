/**
 * MediFlow API Client
 * Centralized REST communication wrapper connecting frontend UI to /api/v1 endpoints.
 */

const API_BASE = '/api/v1';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('mediflow_token') || null;
    this.user = JSON.parse(localStorage.getItem('mediflow_user') || 'null');
  }

  setSession(token, user) {
    this.token = token;
    this.user = user;
    if (token) {
      localStorage.setItem('mediflow_token', token);
      localStorage.setItem('mediflow_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mediflow_token');
      localStorage.removeItem('mediflow_user');
    }
  }

  clearSession() {
    this.setSession(null, null);
  }

  isAuthenticated() {
    return !!this.token;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.errorCode = data.errorCode || 'UNKNOWN_ERROR';
        error.errors = data.errors || null;
        throw error;
      }

      return data;
    } catch (err) {
      console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, err);
      throw err;
    }
  }

  // --- Auth Endpoints ---
  async login(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.data && res.data.token) {
      this.setSession(res.data.token, res.data.user);
    }
    return res.data;
  }

  async register(userData) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (res.data && res.data.token) {
      this.setSession(res.data.token, res.data.user);
    }
    return res.data;
  }

  async getMe() {
    const res = await this.request('/auth/me');
    return res.data;
  }

  // --- Directory & Availability ---
  async getDepartments() {
    const res = await this.request('/departments');
    return res.data;
  }

  async getDoctors(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await this.request(`/directory/doctors${query ? `?${query}` : ''}`);
    return res.data;
  }

  async getDoctorAvailability(doctorId, date = null) {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    const res = await this.request(`/doctors/${doctorId}/availability${query}`);
    return res.data;
  }

  // --- Appointments ---
  async getAppointments(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await this.request(`/appointments${query ? `?${query}` : ''}`);
    return res.data;
  }

  async getAppointmentById(id) {
    const res = await this.request(`/appointments/${id}`);
    return res.data;
  }

  async bookAppointment({ doctorId, departmentId, date, startTime, endTime, reason }) {
    const res = await this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify({ doctorId, departmentId, date, startTime, endTime, reason }),
    });
    return res.data;
  }

  async cancelAppointment(id, reason) {
    const res = await this.request(`/appointments/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
    return res.data;
  }

  async confirmAppointment(id) {
    const res = await this.request(`/appointments/${id}/confirm`, {
      method: 'PATCH',
    });
    return res.data;
  }

  async completeAppointment(id, clinicalNotes = '') {
    const res = await this.request(`/appointments/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ clinicalNotes }),
    });
    return res.data;
  }

  async markNoShow(id, notes = '') {
    const res = await this.request(`/appointments/${id}/no-show`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    });
    return res.data;
  }

  // --- Prescriptions ---
  async getPrescriptions(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await this.request(`/prescriptions${query ? `?${query}` : ''}`);
    return res.data;
  }

  async getPrescriptionById(id) {
    const res = await this.request(`/prescriptions/${id}`);
    return res.data;
  }

  async getPrescriptionByAppointment(appointmentId) {
    const res = await this.request(`/prescriptions/appointment/${appointmentId}`);
    return res.data;
  }

  async createPrescription(payload) {
    const res = await this.request('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  }

  // --- Notifications ---
  async getNotifications() {
    const res = await this.request('/notifications');
    return res.data;
  }

  async getUnreadNotificationCount() {
    const res = await this.request('/notifications/unread-count');
    return res.data ? res.data.unreadCount : 0;
  }

  async markNotificationRead(id) {
    const res = await this.request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
    return res.data;
  }

  async markAllNotificationsRead() {
    const res = await this.request('/notifications/mark-all-read', {
      method: 'PATCH',
    });
    return res.data;
  }

  // --- Billing ---
  async getMyInvoices() {
    const res = await this.request('/billing/my-invoices');
    return res.data;
  }

  async getAllInvoices(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await this.request(`/billing${query ? `?${query}` : ''}`);
    return res.data;
  }

  async getInvoiceById(id) {
    const res = await this.request(`/billing/${id}`);
    return res.data;
  }

  async payInvoice(id, paymentMethod = 'ONLINE_SIMULATION') {
    const res = await this.request(`/billing/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod }),
    });
    return res.data;
  }

  async createInvoice(payload) {
    const res = await this.request('/billing', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  }

  // --- Analytics, Reports & Role Dashboards ---
  async getNoShowRisk(appointmentId) {
    const res = await this.request(`/analytics/no-show-risk/${appointmentId}`);
    return res.data;
  }

  async getDashboardSummary() {
    const res = await this.request('/analytics/dashboard-summary');
    return res.data;
  }

  async getAdminDashboard() {
    const res = await this.request('/analytics/admin-dashboard');
    return res.data;
  }

  async getOperationalReports(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await this.request(`/analytics/reports${query ? `?${query}` : ''}`);
    return res.data;
  }

  async getDoctorDashboard() {
    const res = await this.request('/analytics/doctor-dashboard');
    return res.data;
  }

  async getPatientDashboard() {
    const res = await this.request('/analytics/patient-dashboard');
    return res.data;
  }

  // --- Admin Controls ---
  async getAdminUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await this.request(`/admin/users${query ? `?${query}` : ''}`);
    return res.data;
  }

  async setAdminUserStatus(id, isActive) {
    const res = await this.request(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
    return res.data;
  }

  async updateAdminUserRole(id, role) {
    const res = await this.request(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    return res.data;
  }

  async getAdminAppointments(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await this.request(`/admin/appointments${query ? `?${query}` : ''}`);
    return res.data;
  }

  async overrideAdminAppointment(id, { status, reason, notes }) {
    const res = await this.request(`/admin/appointments/${id}/override`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason, notes }),
    });
    return res.data;
  }
}

const api = new ApiClient();
window.api = api;

