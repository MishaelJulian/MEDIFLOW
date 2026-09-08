# MediFlow — Master Project Constitution

## 1. Purpose

This document is the highest-level engineering authority for the MediFlow project. Every human developer and every AI coding agent must read and follow it before making implementation changes.

MediFlow is a secure, role-based hospital/clinic management web application built with Node.js, Express.js, MongoDB, Mongoose, and a web frontend. The baseline must implement all mandatory functional areas specified by the project brief.

## 2. Non-Negotiable Rules

1. Inspect the existing repository before modifying anything.
2. Never delete or overwrite working code without understanding its purpose.
3. Never invent a competing architecture, schema, route convention, or response format.
4. Treat the shared specification files as the source of truth.
5. Preserve backward compatibility when changing shared models or APIs.
6. Never commit passwords, JWT secrets, database credentials, API keys, or `.env` files.
7. Passwords must be hashed; plaintext passwords must never be stored or returned.
8. Every protected API must enforce authentication and, where required, role/ownership authorization.
9. Validate all externally supplied input.
10. Business rules must be enforced server-side, not only in the frontend.
11. Appointment double-booking and slot conflicts must be prevented.
12. Never silently change another member's owned domain.
13. Add or update tests for non-trivial behavior.
14. Do not implement bonus/AI features at the expense of mandatory baseline modules.
15. Update relevant documentation when an architectural contract changes.
16. Keep commits focused and understandable.
17. Do not claim a feature is complete until it has been exercised and verified.

## 3. Mandatory Technology Direction

Baseline backend:
- Node.js
- Express.js
- MongoDB
- Mongoose
- REST APIs
- Environment-based configuration
- Secure password hashing
- JWT-based authentication or another explicitly approved secure token strategy

Frontend technology may be selected by the team, but it must consume the documented REST API rather than duplicate business logic.

## 4. Mandatory Functional Baseline

The project must cover these areas:
- Patient authentication/profile
- Doctor and department management
- Doctor availability
- Appointment booking
- Appointment workflow/status management
- Prescription management
- Medical history
- Doctor/patient directory
- Notifications
- Billing/invoices
- Search
- Admin controls
- Reports/dashboarding

## 5. Engineering Principles

### Separation of concerns
Routes define endpoints, controllers coordinate requests, services contain business logic, models define persistence structures, and middleware handles cross-cutting concerns.

### Secure by default
Protected resources are denied unless authentication and authorization explicitly permit access.

### Explicit business rules
Important rules such as appointment conflict detection, status transitions, ownership, and role restrictions belong in reusable backend services.

### Consistent contracts
API paths, request shapes, response envelopes, error codes, and database naming must remain consistent across members.

## 6. Definition of Done

A feature is done only when:
- implementation exists,
- validation exists,
- authorization is correct,
- error cases are handled,
- relevant tests pass,
- API behavior matches the contract,
- no secrets are exposed,
- integration impact has been considered,
- documentation is updated where necessary.

## 7. AI Agent Boot Protocol

Before coding:
1. Read this file.
2. Read the shared architecture, schema, API, business-rule, security, testing, and team-integration specifications.
3. Read the member-specific specification assigned to the agent.
4. Inspect the repository.
5. Identify existing implementation and tests.
6. Make a short implementation plan.
7. Implement incrementally.
8. Run relevant tests/checks.
9. Report files changed, tests run, and unresolved issues.

If a requirement is ambiguous, prefer the existing documented contract over assumptions. If the contract itself is ambiguous, record the proposed decision before making a breaking change.
