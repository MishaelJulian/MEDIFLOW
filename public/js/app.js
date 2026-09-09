/**
 * MediFlow Main Application Controller
 * Handles client-side routing, role-specific UI guards, rendering, and interactions.
 */

class App {
  constructor() {
    this.currentView = 'dashboard';
    this.unreadNotifications = 0;
  }

  async init() {
    window.addEventListener('hashchange', () => this.handleRouting());
    
    // Check session
    if (api.isAuthenticated()) {
      try {
        const user = await api.getMe();
        api.setSession(api.token, user);
      } catch (err) {
        api.clearSession();
      }
    }

    this.renderNav();
    this.handleRouting();
    this.startNotificationPoller();
  }

  // --- Router ---
  handleRouting() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    const [route, param] = hash.split('/');

    if (!api.isAuthenticated() && route !== 'register' && route !== 'login') {
      this.navigate('login');
      return;
    }

    if (api.isAuthenticated() && (route === 'login' || route === 'register')) {
      this.navigate('dashboard');
      return;
    }

    this.currentView = route;
    this.renderNav();

    switch (route) {
      case 'login':
        this.renderLoginView();
        break;
      case 'register':
        this.renderRegisterView();
        break;
      case 'dashboard':
        this.renderDashboardView();
        break;
      case 'doctors':
        this.renderDoctorsDirectoryView();
        break;
      case 'availability':
        this.renderAvailabilityView(param);
        break;
      case 'appointment':
        this.renderAppointmentDetailsView(param);
        break;
      case 'prescriptions':
        this.renderPrescriptionsView(param);
        break;
      case 'notifications':
        this.renderNotificationsView();
        break;
      case 'billing':
        this.renderBillingView();
        break;
      case 'admin':
        this.renderAdminView();
        break;
      default:
        this.renderDashboardView();
    }
  }

  navigate(route, param = null) {
    const targetHash = param ? `#${route}/${param}` : `#${route}`;
    if (window.location.hash === targetHash) {
      this.handleRouting();
    } else {
      window.location.hash = targetHash;
    }
  }

  // --- Navigation & Role-Based UI ---
  renderNav() {
    const nav = document.getElementById('mainNav');
    const controls = document.getElementById('userControls');

    if (!api.isAuthenticated()) {
      nav.innerHTML = `
        <a href="#login" class="${this.currentView === 'login' ? 'active' : ''}">Login</a>
        <a href="#register" class="${this.currentView === 'register' ? 'active' : ''}">Register</a>
      `;
      controls.innerHTML = '';
      return;
    }

    const user = api.user || {};
    const role = user.role || 'PATIENT';

    let links = '';
    if (role === 'PATIENT') {
      links = `
        <a href="#dashboard" class="${this.currentView === 'dashboard' ? 'active' : ''}">📊 Dashboard</a>
        <a href="#doctors" class="${this.currentView === 'doctors' ? 'active' : ''}">🩺 Find Doctors</a>
        <a href="#prescriptions" class="${this.currentView === 'prescriptions' ? 'active' : ''}">💊 Prescriptions</a>
        <a href="#billing" class="${this.currentView === 'billing' ? 'active' : ''}">💳 Billing</a>
      `;
    } else if (role === 'DOCTOR') {
      links = `
        <a href="#dashboard" class="${this.currentView === 'dashboard' ? 'active' : ''}">🩺 Doctor Queue</a>
        <a href="#prescriptions" class="${this.currentView === 'prescriptions' ? 'active' : ''}">💊 Prescriptions</a>
      `;
    } else if (role === 'ADMIN' || role === 'RECEPTIONIST') {
      links = `
        <a href="#dashboard" class="${this.currentView === 'dashboard' ? 'active' : ''}">📊 Overview</a>
        <a href="#doctors" class="${this.currentView === 'doctors' ? 'active' : ''}">🩺 Doctors</a>
        <a href="#billing" class="${this.currentView === 'billing' ? 'active' : ''}">💳 Invoices</a>
        <a href="#admin" class="${this.currentView === 'admin' ? 'active' : ''}">⚙️ Reports & AI Analytics</a>
      `;
    }

    nav.innerHTML = links;

    controls.innerHTML = `
      <a href="#notifications" class="btn btn-secondary btn-sm" title="Notifications" style="position: relative;">
        🔔 Alerts
        ${this.unreadNotifications > 0 ? `<span class="badge" style="background:#dc2626; color:white; font-size:0.65rem; padding:0.1rem 0.35rem; margin-left:0.25rem;">${this.unreadNotifications}</span>` : ''}
      </a>
      <div class="user-badge">
        <span>👤 ${this.escapeHtml(user.name || user.email)}</span>
        <span class="role-tag ${role}">${role}</span>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="app.logout()">Logout</button>
    `;
  }

  async startNotificationPoller() {
    if (!api.isAuthenticated()) return;
    try {
      this.unreadNotifications = await api.getUnreadNotificationCount();
      this.renderNav();
    } catch (e) {}
    setTimeout(() => this.startNotificationPoller(), 15000);
  }

  // --- Auth Views ---
  renderLoginView() {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = `
      <div style="max-width: 420px; margin: 3rem auto;">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Account Login</h2>
          </div>
          <form id="loginForm" onsubmit="app.handleLogin(event)">
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" id="loginEmail" class="form-control" required placeholder="user@example.com" />
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" id="loginPassword" class="form-control" required placeholder="••••••••" />
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem;" id="loginSubmitBtn">
              Sign In
            </button>
          </form>
          <div style="margin-top: 1.25rem; text-align: center; font-size: 0.85rem; color: var(--text-muted);">
            Don't have an account? <a href="#register" style="color: var(--primary);">Register as Patient</a>
          </div>
        </div>
      </div>
    `;
  }

  renderRegisterView() {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = `
      <div style="max-width: 500px; margin: 2rem auto;">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Patient Registration</h2>
          </div>
          <form id="registerForm" onsubmit="app.handleRegister(event)">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" id="regName" class="form-control" required placeholder="Jane Doe" />
            </div>
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" id="regEmail" class="form-control" required placeholder="jane@example.com" />
            </div>
            <div class="form-group">
              <label class="form-label">Password (min 6 chars)</label>
              <input type="password" id="regPassword" class="form-control" required placeholder="••••••••" minlength="6" />
            </div>
            <div class="grid-cols-2">
              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input type="tel" id="regPhone" class="form-control" placeholder="+1-555-0100" />
              </div>
              <div class="form-group">
                <label class="form-label">Gender</label>
                <select id="regGender" class="form-control">
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem;">
              Create Patient Account
            </button>
          </form>
        </div>
      </div>
    `;
  }

  async handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('loginSubmitBtn');
    btn.disabled = true;
    btn.textContent = 'Authenticating...';

    try {
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      await api.login(email, password);
      this.showToast('Login successful', 'success');
      this.navigate('dashboard');
    } catch (err) {
      this.showToast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    try {
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const phone = document.getElementById('regPhone').value.trim();
      const gender = document.getElementById('regGender').value;

      await api.register({ name, email, password, phone, gender });
      this.showToast('Registration successful! Welcome to MediFlow.', 'success');
      this.navigate('dashboard');
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  async quickLogin(email, password) {
    try {
      this.showToast(`Logging in as ${email}...`);
      await api.login(email, password);
      this.unreadNotifications = await api.getUnreadNotificationCount().catch(() => 0);
      this.showToast(`Logged in as ${api.user.name} (${api.user.role})`, 'success');
      this.renderNav();
      this.navigate('dashboard');
      this.renderDashboardView();
    } catch (err) {
      this.showToast(`Quick login failed: ${err.message}`, 'error');
    }
  }

  logout() {
    api.clearSession();
    this.unreadNotifications = 0;
    this.showToast('Logged out');
    this.renderNav();
    this.navigate('login');
  }

  // --- Dashboard View (Role Adaptive) ---
  async renderDashboardView() {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = '<div class="spinner"></div>';

    const role = api.user?.role || 'PATIENT';

    try {
      const appointments = await api.getAppointments();

      if (role === 'DOCTOR') {
        this.renderDoctorDashboard(appContainer, appointments);
      } else if (role === 'ADMIN' || role === 'RECEPTIONIST') {
        this.renderAdminOverview(appContainer, appointments);
      } else {
        this.renderPatientDashboard(appContainer, appointments);
      }
    } catch (err) {
      appContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3>Failed to load dashboard</h3>
          <p>${this.escapeHtml(err.message)}</p>
          <button class="btn btn-primary" onclick="app.renderDashboardView()" style="margin-top: 1rem;">Retry</button>
        </div>
      `;
    }
  }

  renderPatientDashboard(container, appointments) {
    const upcoming = appointments.filter((a) => a.status === 'BOOKED' || a.status === 'CONFIRMED');
    const past = appointments.filter((a) => a.status === 'COMPLETED' || a.status === 'CANCELLED' || a.status === 'NO_SHOW');

    container.innerHTML = `
      <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="font-size: 1.6rem; font-weight: 700;">Welcome, ${this.escapeHtml(api.user.name)}</h1>
          <p style="color: var(--text-muted);">Manage your health consultations, prescriptions, and visits.</p>
        </div>
        <a href="#doctors" class="btn btn-primary">➕ Book Appointment</a>
      </div>

      <div class="grid-cols-4" style="margin-bottom: 1.5rem;">
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div>
            <div class="stat-value">${upcoming.length}</div>
            <div class="stat-label">Upcoming Visits</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div>
            <div class="stat-value">${past.filter((a) => a.status === 'COMPLETED').length}</div>
            <div class="stat-label">Completed Consultations</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔔</div>
          <div>
            <div class="stat-value">${this.unreadNotifications}</div>
            <div class="stat-label">Unread Notifications</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💳</div>
          <div>
            <div class="stat-value"><a href="#billing" style="text-decoration:none; color:inherit;">View</a></div>
            <div class="stat-label">Invoices & Receipts</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Upcoming Appointments</h3>
        </div>
        ${
          upcoming.length === 0
            ? `<div class="empty-state"><div class="empty-icon">📅</div><p>No upcoming appointments. Schedule a consultation with one of our specialists.</p><a href="#doctors" class="btn btn-primary" style="margin-top:0.75rem;">Browse Doctors</a></div>`
            : `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Doctor & Specialty</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${upcoming
                  .map(
                    (a) => `
                  <tr>
                    <td><strong>${a.date}</strong><br/><small style="color:var(--text-muted);">${a.startTime} - ${a.endTime}</small></td>
                    <td>Dr. ${this.escapeHtml(a.doctorId?.userId?.name || 'Specialist')}<br/><small style="color:var(--text-muted);">${a.doctorId?.specialization || 'General'}</small></td>
                    <td><span class="badge badge-${a.status}">${a.status}</span></td>
                    <td>${this.escapeHtml(a.reason || 'General Consultation')}</td>
                    <td>
                      <button class="btn btn-secondary btn-sm" onclick="app.navigate('appointment', '${a._id}')">Details</button>
                      ${a.status === 'BOOKED' ? `<button class="btn btn-danger btn-sm" onclick="app.promptCancelAppointment('${a._id}')">Cancel</button>` : ''}
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        `
        }
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Past Medical Encounters</h3>
        </div>
        ${
          past.length === 0
            ? `<div class="empty-state"><p>No previous consultation history.</p></div>`
            : `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Prescription</th>
                </tr>
              </thead>
              <tbody>
                ${past
                  .map(
                    (a) => `
                  <tr>
                    <td>${a.date} (${a.startTime})</td>
                    <td>Dr. ${this.escapeHtml(a.doctorId?.userId?.name || 'Doctor')}</td>
                    <td><span class="badge badge-${a.status}">${a.status}</span></td>
                    <td>${this.escapeHtml(a.notes || a.reason || '—')}</td>
                    <td>
                      ${a.status === 'COMPLETED' ? `<button class="btn btn-secondary btn-sm" onclick="app.viewPrescriptionByAppointment('${a._id}')">💊 View Rx</button>` : '—'}
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        `
        }
      </div>
    `;
  }

  renderDoctorDashboard(container, appointments) {
    container.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <h1 style="font-size: 1.6rem; font-weight: 700;">Doctor Clinical Portal</h1>
        <p style="color: var(--text-muted);">Manage assigned patients, update consultation workflow statuses, and issue prescriptions.</p>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Assigned Appointments Queue</h3>
        </div>
        ${
          appointments.length === 0
            ? `<div class="empty-state"><div class="empty-icon">🩺</div><p>No appointments booked in your schedule.</p></div>`
            : `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date / Slot</th>
                  <th>Patient</th>
                  <th>Reason</th>
                  <th>Current State</th>
                  <th>Workflow Actions</th>
                </tr>
              </thead>
              <tbody>
                ${appointments
                  .map(
                    (a) => `
                  <tr>
                    <td><strong>${a.date}</strong><br/><small style="color:var(--text-muted);">${a.startTime} - ${a.endTime}</small></td>
                    <td><strong>${this.escapeHtml(a.patientId?.userId?.name || 'Patient')}</strong><br/><small style="color:var(--text-muted);">${a.patientId?.gender || ''} | Blood: ${a.patientId?.bloodGroup || 'N/A'}</small></td>
                    <td>${this.escapeHtml(a.reason || 'General checkup')}</td>
                    <td><span class="badge badge-${a.status}">${a.status}</span></td>
                    <td>
                      ${
                        a.status === 'BOOKED'
                          ? `<button class="btn btn-success btn-sm" onclick="app.confirmAppointment('${a._id}')">Confirm</button>`
                          : ''
                      }
                      ${
                        a.status === 'CONFIRMED'
                          ? `
                          <button class="btn btn-primary btn-sm" onclick="app.promptCompleteAppointment('${a._id}')">Complete</button>
                          <button class="btn btn-danger btn-sm" onclick="app.markNoShow('${a._id}')">No-Show</button>
                        `
                          : ''
                      }
                      ${
                        a.status === 'COMPLETED'
                          ? `
                          <button class="btn btn-secondary btn-sm" onclick="app.openPrescriptionModal('${a._id}')">✍️ Prescribe</button>
                          <button class="btn btn-secondary btn-sm" onclick="app.viewPrescriptionByAppointment('${a._id}')">View Rx</button>
                        `
                          : ''
                      }
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        `
        }
      </div>
    `;
  }

  renderAdminOverview(container, appointments) {
    container.innerHTML = `
      <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="font-size: 1.6rem; font-weight: 700;">Hospital Administration & Operations</h1>
          <p style="color: var(--text-muted);">Central management and operational oversight.</p>
        </div>
        <a href="#admin" class="btn btn-primary">📈 View AI & Full Analytics</a>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Recent Hospital Appointments</h3>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date / Time</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Status</th>
                <th>AI No-Show Risk</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${appointments
                .slice(0, 15)
                .map(
                  (a) => `
                <tr>
                  <td><strong>${a.date}</strong><br/><small style="color:var(--text-muted);">${a.startTime} - ${a.endTime}</small></td>
                  <td>${this.escapeHtml(a.patientId?.userId?.name || 'Patient')}</td>
                  <td>Dr. ${this.escapeHtml(a.doctorId?.userId?.name || 'Doctor')}</td>
                  <td><span class="badge badge-${a.status}">${a.status}</span></td>
                  <td>
                    <button class="btn btn-secondary btn-sm" onclick="app.showNoShowRiskModal('${a._id}')">🧠 Evaluate Risk</button>
                  </td>
                  <td>
                    <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
                      <button class="btn btn-secondary btn-sm" onclick="app.navigate('appointment', '${a._id}')">Details</button>
                      ${
                        a.status === 'BOOKED'
                          ? `<button class="btn btn-success btn-sm" onclick="app.confirmAppointment('${a._id}')">✅ Confirm</button>`
                          : ''
                      }
                      ${
                        a.status === 'CONFIRMED'
                          ? `
                          <button class="btn btn-primary btn-sm" onclick="app.promptCompleteAppointment('${a._id}')">Complete</button>
                          <button class="btn btn-danger btn-sm" onclick="app.markNoShow('${a._id}')">No-Show</button>
                        `
                          : ''
                      }
                    </div>
                  </td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --- Doctor Directory View ---
  async renderDoctorsDirectoryView() {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = '<div class="spinner"></div>';

    try {
      const [doctors, departments] = await Promise.all([api.getDoctors(), api.getDepartments()]);

      appContainer.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
          <h1 style="font-size: 1.6rem; font-weight: 700;">Find Medical Specialists</h1>
          <p style="color: var(--text-muted);">Browse accredited hospital departments, view doctors, and schedule consultations.</p>
        </div>

        <div class="card" style="margin-bottom: 1.5rem;">
          <div style="display:flex; gap:1rem; flex-wrap:wrap;">
            <input type="text" id="doctorSearchInput" class="form-control" placeholder="Search by doctor name or specialization..." style="flex:1; min-width:260px;" oninput="app.filterDoctorsDirectory()" />
            <select id="departmentFilter" class="form-control" style="width:240px;" onchange="app.filterDoctorsDirectory()">
              <option value="">All Departments</option>
              ${departments.map((d) => `<option value="${this.escapeHtml(d.name)}">${this.escapeHtml(d.name)}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="grid-cols-3" id="doctorsGrid">
          ${this.renderDoctorCards(doctors)}
        </div>
      `;

      window.loadedDoctors = doctors;
    } catch (err) {
      appContainer.innerHTML = `<div class="empty-state"><p>Error loading directory: ${this.escapeHtml(err.message)}</p></div>`;
    }
  }

  renderDoctorCards(doctors) {
    if (doctors.length === 0) {
      return `<div class="empty-state" style="grid-column: 1/-1;"><p>No doctors found matching criteria.</p></div>`;
    }

    return doctors
      .map(
        (doc) => {
          const docId = doc.doctorId || doc._id;
          const docName = doc.name || doc.userId?.name || 'Specialist';
          const deptName = doc.department?.name || doc.departmentId?.name || 'Department';
          const specialization = doc.specialization || 'Clinical Care';
          const fee = doc.consultationFee || 100;
          const exp = doc.experienceYears || 5;
          const bio = doc.bio || 'Experienced hospital clinical specialist providing tailored treatments.';

          return `
      <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; margin-bottom:0;">
        <div>
          <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.75rem;">
            <div class="stat-icon" style="width:40px; height:40px; font-size:1.2rem;">👨‍⚕️</div>
            <div>
              <h3 style="font-size:1.1rem; font-weight:600;">Dr. ${this.escapeHtml(docName)}</h3>
              <span class="role-tag DOCTOR">${this.escapeHtml(deptName)}</span>
            </div>
          </div>
          <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:0.5rem;">
            <strong>Specialization:</strong> ${this.escapeHtml(specialization)}
          </p>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.75rem; line-height:1.4;">
            ${this.escapeHtml(bio)}
          </p>
          <div style="font-size:0.85rem; margin-bottom:1rem;">
            <span>Fee: <strong>₹${fee}</strong></span> &bull;
            <span>Experience: <strong>${exp}+ yrs</strong></span>
          </div>
        </div>
        <button class="btn btn-primary" style="width:100%;" onclick="app.navigate('availability', '${docId}')">
          🗓️ View Availability & Book
        </button>
      </div>
    `;
        }
      )
      .join('');
  }

  filterDoctorsDirectory() {
    const term = document.getElementById('doctorSearchInput').value.toLowerCase();
    const dept = document.getElementById('departmentFilter').value;
    const grid = document.getElementById('doctorsGrid');

    const filtered = (window.loadedDoctors || []).filter((doc) => {
      const docName = (doc.name || doc.userId?.name || '').toLowerCase();
      const spec = (doc.specialization || '').toLowerCase();
      const docDept = doc.department?.name || doc.departmentId?.name || '';
      const nameMatch = docName.includes(term) || spec.includes(term);
      const deptMatch = !dept || docDept.toLowerCase() === dept.toLowerCase();
      return nameMatch && deptMatch;
    });

    grid.innerHTML = this.renderDoctorCards(filtered);
  }

  // --- Availability & Booking Screen ---
  async renderAvailabilityView(doctorId) {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = '<div class="spinner"></div>';

    try {
      const today = new Date().toISOString().slice(0, 10);
      const availabilitySlots = await api.getDoctorAvailability(doctorId);
      const doctors = await api.getDoctors();
      const doctor = doctors.find((d) => (d.doctorId || d._id) === doctorId || String(d.doctorId || d._id) === String(doctorId));
      const doctorName = doctor?.name || doctor?.userId?.name || 'Specialist';
      const departmentName = doctor?.department?.name || doctor?.departmentId?.name || '';
      const departmentId = doctor?.department?.id || doctor?.department?._id || doctor?.departmentId?._id || doctor?.departmentId || '';

      appContainer.innerHTML = `
        <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-size: 1.6rem; font-weight: 700;">Doctor Availability & Schedule</h1>
            <p style="color: var(--text-muted);">
              Dr. ${this.escapeHtml(doctorName)} ${departmentName ? `&bull; ${this.escapeHtml(departmentName)}` : ''}
            </p>
          </div>
          <a href="#doctors" class="btn btn-secondary">← Back to Directory</a>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Available Shift Slots (Next 7 Days)</h3>
          </div>
          ${
            availabilitySlots.length === 0
              ? `<div class="empty-state"><p>No published availability schedules for this doctor.</p></div>`
              : `
            <div style="display:flex; flex-direction:column; gap:1.5rem;">
              ${availabilitySlots
                .map((slot) => {
                  const isPast = slot.date < today;
                  return `
                    <div style="border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem; background: ${isPast ? '#f8fafc' : 'white'}; opacity: ${isPast ? 0.6 : 1};">
                      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
                        <div>
                          <strong>📅 Date: ${slot.date}</strong>
                          ${isPast ? '<span class="badge" style="background:#f1f5f9; color:#94a3b8; margin-left:0.5rem;">Past Date</span>' : ''}
                        </div>
                        <div style="font-size:0.85rem; color:var(--text-muted);">
                          Hours: ${slot.startTime} – ${slot.endTime} (Slots of ${slot.slotDuration || 30} mins)
                        </div>
                      </div>
                      <div class="slot-grid">
                        ${this.generateTimeSlots(slot.date, slot.startTime, slot.endTime, slot.slotDuration || 30, isPast, doctorId, departmentId)}
                      </div>
                    </div>
                  `;
                })
                .join('')}
            </div>
          `
          }
        </div>
      `;
    } catch (err) {
      appContainer.innerHTML = `<div class="empty-state"><p>Error: ${this.escapeHtml(err.message)}</p></div>`;
    }
  }

  generateTimeSlots(date, startTime, endTime, durationMinutes, isPast, doctorId, departmentId) {
    const slots = [];
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    let currMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    while (currMinutes + durationMinutes <= endMinutes) {
      const h = Math.floor(currMinutes / 60).toString().padStart(2, '0');
      const m = (currMinutes % 60).toString().padStart(2, '0');
      const slotStart = `${h}:${m}`;

      const endHStr = Math.floor((currMinutes + durationMinutes) / 60).toString().padStart(2, '0');
      const endMStr = ((currMinutes + durationMinutes) % 60).toString().padStart(2, '0');
      const slotEnd = `${endHStr}:${endMStr}`;

      const disabledAttr = isPast ? 'disabled' : '';

      slots.push(`
        <button class="slot-btn ${isPast ? 'disabled' : ''}" ${disabledAttr} onclick="app.openBookingModal('${doctorId}', '${departmentId}', '${date}', '${slotStart}', '${slotEnd}')">
          ${slotStart}
        </button>
      `);

      currMinutes += durationMinutes;
    }

    return slots.join('');
  }

  // --- Booking Modal ---
  openBookingModal(doctorId, departmentId, date, startTime, endTime) {
    if (!api.isAuthenticated()) {
      this.showToast('Please log in as a patient to book appointments', 'error');
      this.navigate('login');
      return;
    }

    const modal = document.getElementById('modalContainer');
    modal.innerHTML = `
      <div class="modal-overlay" onclick="if(event.target === this) app.closeModal()">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="card-title">Confirm Appointment Booking</h3>
            <button class="modal-close" onclick="app.closeModal()">&times;</button>
          </div>
          <div style="background:var(--bg-app); border:1px solid var(--border); padding:1rem; border-radius:var(--radius-sm); margin-bottom:1.25rem;">
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time Slot:</strong> ${startTime} – ${endTime} (30 mins)</p>
          </div>
          <form onsubmit="app.handleBookingSubmit(event, '${doctorId}', '${departmentId}', '${date}', '${startTime}', '${endTime}')">
            <div class="form-group">
              <label class="form-label">Reason for Visit / Symptoms</label>
              <textarea id="bookingReason" class="form-control" rows="3" placeholder="Briefly describe your symptoms or reason for visit..." required></textarea>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.5rem;">
              <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" id="bookingSubmitBtn">Confirm & Book Slot</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  async handleBookingSubmit(e, doctorId, departmentId, date, startTime, endTime) {
    e.preventDefault();
    const btn = document.getElementById('bookingSubmitBtn');
    btn.disabled = true;
    btn.textContent = 'Securing Slot...';

    try {
      const reason = document.getElementById('bookingReason').value.trim();
      const appt = await api.bookAppointment({
        doctorId,
        departmentId,
        date,
        startTime,
        endTime,
        reason,
      });

      this.closeModal();
      this.showToast('Appointment booked successfully! Slot reserved.', 'success');
      this.navigate('appointment', appt._id);
    } catch (err) {
      this.showToast(`Booking Failed: ${err.message}`, 'error');
      btn.disabled = false;
      btn.textContent = 'Confirm & Book Slot';
    }
  }

  // --- Appointment Details & Status ---
  async renderAppointmentDetailsView(appointmentId) {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = '<div class="spinner"></div>';

    try {
      const appt = await api.getAppointmentById(appointmentId);

      appContainer.innerHTML = `
        <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-size: 1.6rem; font-weight: 700;">Appointment Details</h1>
            <p style="color: var(--text-muted);">Reference: ${appt._id}</p>
          </div>
          <a href="#dashboard" class="btn btn-secondary">← Back to Dashboard</a>
        </div>

        <div class="grid-cols-2">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Consultation Information</h3>
              <span class="badge badge-${appt.status}">${appt.status}</span>
            </div>
            <table class="data-table">
              <tr>
                <td><strong>Date</strong></td>
                <td>${appt.date}</td>
              </tr>
              <tr>
                <td><strong>Scheduled Window</strong></td>
                <td>${appt.startTime} – ${appt.endTime}</td>
              </tr>
              <tr>
                <td><strong>Doctor</strong></td>
                <td>Dr. ${this.escapeHtml(appt.doctorId?.userId?.name || 'Doctor')} (${appt.doctorId?.specialization || ''})</td>
              </tr>
              <tr>
                <td><strong>Department</strong></td>
                <td>${this.escapeHtml(appt.departmentId?.name || 'Clinical')}</td>
              </tr>
              <tr>
                <td><strong>Reason for Consultation</strong></td>
                <td>${this.escapeHtml(appt.reason || 'General checkup')}</td>
              </tr>
              ${appt.notes ? `<tr><td><strong>Doctor Clinical Notes</strong></td><td>${this.escapeHtml(appt.notes)}</td></tr>` : ''}
              ${appt.cancellationReason ? `<tr><td><strong>Cancellation Reason</strong></td><td>${this.escapeHtml(appt.cancellationReason)}</td></tr>` : ''}
            </table>

            <div style="margin-top:1.5rem; display:flex; gap:0.75rem; flex-wrap:wrap;">
              ${
                appt.status === 'BOOKED' && api.user.role === 'PATIENT'
                  ? `<button class="btn btn-danger" onclick="app.promptCancelAppointment('${appt._id}')">Cancel Appointment</button>`
                  : ''
              }
              ${
                appt.status === 'BOOKED' && (api.user.role === 'DOCTOR' || api.user.role === 'RECEPTIONIST' || api.user.role === 'ADMIN')
                  ? `<button class="btn btn-success" onclick="app.confirmAppointment('${appt._id}')">✅ Confirm Appointment</button>`
                  : ''
              }
              ${
                appt.status === 'CONFIRMED' && (api.user.role === 'DOCTOR' || api.user.role === 'RECEPTIONIST' || api.user.role === 'ADMIN')
                  ? `
                  <button class="btn btn-primary" onclick="app.promptCompleteAppointment('${appt._id}')">🩺 Complete Consultation</button>
                  <button class="btn btn-danger" onclick="app.markNoShow('${appt._id}')">🚫 Mark No-Show</button>
                `
                  : ''
              }
              ${
                appt.status === 'COMPLETED'
                  ? `<button class="btn btn-primary" onclick="app.viewPrescriptionByAppointment('${appt._id}')">💊 View Prescription</button>`
                  : ''
              }
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Appointment Lifecycle Progression</h3>
            </div>
            <div style="display:flex; flex-direction:column; gap:1rem; padding: 0.5rem 0;">
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <div style="width:28px; height:28px; border-radius:50%; background:#22c55e; color:white; display:flex; align-items:center; justify-content:center;">✓</div>
                <div><strong>BOOKED</strong> — Slot secured and scheduled.</div>
              </div>
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <div style="width:28px; height:28px; border-radius:50%; background:${appt.status === 'CONFIRMED' || appt.status === 'COMPLETED' ? '#22c55e' : '#cbd5e1'}; color:white; display:flex; align-items:center; justify-content:center;">${appt.status === 'CONFIRMED' || appt.status === 'COMPLETED' ? '✓' : '2'}</div>
                <div><strong>CONFIRMED</strong> — Doctor confirmed attendance.</div>
              </div>
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <div style="width:28px; height:28px; border-radius:50%; background:${appt.status === 'COMPLETED' ? '#22c55e' : '#cbd5e1'}; color:white; display:flex; align-items:center; justify-content:center;">${appt.status === 'COMPLETED' ? '✓' : '3'}</div>
                <div><strong>COMPLETED</strong> — Consultation completed & prescription ready.</div>
              </div>
              ${
                appt.status === 'CANCELLED'
                  ? `
                <div style="display:flex; align-items:center; gap:0.75rem;">
                  <div style="width:28px; height:28px; border-radius:50%; background:#ef4444; color:white; display:flex; align-items:center; justify-content:center;">✕</div>
                  <div><strong>CANCELLED</strong> — Slot released back to availability.</div>
                </div>
              `
                  : ''
              }
              ${
                appt.status === 'NO_SHOW'
                  ? `
                <div style="display:flex; align-items:center; gap:0.75rem;">
                  <div style="width:28px; height:28px; border-radius:50%; background:#ef4444; color:white; display:flex; align-items:center; justify-content:center;">✕</div>
                  <div><strong>NO_SHOW</strong> — Patient did not attend consultation.</div>
                </div>
              `
                  : ''
              }
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      appContainer.innerHTML = `<div class="empty-state"><p>Error: ${this.escapeHtml(err.message)}</p></div>`;
    }
  }

  // --- Doctor Actions ---
  async confirmAppointment(id) {
    try {
      await api.confirmAppointment(id);
      this.showToast('Appointment confirmed', 'success');
      this.renderDashboardView();
    } catch (err) {
      this.showToast(`Action failed: ${err.message}`, 'error');
    }
  }

  promptCompleteAppointment(id) {
    const modal = document.getElementById('modalContainer');
    modal.innerHTML = `
      <div class="modal-overlay" onclick="if(event.target === this) app.closeModal()">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="card-title">Complete Consultation</h3>
            <button class="modal-close" onclick="app.closeModal()">&times;</button>
          </div>
          <form onsubmit="app.handleCompleteSubmit(event, '${id}')">
            <div class="form-group">
              <label class="form-label">Clinical Encounter Notes</label>
              <textarea id="completeNotes" class="form-control" rows="3" placeholder="Consultation notes, patient response, and diagnosis..." required></textarea>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1rem;">
              <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">Mark Consultation Completed</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  async handleCompleteSubmit(e, id) {
    e.preventDefault();
    try {
      const notes = document.getElementById('completeNotes').value.trim();
      await api.completeAppointment(id, notes);
      this.closeModal();
      this.showToast('Appointment marked COMPLETED', 'success');
      this.renderDashboardView();
    } catch (err) {
      this.showToast(`Completion failed: ${err.message}`, 'error');
    }
  }

  async markNoShow(id) {
    if (!confirm('Are you sure you want to mark this appointment as NO-SHOW?')) return;
    try {
      await api.markNoShow(id, 'Patient failed to appear for scheduled consultation');
      this.showToast('Appointment marked NO_SHOW', 'success');
      this.renderDashboardView();
    } catch (err) {
      this.showToast(`Action failed: ${err.message}`, 'error');
    }
  }

  promptCancelAppointment(id) {
    const reason = prompt('Please enter the cancellation reason:');
    if (!reason) return;
    api
      .cancelAppointment(id, reason)
      .then(() => {
        this.showToast('Appointment cancelled and slot released', 'success');
        this.renderDashboardView();
      })
      .catch((err) => this.showToast(`Cancellation failed: ${err.message}`, 'error'));
  }

  // --- Prescription Modal & Views ---
  openPrescriptionModal(appointmentId) {
    const modal = document.getElementById('modalContainer');
    modal.innerHTML = `
      <div class="modal-overlay" onclick="if(event.target === this) app.closeModal()">
        <div class="modal-content" style="max-width: 680px;">
          <div class="modal-header">
            <h3 class="card-title">Write Medical Prescription</h3>
            <button class="modal-close" onclick="app.closeModal()">&times;</button>
          </div>
          <form onsubmit="app.handlePrescriptionSubmit(event, '${appointmentId}')">
            <div class="form-group">
              <label class="form-label">Clinical Diagnosis</label>
              <input type="text" id="rxDiagnosis" class="form-control" placeholder="e.g., Essential Hypertension, Acute Bronchitis" required />
            </div>

            <div style="margin-bottom: 1rem;">
              <label class="form-label">Medications</label>
              <div id="rxItemsContainer">
                <div class="rx-item-row" style="background:#f8fafc; border:1px solid var(--border); padding:0.75rem; border-radius:var(--radius-sm); margin-bottom:0.5rem;">
                  <div class="grid-cols-2" style="margin-bottom:0.5rem;">
                    <input type="text" class="form-control rx-med-name" placeholder="Medicine name (e.g., Amlodipine)" required />
                    <input type="text" class="form-control rx-med-dosage" placeholder="Dosage (e.g., 5mg)" required />
                  </div>
                  <div class="grid-cols-2">
                    <input type="text" class="form-control rx-med-freq" placeholder="Frequency (e.g., Once daily)" required />
                    <input type="text" class="form-control rx-med-dur" placeholder="Duration (e.g., 30 days)" required />
                  </div>
                  <input type="text" class="form-control rx-med-inst" placeholder="Instructions (e.g., Take after breakfast)" style="margin-top:0.5rem;" />
                </div>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" onclick="app.addPrescriptionItemRow()">+ Add Another Medicine</button>
            </div>

            <div class="form-group">
              <label class="form-label">Lifestyle / Dietary Advice</label>
              <textarea id="rxAdvice" class="form-control" rows="2" placeholder="e.g., Low sodium intake, 30 mins walking daily..."></textarea>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.5rem;">
              <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" id="rxSubmitBtn">Save & Issue Prescription</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  addPrescriptionItemRow() {
    const container = document.getElementById('rxItemsContainer');
    const div = document.createElement('div');
    div.className = 'rx-item-row';
    div.style = 'background:#f8fafc; border:1px solid var(--border); padding:0.75rem; border-radius:var(--radius-sm); margin-bottom:0.5rem;';
    div.innerHTML = `
      <div class="grid-cols-2" style="margin-bottom:0.5rem;">
        <input type="text" class="form-control rx-med-name" placeholder="Medicine name" required />
        <input type="text" class="form-control rx-med-dosage" placeholder="Dosage" required />
      </div>
      <div class="grid-cols-2">
        <input type="text" class="form-control rx-med-freq" placeholder="Frequency" required />
        <input type="text" class="form-control rx-med-dur" placeholder="Duration" required />
      </div>
      <input type="text" class="form-control rx-med-inst" placeholder="Instructions" style="margin-top:0.5rem;" />
    `;
    container.appendChild(div);
  }

  async handlePrescriptionSubmit(e, appointmentId) {
    e.preventDefault();
    const btn = document.getElementById('rxSubmitBtn');
    btn.disabled = true;

    try {
      const diagnosis = document.getElementById('rxDiagnosis').value.trim();
      const advice = document.getElementById('rxAdvice').value.trim();

      const itemRows = document.querySelectorAll('.rx-item-row');
      const items = Array.from(itemRows).map((row) => ({
        medicine: row.querySelector('.rx-med-name').value.trim(),
        dosage: row.querySelector('.rx-med-dosage').value.trim(),
        frequency: row.querySelector('.rx-med-freq').value.trim(),
        duration: row.querySelector('.rx-med-dur').value.trim(),
        instructions: row.querySelector('.rx-med-inst').value.trim(),
      }));

      await api.createPrescription({
        appointmentId,
        diagnosis,
        items,
        generalAdvice: advice,
      });

      this.closeModal();
      this.showToast('Prescription issued successfully and patient notified!', 'success');
      this.renderDashboardView();
    } catch (err) {
      this.showToast(`Failed to create prescription: ${err.message}`, 'error');
      btn.disabled = false;
    }
  }

  async viewPrescriptionByAppointment(appointmentId) {
    try {
      const rx = await api.getPrescriptionByAppointment(appointmentId);
      this.showPrescriptionCardModal(rx);
    } catch (err) {
      this.showToast(`No prescription found: ${err.message}`, 'error');
    }
  }

  showPrescriptionCardModal(rx) {
    const modal = document.getElementById('modalContainer');
    modal.innerHTML = `
      <div class="modal-overlay" onclick="if(event.target === this) app.closeModal()">
        <div class="modal-content" style="max-width: 650px;">
          <div class="modal-header">
            <div>
              <h2 style="font-size:1.3rem; font-weight:700; color:var(--primary);">MediFlow Clinical Prescription</h2>
              <small style="color:var(--text-muted);">Rx ID: ${rx._id}</small>
            </div>
            <button class="modal-close" onclick="app.closeModal()">&times;</button>
          </div>

          <div style="background:#f8fafc; border:1px solid var(--border); padding:1rem; border-radius:var(--radius-sm); margin-bottom:1rem;">
            <p><strong>Diagnosis:</strong> ${this.escapeHtml(rx.diagnosis || 'Clinical Consultation')}</p>
            <p><strong>Doctor:</strong> Dr. ${this.escapeHtml(rx.doctorId?.userId?.name || 'Physician')}</p>
            <p><strong>Date:</strong> ${new Date(rx.createdAt).toLocaleDateString()}</p>
          </div>

          <h4 style="margin-bottom:0.5rem;">Prescribed Medications</h4>
          <table class="data-table" style="margin-bottom:1rem;">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              ${(rx.items || [])
                .map(
                  (item) => `
                <tr>
                  <td><strong>${this.escapeHtml(item.medicine)}</strong><br/><small style="color:var(--text-muted);">${this.escapeHtml(item.instructions || '')}</small></td>
                  <td>${this.escapeHtml(item.dosage)}</td>
                  <td>${this.escapeHtml(item.frequency)}</td>
                  <td>${this.escapeHtml(item.duration)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          ${
            rx.generalAdvice
              ? `
            <div style="background:#eff6ff; border-left:4px solid var(--primary); padding:0.75rem; border-radius:var(--radius-sm); margin-bottom:1rem; font-size:0.9rem;">
              <strong>Doctor Advice:</strong> ${this.escapeHtml(rx.generalAdvice)}
            </div>
          `
              : ''
          }

          <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
            <button class="btn btn-secondary" onclick="window.print()">🖨️ Print Rx</button>
            <button class="btn btn-primary" onclick="app.closeModal()">Close</button>
          </div>
        </div>
      </div>
    `;
  }

  async renderPrescriptionsView() {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = '<div class="spinner"></div>';

    try {
      const prescriptions = await api.getPrescriptions();

      appContainer.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
          <h1 style="font-size: 1.6rem; font-weight: 700;">Prescription Records</h1>
          <p style="color: var(--text-muted);">Review medications, dosage frequencies, and doctor clinical directives.</p>
        </div>

        <div class="card">
          ${
            prescriptions.length === 0
              ? `<div class="empty-state"><div class="empty-icon">💊</div><p>No prescriptions recorded.</p></div>`
              : `
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Diagnosis</th>
                    <th>Doctor</th>
                    <th>Medicines</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${prescriptions
                    .map(
                      (rx) => `
                    <tr>
                      <td>${new Date(rx.createdAt).toLocaleDateString()}</td>
                      <td><strong>${this.escapeHtml(rx.diagnosis || 'Clinical Diagnosis')}</strong></td>
                      <td>Dr. ${this.escapeHtml(rx.doctorId?.userId?.name || 'Physician')}</td>
                      <td>${(rx.items || []).map((i) => this.escapeHtml(i.medicine)).join(', ')}</td>
                      <td>
                        <button class="btn btn-secondary btn-sm" onclick='app.showPrescriptionCardModal(${JSON.stringify(rx).replace(/'/g, "&apos;")})'>View Details</button>
                      </td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          `
          }
        </div>
      `;
    } catch (err) {
      appContainer.innerHTML = `<div class="empty-state"><p>Error: ${this.escapeHtml(err.message)}</p></div>`;
    }
  }

  // --- Notifications View ---
  async renderNotificationsView() {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = '<div class="spinner"></div>';

    try {
      const notifications = await api.getNotifications();

      appContainer.innerHTML = `
        <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-size: 1.6rem; font-weight: 700;">Notifications & Alerts</h1>
            <p style="color: var(--text-muted);">Real-time system events, appointment updates, and billing receipts.</p>
          </div>
          ${
            notifications.length > 0
              ? `<button class="btn btn-secondary btn-sm" onclick="app.markAllNotificationsRead()">Mark All Read</button>`
              : ''
          }
        </div>

        <div class="card">
          ${
            notifications.length === 0
              ? `<div class="empty-state"><div class="empty-icon">🔔</div><p>No notifications at this time.</p></div>`
              : `
            <div style="display:flex; flex-direction:column; gap:0.75rem;">
              ${notifications
                .map(
                  (n) => `
                <div style="padding:1rem; border-radius:var(--radius-sm); border:1px solid var(--border); background:${n.isRead ? 'white' : '#f0fdf4'}; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
                      <strong>${this.escapeHtml(n.title)}</strong>
                      <span class="badge" style="font-size:0.65rem;">${n.type}</span>
                    </div>
                    <p style="font-size:0.9rem; color:var(--text-main); margin-bottom:0.25rem;">${this.escapeHtml(n.message)}</p>
                    <small style="color:var(--text-muted);">${new Date(n.createdAt).toLocaleString()}</small>
                  </div>
                  <div>
                    ${
                      !n.isRead
                        ? `<button class="btn btn-secondary btn-sm" onclick="app.markNotificationRead('${n._id}')">✓ Mark Read</button>`
                        : '<span style="color:#22c55e; font-size:0.85rem;">Read</span>'
                    }
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          `
          }
        </div>
      `;
    } catch (err) {
      appContainer.innerHTML = `<div class="empty-state"><p>Error: ${this.escapeHtml(err.message)}</p></div>`;
    }
  }

  async markNotificationRead(id) {
    await api.markNotificationRead(id);
    this.unreadNotifications = Math.max(0, this.unreadNotifications - 1);
    this.renderNotificationsView();
    this.renderNav();
  }

  async markAllNotificationsRead() {
    await api.markAllNotificationsRead();
    this.unreadNotifications = 0;
    this.renderNotificationsView();
    this.renderNav();
  }

  // --- Billing View ---
  async renderBillingView() {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = '<div class="spinner"></div>';

    const role = api.user?.role || 'PATIENT';

    try {
      const invoices = role === 'PATIENT' ? await api.getMyInvoices() : await api.getAllInvoices();

      appContainer.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
          <h1 style="font-size: 1.6rem; font-weight: 700;">Billing & Invoices</h1>
          <p style="color: var(--text-muted);">Consultation fees, diagnostics breakdown, and simulated online settlement.</p>
        </div>

        <div class="card">
          ${
            invoices.length === 0
              ? `<div class="empty-state"><div class="empty-icon">💳</div><p>No invoices recorded.</p></div>`
              : `
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Patient / Doctor</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoices
                    .map(
                      (inv) => `
                    <tr>
                      <td><strong>${inv.invoiceNumber}</strong></td>
                      <td>${new Date(inv.createdAt).toLocaleDateString()}</td>
                      <td>
                        ${inv.patientId?.userId?.name ? `Patient: ${this.escapeHtml(inv.patientId.userId.name)}<br/>` : ''}
                        <small style="color:var(--text-muted);">Dr. ${this.escapeHtml(inv.doctorId?.userId?.name || 'Physician')}</small>
                      </td>
                      <td><strong>₹${inv.total}</strong></td>
                      <td><span class="badge badge-${inv.paymentStatus}">${inv.paymentStatus}</span></td>
                      <td>
                        ${
                          inv.paymentStatus === 'PENDING'
                            ? `<button class="btn btn-success btn-sm" onclick="app.payInvoice('${inv._id}')">💳 Pay Now (Simulate)</button>`
                            : `<span style="color:#059669; font-weight:600; font-size:0.85rem;">✓ Paid (${inv.paymentMethod || 'Settled'})</span>`
                        }
                      </td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          `
          }
        </div>
      `;
    } catch (err) {
      appContainer.innerHTML = `<div class="empty-state"><p>Error: ${this.escapeHtml(err.message)}</p></div>`;
    }
  }

  async payInvoice(id) {
    if (!confirm('Simulate online payment of this invoice now?')) return;
    try {
      await api.payInvoice(id, 'ONLINE_SIMULATION');
      this.showToast('Payment successful! Invoice marked PAID.', 'success');
      this.renderBillingView();
    } catch (err) {
      this.showToast(`Payment failed: ${err.message}`, 'error');
    }
  }

  // --- Admin Dashboard & AI Risk Reports ---
  async renderAdminView() {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = '<div class="spinner"></div>';

    try {
      const [summaryData, appointments] = await Promise.all([api.getDashboardSummary(), api.getAppointments()]);

      const s = summaryData.summary;
      const statusDist = summaryData.appointmentStatusDistribution;

      appContainer.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
          <h1 style="font-size: 1.6rem; font-weight: 700;">Executive Admin & AI Analytics</h1>
          <p style="color: var(--text-muted);">Hospital operational metrics, department distributions, and appointment no-show risk prediction.</p>
        </div>

        <div class="grid-cols-4" style="margin-bottom: 1.5rem;">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div>
              <div class="stat-value">${s.totalPatients}</div>
              <div class="stat-label">Total Patients</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🩺</div>
            <div>
              <div class="stat-value">${s.totalDoctors}</div>
              <div class="stat-label">Active Doctors</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div>
              <div class="stat-value">${s.totalAppointments}</div>
              <div class="stat-label">Total Appointments</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">💵</div>
            <div>
              <div class="stat-value">₹${s.totalRevenue}</div>
              <div class="stat-label">Settled Revenue</div>
            </div>
          </div>
        </div>

        <div class="grid-cols-2" style="margin-bottom: 1.5rem;">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Appointment Status Distribution</h3>
            </div>
            <table class="data-table">
              <tr><td><strong>BOOKED (Upcoming)</strong></td><td><span class="badge badge-BOOKED">${statusDist.BOOKED}</span></td></tr>
              <tr><td><strong>CONFIRMED (Doctor Approved)</strong></td><td><span class="badge badge-CONFIRMED">${statusDist.CONFIRMED}</span></td></tr>
              <tr><td><strong>COMPLETED (Finished Consultations)</strong></td><td><span class="badge badge-COMPLETED">${statusDist.COMPLETED}</span></td></tr>
              <tr><td><strong>CANCELLED</strong></td><td><span class="badge badge-CANCELLED">${statusDist.CANCELLED}</span></td></tr>
              <tr><td><strong>NO_SHOW (Missed Visits)</strong></td><td><span class="badge badge-NO_SHOW">${statusDist.NO_SHOW}</span></td></tr>
            </table>
          </div>

          <div class="card">
            <div class="card-header">
              <h3 class="card-title">AI Appointment No-Show Risk Engine</h3>
            </div>
            <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:1rem;">
              The operational analytics model calculates the likelihood of scheduled patients failing to attend based on booking lead time, past cancellation ratios, and shift times.
            </p>
            <div style="background:#eff6ff; border-left:4px solid var(--primary); padding:0.75rem; font-size:0.85rem; border-radius:var(--radius-sm); margin-bottom:1rem;">
              <strong>Disclaimer:</strong> Operational analytics only. This tool aids staff in resource management and does NOT provide medical diagnostic decision support.
            </div>
            <p style="font-size:0.85rem; color:var(--text-muted);">
              Select any appointment in the table below to trigger the predictive assessment algorithm.
            </p>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Appointment Risk Inspector</h3>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th>AI Risk Action</th>
                </tr>
              </thead>
              <tbody>
                ${appointments
                  .slice(0, 15)
                  .map(
                    (a) => `
                  <tr>
                    <td>${a.date} (${a.startTime})</td>
                    <td><strong>${this.escapeHtml(a.patientId?.userId?.name || 'Patient')}</strong></td>
                    <td>Dr. ${this.escapeHtml(a.doctorId?.userId?.name || 'Doctor')}</td>
                    <td><span class="badge badge-${a.status}">${a.status}</span></td>
                    <td>
                      <button class="btn btn-secondary btn-sm" onclick="app.showNoShowRiskModal('${a._id}')">
                        🧠 Evaluate Risk
                      </button>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (err) {
      appContainer.innerHTML = `<div class="empty-state"><p>Error: ${this.escapeHtml(err.message)}</p></div>`;
    }
  }

  async showNoShowRiskModal(appointmentId) {
    const modal = document.getElementById('modalContainer');
    modal.innerHTML = `
      <div class="modal-overlay" onclick="if(event.target === this) app.closeModal()">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="card-title">AI No-Show Risk Analysis</h3>
            <button class="modal-close" onclick="app.closeModal()">&times;</button>
          </div>
          <div class="spinner"></div>
        </div>
      </div>
    `;

    try {
      const risk = await api.getNoShowRisk(appointmentId);

      modal.innerHTML = `
        <div class="modal-overlay" onclick="if(event.target === this) app.closeModal()">
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="card-title">AI No-Show Risk Assessment</h3>
              <button class="modal-close" onclick="app.closeModal()">&times;</button>
            </div>

            <div style="text-align:center; padding:1.25rem 0; border-bottom:1px solid var(--border); margin-bottom:1.25rem;">
              <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.25rem;">Assessed Risk Level</div>
              <span class="badge badge-risk-${risk.riskLevel}" style="font-size:1.1rem; padding:0.4rem 1.25rem;">
                ${risk.riskLevel} RISK (${risk.riskScore}/100)
              </span>
            </div>

            <div style="margin-bottom:1rem;">
              <p style="font-size:0.9rem; margin-bottom:0.25rem;"><strong>Patient:</strong> ${this.escapeHtml(risk.patientName)}</p>
              <p style="font-size:0.9rem; margin-bottom:0.25rem;"><strong>Scheduled Date:</strong> ${risk.date} at ${risk.startTime}</p>
              <p style="font-size:0.9rem; margin-bottom:0.25rem;"><strong>Booking Lead Time:</strong> ${risk.leadTimeDays} days in advance</p>
            </div>

            <h4 style="font-size:0.95rem; margin-bottom:0.5rem;">Weighted Contributing Factors:</h4>
            <ul style="font-size:0.9rem; color:var(--text-main); margin-left:1.25rem; margin-bottom:1.25rem;">
              ${risk.factors.map((f) => `<li style="margin-bottom:0.35rem;">${this.escapeHtml(f)}</li>`).join('')}
            </ul>

            <div style="background:#fef2f2; border-left:4px solid #ef4444; padding:0.75rem; border-radius:var(--radius-sm); font-size:0.8rem; color:#991b1b; margin-bottom:1.25rem;">
              ${risk.disclaimer}
            </div>

            <div style="display:flex; justify-content:flex-end;">
              <button class="btn btn-primary" onclick="app.closeModal()">Close</button>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      modal.innerHTML = `
        <div class="modal-overlay" onclick="if(event.target === this) app.closeModal()">
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="card-title">Error</h3>
              <button class="modal-close" onclick="app.closeModal()">&times;</button>
            </div>
            <p style="color:#dc2626;">${this.escapeHtml(err.message)}</p>
            <div style="display:flex; justify-content:flex-end; margin-top:1rem;">
              <button class="btn btn-secondary" onclick="app.closeModal()">Close</button>
            </div>
          </div>
        </div>
      `;
    }
  }

  // --- Utility Methods ---
  closeModal() {
    document.getElementById('modalContainer').innerHTML = '';
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️'}</span>
      <span>${this.escapeHtml(message)}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

const app = new App();
window.app = app;

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
