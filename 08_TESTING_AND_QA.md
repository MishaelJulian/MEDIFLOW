# MediFlow — Testing and Quality Assurance

## 1. Testing Goal

Tests must prove both:
- normal functionality,
- rejection of invalid/unsafe operations.

## 2. Required Test Layers

### Unit tests
For pure business logic and utilities:
- interval overlap,
- status transition validation,
- validation helpers,
- calculation helpers.

### API/integration tests
For:
- auth,
- RBAC,
- CRUD,
- appointment booking,
- prescriptions,
- billing,
- notifications,
- search,
- reports.

### End-to-end smoke test
Demonstrate the complete patient → doctor → admin workflow.

## 3. Mandatory Negative Tests

At minimum:
- invalid registration,
- duplicate email,
- wrong password,
- missing token,
- invalid token,
- wrong role,
- unauthorized ownership access,
- invalid ObjectId,
- invalid department,
- invalid doctor,
- past appointment,
- unavailable slot,
- overlapping slot,
- double booking,
- invalid status transition,
- malformed billing data.

## 4. Appointment Test Matrix

Examples:

`TC-APPT-001` valid booking succeeds.

`TC-APPT-002` booking outside availability fails.

`TC-APPT-003` duplicate/overlapping appointment returns conflict.

`TC-APPT-004` patient cannot book using another patient's identity.

`TC-APPT-005` inactive doctor cannot receive booking.

`TC-APPT-006` invalid state transition fails.

## 5. Security Tests

Verify:
- password is never stored plaintext,
- passwordHash is not returned,
- JWT secret is environment-only,
- protected routes reject anonymous requests,
- role middleware blocks unauthorized users,
- ownership checks work.

## 6. Quality Gates

Before merge:
- application starts,
- database connection works,
- lint/format checks pass if configured,
- relevant tests pass,
- no secrets detected,
- API contract remains compatible.

## 7. Regression Rule

A fix for one module must not break downstream modules. When shared models/contracts change, run the broader integration suite.
