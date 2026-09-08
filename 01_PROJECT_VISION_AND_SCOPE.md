# MediFlow — Project Vision and Scope

## 1. Vision

MediFlow is a unified healthcare management platform intended to centralize patient, doctor, appointment, clinical, billing, notification, and administrative workflows.

The system should feel like one coherent product rather than a collection of unrelated CRUD pages.

## 2. Primary Users

### Patient
Can:
- register/login,
- maintain profile,
- discover doctors/departments,
- view availability,
- book appointments,
- view appointment history,
- access permitted prescriptions/medical records,
- view notifications,
- view billing information.

### Doctor
Can:
- securely access the system,
- manage permitted profile information,
- manage or publish availability according to authorization,
- view assigned appointments,
- update appointment workflow,
- create prescriptions,
- access permitted patient clinical information.

### Receptionist
Can:
- assist with appointment workflows,
- search patients/doctors,
- perform permitted operational actions,
- access permitted administrative workflows.

### Administrator
Can:
- manage users/doctors/departments,
- oversee appointments,
- manage system-level configuration,
- access reports and dashboards,
- perform privileged administrative operations.

## 3. Scope

### Mandatory baseline
All mandatory functional modules in the requirements registry must be implemented.

### Quality baseline
The application must include:
- authentication,
- authorization,
- validation,
- centralized errors,
- secure configuration,
- MongoDB persistence,
- meaningful tests,
- documented APIs,
- reproducible setup,
- usable UI.

### Bonus
AI/analytics can be added only after the mandatory baseline is stable.

## 4. Explicit Non-Goals

Do not turn the college project into a production hospital platform requiring:
- real payment processing,
- real SMS infrastructure,
- real insurance claim settlement,
- real-world clinical decision support,
- legally certified medical records,
- production patient identity verification.

Demo implementations may use safe mock behavior where external infrastructure is unnecessary.

## 5. Product Quality Target

A user should be able to demonstrate a complete journey:

Patient login → doctor discovery → availability → appointment booking → doctor workflow → prescription → billing/notification → admin reporting.

The final application should make business rules visible through the UI while enforcing them on the server.

## 6. Scope Priority

Priority order:
1. Security and data integrity
2. Mandatory backend modules
3. Mandatory frontend workflows
4. Validation/error handling
5. Testing
6. Reporting/dashboard quality
7. AI/analytics enhancements
8. Cosmetic extras
