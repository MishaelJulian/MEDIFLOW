# MediFlow

MediFlow is a role-based healthcare management application built around patient, doctor, appointment, clinical, billing, notification, search, administrative, and reporting workflows.

## Documentation

Start with:

1. `00_MASTER_PROJECT_CONSTITUTION.md`
2. `01_PROJECT_VISION_AND_SCOPE.md`
3. `02_REQUIREMENTS_AND_MODULE_REGISTRY.md`
4. `03_SYSTEM_ARCHITECTURE.md`
5. `04_DATABASE_SCHEMA.md`
6. `05_AUTH_RBAC_SECURITY.md`
7. `06_API_CONTRACT.md`
8. `07_BUSINESS_RULES.md`
9. `08_TESTING_AND_QA.md`
10. `09_TEAM_GIT_INTEGRATION.md`
11. `10_DEMO_AND_EVALUATION.md`

Member-specific specifications are in:
- `mishael/` (Member 1)
- `nevan/` (Member 2)
- `mervin/` (Member 3)
- `lijo/` (Member 4)

## Technology

Baseline:
- Node.js
- Express.js
- MongoDB
- Mongoose
- REST API
- web frontend
- JWT authentication
- bcrypt/bcryptjs password hashing

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env`.
3. Set local MongoDB URI and other required configuration.
4. Run tests: `npm test`
5. Seed demo data: `npm run seed`
6. Start the backend: `npm run dev`

Never commit `.env`.

## Development

Read the master constitution before making architectural changes.

Each team member owns specific domains. Shared schema/API changes must be coordinated.

## Testing

Run `npm test` to execute all automated test suites. The project includes both positive and negative tests, covering authentication, RBAC, appointment conflicts, availability windows, and business rules.

## Demo

The target demonstration is:

Patient login → doctor discovery → availability → appointment booking → conflict rejection → doctor workflow → prescription → billing/notification → admin reporting.

## Team Ownership

- Mishael (Member 1) — Platform foundation, Auth, Doctor/Dept, Availability, Appointment Booking Engine
- Nevan (Member 2) — Clinical workflows (Prescriptions, Medical history, Directory, Notifications)
- Mervin (Member 3) — Billing/Invoices, Search, Admin controls, Reports & Dashboards
- Lijo (Member 4) — Integration, Automated testing, Frontend/Demo, AI/Analytics bonus


# Demo and Evaluation Checklist



## 1. Demo Objective

The demo should prove that MediFlow is a functioning integrated system, not merely a collection of forms.

## 2. Recommended Demo Journey

### Phase 1 — Patient
1. Register/login.
2. Open patient dashboard.
3. Search/browse doctors.
4. Select department/specialization.
5. View doctor availability.
6. Book an available appointment.
7. Show confirmation.
8. Attempt the same conflicting slot again and show server rejection.

### Phase 2 — Doctor
9. Login as doctor.
10. View assigned appointment.
11. Confirm appointment.
12. Complete consultation.
13. Create prescription.

### Phase 3 — Patient
14. Login/view patient account.
15. Show prescription.
16. Show appointment history.
17. Show notification.
18. Show invoice/billing.

### Phase 4 — Admin
19. Login as admin.
20. Show doctor/department management.
21. Show appointment oversight.
22. Show dashboard/reporting.
23. Show useful statistics.

### Phase 5 — Security
24. Attempt unauthorized access.
25. Show rejection.
26. Explain RBAC and ownership.

## 3. Viva Talking Points

Be prepared to explain:
- why MongoDB references/embedding were chosen,
- how password hashing works,
- how JWT authentication works,
- difference between authentication and authorization,
- how appointment conflicts are detected,
- how concurrent booking is protected,
- how status transitions are enforced,
- how validation works,
- how errors are standardized,
- how tests prove business rules.

## 4. Evaluation Mapping

Maintain a final mapping from project requirements to:
- implementation file/module,
- API,
- database collection,
- test,
- UI screen,
- demo step.

## 5. Demo Reliability

Before demo:
- seed deterministic demo accounts/data,
- verify clean startup,
- verify environment configuration,
- verify database connection,
- verify all critical workflows,
- keep a backup demo dataset.

## 6. AI Feature

If implemented, AI/analytics must be clearly labeled as an enhancement. It must not be required for the mandatory workflow to function.
