# Member 3 — Search, Admin Controls, Reports & Dashboards

## 1. Scope & Ownership

Member 3 owns the administrative, intelligence, and discovery subsystems of the MediFlow platform:
- **Module 11 (M11)**: Authorized Search & Filtering
- **Module 12 (M12)**: Admin Controls & User Management
- **Module 13 (M13)**: Operational Reports & Role-Specific Dashboards

---

## 2. Module 11: Authorized Search

### Implementation
- **Services**: `src/services/directory.service.js`, `src/services/admin.service.js`
- **Capabilities**:
  - **Doctor Search**: Multi-field regex and filter queries across doctor name, specialization, department ID, and active status, coupled with dynamic doctor availability slot lookups.
  - **Department Search**: Directory listing with aggregated active doctor counts and description metadata.
  - **Patient Search**: Search across patient names, emails, phones, and blood groups.
  - **Security & Privacy Boundary**: Strictly protected for `ADMIN`, `RECEPTIONIST`, and `DOCTOR`. Any access attempt by a `PATIENT` role returns `403 Forbidden` to guarantee patient privacy.

---

## 3. Module 12: Admin Controls & User Management

### Implementation
- **Router**: `src/routes/admin.routes.js`
- **Controller**: `src/controllers/admin.controller.js`
- **Service**: `src/services/admin.service.js`
- **Validators**: `src/validators/admin.validators.js`
- **Protected Endpoints**:
  - `GET /api/v1/admin/users`: List all system users with search, role filters, and status filters.
  - `GET /api/v1/admin/users/:id`: Retrieve user details along with associated doctor/patient profiles.
  - `PATCH /api/v1/admin/users/:id/status`: Activate or deactivate user accounts (with safeguards preventing self-deactivation by the administrator).
  - `PATCH /api/v1/admin/users/:id/role`: Reassign roles (`PATIENT`, `DOCTOR`, `RECEPTIONIST`, `ADMIN`).
  - `GET /api/v1/admin/appointments`: Full system-wide overview of all appointments.
  - `PATCH /api/v1/admin/appointments/:id/override`: Administrative appointment status overrides with audit notes and automated notifications.

---

## 4. Module 13: Operational Reports & Role-Specific Dashboards

### Implementation
- **Service**: `src/services/analytics.service.js`
- **Endpoints**:
  - `GET /api/v1/analytics/dashboard-summary` / `/admin-dashboard`:
    - Total counts: patients, doctors, departments, appointments, today's schedule.
    - Status distribution: Booked, Confirmed, Completed, Cancelled, No-Show.
    - Financial aggregates: Paid revenue vs Pending revenue.
  - `GET /api/v1/analytics/reports`:
    - Date-range filtered aggregations.
    - Appointments per day timeline.
    - Appointments by department distribution.
    - Doctor workload and completed consultation metrics.
    - Financial totals: Paid, Pending, and Refunded.
  - `GET /api/v1/analytics/doctor-dashboard`:
    - Today's appointment agenda with patient details.
    - Upcoming consultations.
    - Completed visit counters.
  - `GET /api/v1/analytics/patient-dashboard`:
    - Next upcoming appointment.
    - Recent prescriptions.
    - Invoice summary (outstanding balance and unpaid count).
    - Unread notification counter.

---

## 5. Verification & Test Suites

- `tests/admin.test.js` (100% Pass):
  - User query filtering & RBAC authorization
  - Account deactivation & self-deactivation protection
  - User role assignment
  - Appointment oversight and status overrides
- `tests/analytics.test.js` (100% Pass):
  - No-show risk scoring
  - Hospital operational dashboard summary
  - Admin operational reports generation
  - Doctor-specific dashboard
  - Patient-specific dashboard
- `tests/directory.test.js` (100% Pass):
  - Doctor search with specialization, department, and text filters
  - Department doctor count aggregations
  - Privacy enforcement on patient directory (patients blocked with 403)
