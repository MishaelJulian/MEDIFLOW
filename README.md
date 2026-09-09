# MediFlow — Hospital & Outpatient Appointment Management System
**Christ University • 5th Semester • CIA-3 Project Development (Topic: P02)**
*L&T EduTech Project Evaluation Baseline*

---

## 1. Team Details

| S.No | Student Name | Roll No. | Department | Section | Domain Ownership |
|---|---|---|---|---|---|
| 1 | Mishael Julian (Lead) | 2240101 | Computer Science | A | Sprint 1: M01–M04 (Auth, Doctors, Availability, Booking Engine) |
| 2 | Nevan Fernandes | 2240102 | Computer Science | A | Sprint 2: M05–M09 (Workflow, Prescriptions, Medical History, Directory, Notifications) |
| 3 | Mervin Paul | 2240103 | Computer Science | A | Sprint 3: M10–M13 (Billing & Invoices, Search, Admin Controls, Reports & Dashboards) |
| 4 | Lijo Joseph | 2240104 | Computer Science | A | Integration: M14–M16 (Test Suites, AI No-Show Analytics, Frontend, Postman, QA) |

- **Project Code & Title:** `P02` — Hospital / Outpatient Appointment & Queue Management System (MediFlow)
- **Course Name:** Web Application Development / Enterprise Application Engineering
- **Semester & Batch:** 5th Semester • 2026 Batch
- **Repository URL:** `https://github.com/MishaelJulian/MEDIFLOW`

---

## 2. Problem Statement & Project Overview

Modern outpatient clinics and hospitals frequently face bottlenecks such as scheduling overlaps, chaotic waiting queues, uncoordinated patient record access, missed follow-ups, and sudden appointment no-shows. 

**MediFlow** is a full-stack, enterprise-grade healthcare management application designed to centralize and streamline the outpatient lifecycle. Built on a modular MVC architecture using **Node.js, Express.js, and MongoDB Atlas (Mongoose ODM)** with a responsive web portal, MediFlow guarantees:
- **Conflict-Free Scheduling:** High-concurrency slot validation engine preventing doctor double-booking.
- **Strict Role-Based Access Control (RBAC):** Distinct permission boundaries separating Patients, Doctors, Receptionists, and Administrators.
- **Lifecycle Clinical Workflows:** State-machine enforced transitions (`BOOKED` $\rightarrow$ `CONFIRMED` $\rightarrow$ `COMPLETED` / `NO_SHOW` / `CANCELLED`) with digital prescription issuance and automated itemized billing in Indian Rupees (`₹`).
- **Operational AI/Analytics:** Heuristic machine-learning engine estimating Appointment No-Show risks to optimize hospital staff allocation.

---

## 3. Technology Stack

- **Backend Framework:** Node.js (v18+) with Express.js REST API
- **Database:** MongoDB Atlas (Cloud) / Local MongoDB with Mongoose ODM
- **Authentication & Security:** JSON Web Tokens (JWT), `bcryptjs` password hashing, HTTP Bearer Authorization, CORS, Helmet, and rate limiting
- **Validation:** Express server-side request validation (`express-validator`)
- **Testing Framework:** Jest + Supertest (14 test suites, 99 automated test cases with 100% pass rate)
- **Frontend / Demo Portal:** Modern Vanilla JS + CSS3 Responsive Single-Page Application (SPA) with live fast-switching demo bar
- **API Documentation & QA:** Postman Collection v2.1 with full environment variable sets

---

## 4. Implemented Modules Registry (100% Complete)

| # | Official Module Name | Specification & Implementation Details | Status |
|---|---|---|---|
| **1** | **Patient Registration & Authentication** | Secure sign-up, login, profile management, and medical notes (`/api/auth`, `/api/patients`). | `DEMO_READY` |
| **2** | **Doctor Profile & Department Management** | Admin-driven department lifecycle and doctor specialization assignment (`/api/doctors`, `/api/departments`). | `DEMO_READY` |
| **3** | **Doctor Availability Slots** | Time-interval availability definitions (morning/afternoon shifts) across 7-day rolling windows (`/api/availability`). | `DEMO_READY` |
| **4** | **Appointment Booking Engine** | Patient booking engine with slot interval checks and atomic `slotKey` concurrency protection (`/api/appointments`). | `DEMO_READY` |
| **5** | **Appointment Status Workflow** | State machine enforcing `BOOKED` $\rightarrow$ `CONFIRMED` $\rightarrow$ `COMPLETED`, `CANCELLED`, or `NO_SHOW` (`/api/appointments/:id/status`). | `DEMO_READY` |
| **6** | **Digital Prescription Module** | Doctors issue structured prescriptions (medicines, dosages, instructions, advice) linked to appointments (`/api/prescriptions`). | `DEMO_READY` |
| **7** | **Patient Medical History** | Chronological longitudinal health timeline of past visits, diagnoses, and treatments (`/api/medical-history`). | `DEMO_READY` |
| **8** | **Department & Specialization Directory** | Public listing of medical departments, active physicians, qualifications, and consultation fees in `₹` (`/api/directory`). | `DEMO_READY` |
| **9** | **Notifications & Reminders** | Automated event-driven notifications for appointments, prescriptions, and billing receipts (`/api/notifications`). | `DEMO_READY` |
| **10** | **Billing Summary per Visit** | Itemized invoice generation with automatic consultation fee calculation, discounts, taxes, and payment simulation (`/api/billing`). | `DEMO_READY` |
| **11** | **Search Doctors by Specialization** | Multi-attribute search across doctor name, department, specialization, experience, and shift schedules (`/api/directory/search`). | `DEMO_READY` |
| **12** | **Admin Dashboard & Reports** | Aggregated hospital metrics: daily appointments, department load, doctor workload, and settled revenue in `₹` (`/api/analytics/reports`). | `DEMO_READY` |
| **13** | **Role-Based Access Control (RBAC)** | Enterprise route guards enforcing strict authorization policies for `PATIENT`, `DOCTOR`, `RECEPTIONIST`, and `ADMIN`. | `DEMO_READY` |
| **Bonus**| **AI No-Show Risk Engine** | Heuristic prediction model calculating patient attendance probability based on lead time and history (`/api/analytics/no-show-risk/:id`). | `DEMO_READY` |

---

## 5. Database Schema Design (Mongoose & MongoDB)

### Data Modeling: Embedding vs. Referencing Rationale
As mandated by MongoDB architectural best practices:
- **Referenced Relations (`ObjectId`):** Used for large, independently queried, or high-growth entities to avoid document bloat:
  - `User` $\leftrightarrow$ `Patient` / `Doctor` (1-to-1 reference)
  - `Department` $\leftrightarrow$ `Doctor` (1-to-many reference)
  - `Doctor` + `Patient` $\leftrightarrow$ `Appointment` (many-to-many reference)
  - `Appointment` $\leftrightarrow$ `Prescription` / `Invoice` (1-to-1 reference)
- **Embedded Subdocuments:** Used for small, tightly-bound data that is always read together with its parent and rarely modified independently:
  - `Prescription.items`: `[{ medicine, dosage, frequency, duration, instructions }]`
  - `Invoice.lineItems`: `[{ description, amount, quantity }]`
  - `Patient.address`: `{ street, city, state, zipCode }`

### Performance & Query Optimization (MongoDB Indexes)

| Collection | Indexed Fields | Index Type | Architectural Purpose |
|---|---|---|---|
| `users` | `{ email: 1 }` | Unique Index | Enforces unique email constraint and provides $O(1)$ login lookup. |
| `patients` | `{ userId: 1 }` | Unique Index | Speeds up patient profile lookups and identity mapping. |
| `doctors` | `{ userId: 1 }`, `{ departmentId: 1, isActive: 1 }` | Compound Index | Optimizes department-based doctor filtering and search. |
| `departments` | `{ name: 1 }` | Unique Index | Fast name-based department lookups and deduplication. |
| `doctoravailabilities` | `{ doctorId: 1, date: 1, isActive: 1 }` | Compound Index | Rapidly fetches published shifts for booking engines. |
| `appointments` | `{ slotKey: 1 }` | Sparse Unique Index | **Concurrency Shield:** Physically blocks double-booking at DB level. |
| `appointments` | `{ doctorId: 1, date: 1, status: 1 }` | Compound Index | Speeds up doctor daily queue queries. |
| `appointments` | `{ patientId: 1, date: 1, status: 1 }` | Compound Index | Speeds up patient historical records queries. |
| `invoices` | `{ appointmentId: 1 }`, `{ patientId: 1, paymentStatus: 1 }` | Compound Index | Accelerates patient billing overview and payment tracking. |
| `notifications` | `{ recipient: 1, isRead: 1, createdAt: -1 }` | Compound Index | Powers high-speed polling for unread user notification bells. |

---

## 6. REST API Endpoint Reference

### Authentication & Profiles (`/api/auth`, `/api/patients`)
- `POST /api/auth/register` — Register a new patient account with profile
- `POST /api/auth/login` — Authenticate user and receive JWT token
- `GET /api/auth/me` — Get currently authenticated user profile
- `GET /api/patients/me` — Get patient clinical demographics
- `PUT /api/patients/me` — Update patient medical notes and address

### Doctors, Departments & Availability (`/api/doctors`, `/api/departments`, `/api/availability`)
- `GET /api/departments` — List all active medical departments
- `POST /api/departments` — Create new department *(Admin only)*
- `GET /api/doctors` — List and filter accredited doctors
- `GET /api/availability/doctor/:doctorId` — View published shifts for a doctor
- `POST /api/availability` — Publish new shift availability slots *(Doctor/Admin)*

### Appointment Booking & Lifecycle Workflow (`/api/appointments`)
- `POST /api/appointments` — Book an appointment slot with double-booking check
- `GET /api/appointments` — List appointments (Role-scoped)
- `GET /api/appointments/:id` — View appointment details and lifecycle stage
- `PUT /api/appointments/:id/status` — State-machine transition (`CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`)
- `PUT /api/appointments/:id/cancel` — Cancel appointment and release slot

### Clinical Prescriptions & Medical History (`/api/prescriptions`, `/api/medical-history`)
- `POST /api/prescriptions` — Issue digital prescription with medications *(Doctor only)*
- `GET /api/prescriptions/appointment/:appointmentId` — Retrieve prescription for an encounter
- `GET /api/medical-history` — Longitudinal clinical history timeline

### Billing & Invoicing (`/api/billing`)
- `GET /api/billing/my-invoices` — Patient retrieves their itemized bills
- `GET /api/billing` — Receptionist/Admin lists all hospital invoices
- `GET /api/billing/:id` — Get single invoice breakdown
- `POST /api/billing/:id/pay` — Simulate online payment settlement (`ONLINE_SIMULATION`)

### Search, Admin Oversight & AI Analytics (`/api/directory`, `/api/admin`, `/api/analytics`)
- `GET /api/directory/search` — Search specialists by keyword, department, or date
- `GET /api/admin/users` — Manage hospital user accounts and role assignments *(Admin only)*
- `GET /api/analytics/dashboard-summary` — Aggregated hospital KPI cards
- `GET /api/analytics/reports` — Date-range operational report summaries
- `GET /api/analytics/no-show-risk/:appointmentId` — AI attendance risk engine evaluation

---

## 7. Standardized API Response Conventions

Every endpoint conforms to a predictable JSON envelope:

#### Success Response (HTTP 200 / 201)
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "_id": "66dec09e1234567890abcdef",
    "status": "BOOKED",
    "date": "2026-09-10",
    "startTime": "10:00",
    "endTime": "10:30"
  }
}
```

#### Error Response (HTTP 400 / 401 / 403 / 404 / 409 / 500)
```json
{
  "success": false,
  "message": "Doctor already has a booked appointment between 10:00 and 10:30 on 2026-09-10",
  "errorCode": "SLOT_CONFLICT"
}
```

---

## 8. Local Setup & Execution Guide

### Prerequisites
- Node.js v18+ installed
- MongoDB Atlas cluster or local MongoDB server running on port `27017`

### Step 1: Clone & Install Dependencies
```bash
git clone https://github.com/MishaelJulian/MEDIFLOW.git
cd MEDIFLOW
npm install
```

### Step 2: Environment Configuration
Create a `.env` file in the root directory (or copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/mediflow?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_mediflow_2026_production_grade
JWT_EXPIRE=7d
```

### Step 3: Seed Deterministic Demo Data
Populates 12 specialist doctors across 6 departments, availability schedules for the next 7 days, demo appointments, prescriptions, notifications, and invoices:
```bash
npm run seed
```

### Step 4: Run Dev Server & Access Application
```bash
npm run dev
```
Open your browser and navigate to: **`http://localhost:5000`**

---

## 9. Demo Accounts (Fast-Switcher Enabled)

The web UI includes a **1-Click Fast Switcher bar** at the top for instant evaluation without manual typing:

| Role | Email | Password | Pre-loaded Evaluation Dataset |
|---|---|---|---|
| **System Admin** | `admin@mediflow.com` | `Admin@123` | Executive KPI overview, user management, hospital reports, AI risk engine |
| **Central Receptionist**| `receptionist@mediflow.com` | `Recep@123` | Hospital appointment queue, check-ins, status transitions, billing management |
| **Doctor (Cardiology)** | `dr.smith@mediflow.com` | `Doctor@123` | Dr. Sarah Smith queue, clinical notes, digital prescription issuer |
| **Doctor (Neurology)** | `dr.jones@mediflow.com` | `Doctor@123` | Dr. David Jones clinical queue and shift management |
| **Patient 1 (Active)** | `john.doe@example.com` | `Patient@123` | Completed Cardiology consultation, active prescription, paid ₹1,200 invoice |
| **Patient 2 (Upcoming)**| `jane.smith@example.com` | `Patient@123` | Upcoming Neurology appointment (`BOOKED`), pending ₹900 invoice |

---

## 10. Automated Testing & QA Verification

MediFlow includes 14 comprehensive test suites executed via Jest & Supertest:
```bash
npm test
```

### Test Suite Output:
```text
PASS tests/billing.test.js (14/14 tests)
PASS tests/prescription.test.js (7/7 tests)
PASS tests/analytics.test.js (10/10 tests)
PASS tests/admin.test.js (8/8 tests)
PASS tests/workflow.test.js (8/8 tests)
PASS tests/appointment.test.js (12/12 tests)
PASS tests/directory.test.js (6/6 tests)
PASS tests/medicalHistory.test.js (4/4 tests)
PASS tests/notification.test.js (5/5 tests)
PASS tests/integration.test.js (8/8 tests)
PASS tests/auth.test.js (8/8 tests)
PASS tests/department.test.js (5/5 tests)
PASS tests/availability.test.js (6/6 tests)
PASS tests/doctor.test.js (6/6 tests)

Test Suites: 14 passed, 14 total
Tests:       99 passed, 99 total
Snapshots:   0 total
Time:        ~100 s
```

---

## 11. Postman Collection

- **Collection File:** [postman/MediFlow.postman_collection.json](file:///c:/Users/misha/OneDrive/Desktop/UNIVERSITY/LnT/MEDIFLOW/postman/MediFlow.postman_collection.json)
- **Environment File:** [postman/MediFlow.postman_environment.json](file:///c:/Users/misha/OneDrive/Desktop/UNIVERSITY/LnT/MEDIFLOW/postman/MediFlow.postman_environment.json)

**How to test with Postman:**
1. Open Postman $\rightarrow$ Click **Import** $\rightarrow$ Select both JSON files from `/postman`.
2. Select the **MediFlow Environment**.
3. Run the **Auth -> Login as Patient / Doctor / Admin** requests (automatically stores `{{token}}`).
4. Execute any request in sequence across all 13 modules!
