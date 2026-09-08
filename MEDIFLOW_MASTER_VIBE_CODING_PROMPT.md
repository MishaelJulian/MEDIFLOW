# MASTER VIBE-CODING PROMPT --- MEDIFLOW

## Hospital Patient & Appointment Management System

### L&T EduTech / Christ University --- CIA-3 \| Node.js + Express.js + MongoDB

> **Purpose:** This document is the master instruction to be given to an
> AI coding agent (for example, an Antigravity agent) working inside the
> existing GitHub repository. The agent must treat this document as the
> project constitution. It should inspect the existing repository before
> making changes, preserve working code, implement production-quality
> foundations, and never blindly overwrite existing work.

------------------------------------------------------------------------

# 0. YOUR ROLE

You are the primary senior full-stack/backend engineering agent for this
repository.

You are working on a **5th-semester CIA-3 academic project** titled:

> **MediFlow --- Hospital Patient & Appointment Management System**

The official minimum specification requires **13 functional modules**, a
Node.js + Express.js backend, MongoDB with Mongoose, JWT authentication,
bcrypt password hashing, server-side validation, centralized error
handling, deliberate MongoDB reference/embed decisions, REST APIs,
Postman testing, README documentation, and a working demonstration.

The project will be developed by a **team of 4 students** using
AI-assisted/vibe coding. The repository will be developed incrementally
by multiple agents/members.

Your job is NOT to generate a toy CRUD application.

Your job is to build a clean, explainable, secure, modular
backend/application that can survive:

-   live demonstration
-   Postman testing
-   direct API abuse/testing
-   business-rule conflict tests
-   MongoDB schema evaluation
-   GitHub code review
-   viva questions
-   integration with work created by the other three team members

------------------------------------------------------------------------

# 1. NON-NEGOTIABLE PROJECT REQUIREMENTS

The following 13 modules are the minimum baseline and MUST eventually
exist and work:

1.  Patient Registration & Authentication
2.  Doctor Profile & Department Management
3.  Doctor Availability Slots
4.  Appointment Booking Engine
5.  Appointment Status Workflow
6.  Digital Prescription Module
7.  Patient Medical History
8.  Department & Specialization Directory
9.  Notifications & Reminders
10. Billing Summary per Visit
11. Search Doctors by Specialization
12. Admin Dashboard & Reports
13. Role-Based Access Control

The L&T specification states that the following form the functional
backbone and are checked first:

-   Patient Registration & Authentication
-   Doctor Profile & Department Management
-   Doctor Availability Slots

The specification also emphasizes that **status-transition/workflow
logic is heavily weighted**. Do NOT implement every feature as
unrestricted CRUD.

MongoDB schema quality is independently evaluated.

All incoming request bodies must be validated server-side.

Passwords must never be stored in plaintext.

JWT secrets and database credentials must never be hardcoded.

Protected routes must enforce authentication and authorization.

Errors must be handled centrally and returned as consistent JSON.

The final repository must not contain real secrets.

------------------------------------------------------------------------

# 2. IMPORTANT PRIORITY RULE

Follow this priority order whenever making decisions:

## Priority 1 --- Official mandatory functionality

All 13 required modules must work.

## Priority 2 --- Correct business rules

Prevent invalid state transitions, duplicate/overlapping appointments,
unauthorized actions, invalid references, etc.

## Priority 3 --- Database quality

Use sensible Mongoose schemas, indexes, references, and embedding.

## Priority 4 --- Security

JWT, bcrypt, role checks, validation, secure environment variables.

## Priority 5 --- Code quality

MVC structure, centralized error handling, reusable
middleware/utilities.

## Priority 6 --- Testing

Postman/manual API testing, negative cases, conflict cases,
authentication/authorization failures.

## Priority 7 --- Frontend/demo polish

A working frontend is desirable but must never delay the backend
requirements.

## Priority 8 --- AI/advanced features

AI is a BONUS layer. Do not sacrifice mandatory functionality to add AI.

------------------------------------------------------------------------

# 3. TEAM STRUCTURE

There are 4 team members.

The current owner of this agent/workstream is **Member 1**.

## Member 1 ownership

Primary responsibility:

-   Patient Registration & Authentication
-   Doctor Profile & Department Management
-   Doctor Availability Slots
-   Appointment Booking Engine
-   foundational backend architecture
-   authentication middleware
-   validation foundations
-   error-handling foundations
-   database connection foundation
-   API conventions
-   integration contracts for other members

Other team members will implement later:

### Member 2

-   Appointment Status Workflow
-   Digital Prescription Module
-   Patient Medical History
-   Department & Specialization Directory

### Member 3

-   Notifications & Reminders
-   Billing Summary per Visit
-   Search Doctors by Specialization
-   Admin Dashboard & Reports
-   additional RBAC hardening/integration

### Member 4

-   Database/schema review
-   Postman testing
-   README/PPT consolidation
-   integration
-   optional analytics/AI layer
-   final quality assurance

However, **ownership does NOT mean isolation**.

The entire team must be able to explain the complete project during
viva.

Therefore:

-   document decisions
-   keep interfaces predictable
-   avoid undocumented magic
-   do not create architecture that only one agent understands
-   write useful comments where business rules are non-obvious

------------------------------------------------------------------------

# 4. FIRST ACTION --- INSPECT THE REPOSITORY

Before creating or modifying files:

1.  Inspect the complete repository tree.
2.  Identify whether a Node.js project already exists.
3.  Inspect:
    -   `package.json`
    -   existing source files
    -   `.gitignore`
    -   `.env*`
    -   README
    -   existing models
    -   routes
    -   controllers
    -   middleware
    -   config
    -   tests
4.  Determine what is already implemented.
5.  DO NOT overwrite functioning code without understanding it.
6.  Reuse existing conventions when they are sensible.
7.  If the repository is empty, initialize the architecture described in
    this document.
8.  If there is an existing architecture that conflicts with this
    document, preserve working functionality but refactor carefully
    toward this specification.
9.  Do not create duplicate models/routes simply because a file already
    exists.
10. Before implementing a new feature, search the repository for related
    functionality.

At the end of the inspection, create or update a short internal
implementation plan before making large changes.

------------------------------------------------------------------------

# 5. TARGET TECHNOLOGY STACK

Use:

## Backend

-   Node.js
-   Express.js

## Database

-   MongoDB
-   Mongoose ODM

## Authentication

-   JWT
-   bcrypt

## Validation

Prefer: - `express-validator` or - Joi

Choose ONE validation approach and use it consistently.

## Testing

-   Postman
-   optional automated tests if practical

## Frontend

Optional but strongly recommended: - HTML - CSS - JavaScript - Bootstrap

A React frontend may be used if the team has already chosen it, but do
not introduce unnecessary complexity merely for appearance.

## Environment

Use `.env` for:

-   `PORT`
-   `MONGODB_URI`
-   `JWT_SECRET`
-   `JWT_EXPIRES_IN`
-   other configuration as required

Commit only `.env.example`, never real `.env` secrets.

------------------------------------------------------------------------

# 6. TARGET PROJECT STRUCTURE

Aim for:

``` text
project-root/
│
├── config/
│   ├── db.js
│   └── env.js                    # optional if useful
│
├── models/
│   ├── User.js
│   ├── Patient.js
│   ├── Doctor.js
│   ├── Department.js
│   ├── Appointment.js
│   ├── Prescription.js
│   └── Billing.js
│
├── routes/
│   ├── auth.routes.js
│   ├── patient.routes.js
│   ├── doctor.routes.js
│   ├── department.routes.js
│   ├── appointment.routes.js
│   ├── prescription.routes.js
│   ├── billing.routes.js
│   └── admin.routes.js
│
├── controllers/
│   ├── auth.controller.js
│   ├── patient.controller.js
│   ├── doctor.controller.js
│   ├── department.controller.js
│   ├── appointment.controller.js
│   ├── prescription.controller.js
│   ├── billing.controller.js
│   └── admin.controller.js
│
├── middleware/
│   ├── auth.js
│   ├── authorize.js
│   ├── validate.js
│   └── errorHandler.js
│
├── validators/
│   ├── auth.validators.js
│   ├── patient.validators.js
│   ├── doctor.validators.js
│   ├── department.validators.js
│   └── appointment.validators.js
│
├── utils/
│   ├── token.js
│   ├── asyncHandler.js
│   └── response.js
│
├── services/
│   └──                     # use only when business logic benefits from service layer
│
├── tests/
│
├── postman/
│   └── MediFlow.postman_collection.json
│
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md
```

Do NOT create unnecessary layers merely to make the folder tree look
sophisticated.

------------------------------------------------------------------------

# 7. API DESIGN CONVENTIONS

Base API path:

``` text
/api
```

Use resource-oriented routes.

Examples:

``` http
POST   /api/auth/register
POST   /api/auth/login

GET    /api/departments
POST   /api/departments

GET    /api/doctors
POST   /api/doctors
GET    /api/doctors/:id
PUT    /api/doctors/:id
PUT    /api/doctors/:id/slots

POST   /api/appointments
GET    /api/appointments/:id
PUT    /api/appointments/:id/status

POST   /api/prescriptions
GET    /api/patients/:id/history

GET    /api/admin/reports/appointments
```

Use proper HTTP methods.

Do not use POST for every operation.

------------------------------------------------------------------------

# 8. STANDARD RESPONSE FORMAT

Successful responses should follow a consistent shape:

``` json
{
  "success": true,
  "message": "Human-readable message",
  "data": {}
}
```

For errors:

``` json
{
  "success": false,
  "message": "Human-readable error message",
  "errorCode": "VALIDATION_ERROR"
}
```

Potential error codes:

``` text
VALIDATION_ERROR
AUTHENTICATION_REQUIRED
INVALID_CREDENTIALS
FORBIDDEN
NOT_FOUND
DUPLICATE_RESOURCE
SLOT_CONFLICT
INVALID_STATUS_TRANSITION
BUSINESS_RULE_VIOLATION
INTERNAL_SERVER_ERROR
```

Do not expose stack traces or sensitive implementation details in
production-style API responses.

------------------------------------------------------------------------

# 9. DATABASE DESIGN

Required conceptual collections:

``` text
users
patients
doctors
departments
appointments
prescriptions
billing
```

Additional collections may be introduced when justified, for example:

``` text
notifications
```

Do not add collections just because you can.

------------------------------------------------------------------------

# 10. USERS COLLECTION

Conceptual fields:

``` text
name
email
passwordHash
role
phone
createdAt
updatedAt
```

Role values should be controlled.

Recommended:

``` text
PATIENT
DOCTOR
ADMIN
RECEPTIONIST
```

Do not allow arbitrary role strings from users.

Registration must never accept an unrestricted role from an untrusted
client.

For example, a public registration endpoint should NOT allow:

``` json
{
  "role": "ADMIN"
}
```

unless there is a secure/admin-only mechanism specifically intended for
creating admin accounts.

Passwords:

-   hash using bcrypt
-   never return `passwordHash` in normal API responses
-   never log passwords
-   never store plaintext passwords

Create a unique index for email.

------------------------------------------------------------------------

# 11. PATIENT MODEL

Suggested fields:

``` text
userId
dob
gender
bloodGroup
medicalNotes
createdAt
updatedAt
```

`userId` should reference the corresponding User.

Do not duplicate the user's password/email unnecessarily in Patient.

------------------------------------------------------------------------

# 12. DEPARTMENT MODEL

Suggested:

``` text
name
description
createdAt
updatedAt
```

Department name should have sensible uniqueness handling.

Examples:

``` text
Cardiology
Neurology
Orthopedics
Dermatology
General Medicine
```

Do not hardcode these values into controllers.

------------------------------------------------------------------------

# 13. DOCTOR MODEL

Suggested:

``` text
userId
departmentId
specialization
availabilitySlots
createdAt
updatedAt
```

A doctor references:

-   User
-   Department

Specialization belongs to the doctor.

Availability requires careful design.

------------------------------------------------------------------------

# 14. AVAILABILITY SLOT DESIGN

Doctor availability is one of the core features.

Avoid allowing arbitrary overlapping slots.

A slot should contain enough information to determine:

-   date
-   start time
-   end time
-   availability status if needed

Possible conceptual representation:

``` json
{
  "date": "2026-09-10",
  "startTime": "10:00",
  "endTime": "10:30"
}
```

or a carefully normalized date/time representation.

Pick ONE representation and use it consistently.

Document timezone assumptions.

The project specification permits assuming a single timezone unless the
team documents an extension.

Use a consistent timezone strategy.

------------------------------------------------------------------------

# 15. AVAILABILITY BUSINESS RULES

At minimum:

### Rule 1 --- Start must precede end

Reject:

``` text
11:00 → 10:30
```

### Rule 2 --- No overlapping availability slots for the same doctor

Reject:

``` text
10:00–11:00
10:30–11:30
```

### Rule 3 --- Do not create nonsensical duplicate slots

Reject exact duplicates.

### Rule 4 --- Validate date/time input server-side

Never trust frontend validation.

### Rule 5 --- Only authorized doctor/admin/receptionist roles should modify availability according to the project's RBAC design.

A patient must never be able to modify a doctor's availability.

------------------------------------------------------------------------

# 16. APPOINTMENT MODEL

Suggested:

``` text
patientId
doctorId
slot
status
createdAt
updatedAt
```

The slot should contain sufficient information to identify the booked
time.

Possible structure:

``` json
{
  "date": "2026-09-10",
  "startTime": "10:30",
  "endTime": "11:00"
}
```

or a reference to a dedicated slot if the team later chooses that
design.

Choose based on the repository's architecture.

------------------------------------------------------------------------

# 17. APPOINTMENT BOOKING ENGINE

This is one of the most important features.

The backend must NOT simply insert an appointment.

Booking must perform business-rule validation.

Minimum sequence:

``` text
1. Authenticate user
2. Confirm patient identity/ownership
3. Validate doctor exists
4. Validate doctor is active/usable
5. Validate slot format
6. Confirm slot is within doctor's availability
7. Check for conflicting appointment
8. Reject duplicate/overlapping booking
9. Create appointment
10. Return standardized response
```

------------------------------------------------------------------------

# 18. APPOINTMENT CONFLICT RULE

Two patients MUST NOT be able to book the same doctor/time slot.

Example:

Patient A books:

``` text
Doctor 101
2026-09-10
10:30–11:00
```

Patient B attempts the same:

``` text
Doctor 101
2026-09-10
10:30–11:00
```

The second request must fail.

Return:

``` json
{
  "success": false,
  "message": "Appointment slot is already booked",
  "errorCode": "SLOT_CONFLICT"
}
```

Use the appropriate HTTP status, such as `409 Conflict`, for
business-rule conflicts.

------------------------------------------------------------------------

# 19. APPOINTMENT OVERLAP LOGIC

Do not only check exact string equality if the system permits variable
durations.

For intervals:

``` text
Existing: 10:00–11:00
New:      10:30–11:30
```

This overlaps and must be rejected if overlapping appointments are
disallowed.

The generic interval-overlap principle is:

``` text
newStart < existingEnd
AND
newEnd > existingStart
```

Implement this according to the chosen database/time representation.

------------------------------------------------------------------------

# 20. APPOINTMENT STATUS STATE MACHINE

This is CRITICAL.

Do NOT allow arbitrary:

``` http
PUT /appointments/:id/status
```

to change anything to anything.

Define valid states.

Recommended states:

``` text
BOOKED
CONFIRMED
COMPLETED
CANCELLED
NO_SHOW
```

Recommended valid transitions:

``` text
BOOKED
  ├──> CONFIRMED
  ├──> CANCELLED
  └──> NO_SHOW

CONFIRMED
  ├──> COMPLETED
  └──> CANCELLED
```

Terminal states:

``` text
COMPLETED
CANCELLED
NO_SHOW
```

should generally not transition back into active states.

Reject:

``` text
COMPLETED → BOOKED
CANCELLED → CONFIRMED
NO_SHOW → COMPLETED
```

unless the team deliberately documents another policy.

The backend must enforce the transition matrix.

------------------------------------------------------------------------

# 21. AUTHENTICATION

Implement:

``` text
POST /api/auth/register
POST /api/auth/login
```

Registration:

-   validate name
-   validate email
-   validate password
-   validate phone if required
-   check duplicate email
-   hash password
-   create User
-   create Patient profile where appropriate
-   return safe user data
-   optionally issue JWT according to chosen flow

Login:

-   find user by email
-   compare bcrypt hash
-   create JWT
-   return token and safe user information

JWT payload should contain minimal identity/authorization information,
for example:

``` text
userId
role
```

Do not put sensitive medical information into the JWT.

------------------------------------------------------------------------

# 22. AUTH MIDDLEWARE

Protected routes should require:

``` text
Authorization: Bearer <token>
```

Middleware must:

1.  extract token
2.  validate token
3.  attach authenticated user context
4.  reject missing/invalid/expired tokens
5.  never crash the server

Example conceptual request context:

``` js
req.user = {
  id: "...",
  role: "PATIENT"
};
```

Do not trust a client-provided `userId` for ownership-sensitive actions
when the authenticated token already identifies the user.

------------------------------------------------------------------------

# 23. ROLE-BASED ACCESS CONTROL

At minimum support:

``` text
PATIENT
DOCTOR
ADMIN
RECEPTIONIST
```

Define permissions explicitly.

Example baseline:

### Patient

Can: - manage own patient profile - view departments - search doctors -
view doctor availability - book own appointment - view own
appointments - view own medical history - view own prescriptions/billing
where applicable

Cannot: - modify doctors - modify departments - modify another patient's
records - modify doctor availability - access admin reports

### Doctor

Can: - manage own doctor profile as permitted - manage own
availability - view assigned/upcoming appointments - update allowed
appointment statuses - issue prescriptions for completed/eligible
appointments - view relevant patient history

Cannot: - access arbitrary admin functionality - modify another doctor's
profile unless admin policy permits

### Admin

Can: - manage departments - manage doctors - manage users/roles where
permitted - access reports - manage system-level resources

### Receptionist

Can: - assist with appointments - view relevant patient/doctor
information - perform operational appointment actions according to
policy

Document exact permissions in README.

------------------------------------------------------------------------

# 24. OWNERSHIP CHECKS

Authentication is NOT authorization.

This is invalid:

``` text
User is logged in
→ therefore user can request any patient ID
```

For example:

``` http
GET /api/patients/OTHER_PERSON_ID/history
```

must not automatically succeed just because the caller is authenticated.

Enforce:

``` text
role
AND
ownership
AND/OR
explicit administrative permission
```

where appropriate.

------------------------------------------------------------------------

# 25. VALIDATION

Validate EVERY externally supplied request.

Validate:

-   body
-   params
-   query parameters
-   enum values
-   IDs
-   dates
-   times
-   email
-   password
-   phone
-   required fields

Examples:

Reject malformed ObjectId.

Reject invalid email.

Reject unsupported role.

Reject invalid appointment status.

Reject end time before start time.

Reject missing doctor.

Reject missing patient.

Reject empty department name.

Validation errors should return:

``` text
400 Bad Request
```

with a consistent JSON structure.

------------------------------------------------------------------------

# 26. CENTRALIZED ERROR HANDLING

Implement centralized Express error middleware.

The server should not crash because of:

-   rejected promises
-   invalid ObjectId
-   database validation error
-   duplicate key
-   unexpected controller exception

Use an async-handler pattern or equivalent.

Centralize conversion into API responses.

Never expose internal stack traces to normal clients.

------------------------------------------------------------------------

# 27. MONGOOSE REFERENCES VS EMBEDDING

Follow deliberate modeling.

Reference data that:

-   is shared
-   is large
-   changes independently
-   has its own lifecycle

Examples:

``` text
Appointment → Patient
Appointment → Doctor
Doctor → Department
Patient → User
Doctor → User
Prescription → Appointment
Billing → Appointment
```

Embed small data that:

-   is always read with its parent
-   rarely changes independently

Availability slots may be embedded in Doctor if the team determines that
this matches the expected access pattern.

Document the reasoning in README.

------------------------------------------------------------------------

# 28. REQUIRED INDEXES

At minimum, evaluate these:

``` text
users:
{ email: 1 } unique

patients:
{ userId: 1 }

doctors:
{ userId: 1 }

departments:
{ name: 1 }

appointments:
{ patientId: 1 }
```

Also consider useful appointment indexes such as:

``` text
{ doctorId: 1, "slot.date": 1 }
```

and appropriate uniqueness/compound constraints if compatible with the
chosen slot model.

Do not add indexes blindly.

Every important index should have a reason.

------------------------------------------------------------------------

# 29. SECURITY REQUIREMENTS

MUST:

-   bcrypt passwords
-   JWT authentication
-   environment variables for secrets
-   `.gitignore` `.env`
-   input validation
-   authorization middleware
-   ownership checks
-   no sensitive information in logs
-   no password in API responses
-   no JWT secret in repository
-   no MongoDB credentials in repository

Strongly consider:

-   helmet
-   CORS configuration
-   rate limiting for authentication endpoints
-   sanitization appropriate to the stack

Do not introduce security libraries that are incompatible or
unnecessary.

------------------------------------------------------------------------

# 30. CORS

If a separate frontend exists, configure CORS intentionally.

Do not use insecure wildcard behavior for sensitive production-style
configurations unless it is explicitly justified for local academic
development.

For a local demo, document the configured frontend origin.

------------------------------------------------------------------------

# 31. PATIENT PROFILE RULES

A patient should be associated with a User.

The API must distinguish:

``` text
User identity
```

from:

``` text
Patient medical profile
```

Do not put all medical information into User.

Medical notes are sensitive application data.

Do not expose them unnecessarily.

------------------------------------------------------------------------

# 32. DOCTOR PROFILE RULES

Doctor should have:

``` text
userId
departmentId
specialization
availability
```

Department references must be valid.

Do not allow a doctor to reference a nonexistent department.

If a department is deleted/deactivated, consider the effect on
associated doctors before permitting deletion.

Prefer soft deactivation over destructive deletion if that makes the
system safer and more explainable.

------------------------------------------------------------------------

# 33. DEPARTMENT MANAGEMENT

Admin can:

-   create department
-   update department
-   list departments
-   view department
-   manage description

Avoid destructive deletion if doctors depend on the department.

Possible safer approach:

``` text
isActive
```

and deactivate instead of deleting.

If the team chooses hard deletion, enforce dependency checks.

------------------------------------------------------------------------

# 34. DOCTOR SEARCH

Eventually support:

``` http
GET /api/doctors?department=...&specialization=...
```

Potential filters:

-   department
-   specialization
-   availability

Do not put all filtering logic in the frontend.

The backend should support server-side filtering.

------------------------------------------------------------------------

# 35. PRESCRIPTION INTEGRATION CONTRACT

Member 2 will implement the prescription module.

Design your appointment model so it can be referenced cleanly.

Prescription should reference:

``` text
appointmentId
```

A prescription should normally only be issued for an eligible/completed
consultation according to the project's business rules.

Do not build an isolated prescription table unrelated to appointments.

------------------------------------------------------------------------

# 36. MEDICAL HISTORY INTEGRATION CONTRACT

Medical history should be derived from relevant patient-linked records
rather than creating unnecessary duplicate data.

Potential sources:

``` text
Appointments
Prescriptions
```

The history endpoint should produce a chronological view.

Avoid duplicating the entire medical record in multiple collections.

------------------------------------------------------------------------

# 37. NOTIFICATIONS INTEGRATION CONTRACT

Member 3 may implement notifications.

Appointment creation/status changes should expose enough information to
create notification records.

Potential events:

``` text
Appointment booked
Appointment confirmed
Appointment cancelled
Upcoming appointment reminder
```

Third-party SMS/email integrations may be mocked/stubbed.

Do not spend project time integrating external providers unless
mandatory.

------------------------------------------------------------------------

# 38. BILLING INTEGRATION CONTRACT

Billing references:

``` text
appointmentId
```

Potential fields:

``` text
amount
paymentStatus
createdAt
updatedAt
```

Do not integrate real payment gateways.

The official project scope permits mocked/stubbed external payment
functionality.

------------------------------------------------------------------------

# 39. ADMIN REPORTING CONTRACT

Admin reports should eventually support things such as:

``` text
daily appointment count
weekly appointment count
department load
doctor utilization
status breakdown
```

Design appointment statuses consistently so aggregation is possible.

Do not store redundant counters unless there is a documented reason.

------------------------------------------------------------------------

# 40. AI BONUS LAYER

Only after the mandatory modules are working.

Potential feature:

## Appointment No-Show Prediction

Example:

``` text
Appointment:
Patient X
Doctor Y
Tomorrow 10:30

No-show probability:
78%

Risk:
HIGH
```

Potential features:

-   previous cancellations
-   previous no-shows
-   appointment lead time
-   day of week
-   appointment type
-   historical attendance

This is a BONUS.

The core Node/Express/MongoDB system must remain fully functional if the
AI component is removed.

Do not make the backend depend on a Python ML server just to boot.

If AI is added later, isolate it behind a service/API boundary.

------------------------------------------------------------------------

# 41. FRONTEND PRINCIPLE

The frontend is for demonstration.

Do not spend the majority of development time making animations.

A clean functional UI is sufficient.

Recommended screens:

### Patient

-   Login/Register
-   Dashboard
-   Find Doctor
-   Doctor Details
-   Available Slots
-   Book Appointment
-   My Appointments
-   Medical History
-   Prescriptions
-   Billing

### Doctor

-   Dashboard
-   Availability
-   Appointments
-   Patient details
-   Prescription

### Admin

-   Dashboard
-   Departments
-   Doctors
-   Patients
-   Appointments
-   Reports

The backend remains the source of truth.

------------------------------------------------------------------------

# 42. POSTMAN TESTING

Create a Postman collection covering major endpoints.

Must include:

## Happy path

-   register
-   login
-   create department
-   create doctor
-   create availability
-   book appointment
-   update appointment
-   retrieve records

## Validation failure

Examples:

``` text
missing email
invalid email
invalid ID
missing required field
invalid date
invalid status
```

## Authentication failure

Call protected endpoint without token.

Expected:

``` text
401
```

## Authorization failure

Use valid token with wrong role.

Expected:

``` text
403
```

## Business-rule conflict

Try:

``` text
duplicate availability
overlapping availability
duplicate appointment slot
invalid appointment status transition
```

Expected:

``` text
409
```

or another documented business-rule status.

## Not found

Request:

``` text
GET /api/doctors/nonexistent-id
```

Expected:

``` text
404
```

Never let malformed IDs crash the server.

------------------------------------------------------------------------

# 43. SEED DATA

For demo convenience, create an optional seed mechanism.

Possible demo data:

``` text
Admin
Receptionist
2–3 Doctors
3–5 Patients
3–5 Departments
availability slots
sample appointments
```

Do NOT commit real personal information.

Use clearly fictional/demo identities.

Do not make seed data required for production startup.

------------------------------------------------------------------------

# 44. README REQUIREMENTS

README must eventually contain:

## Project title

## Team details

## Problem statement

## Objectives

## Features / modules

Map every feature to the 13 mandatory modules.

## Tech stack

``` text
Node.js
Express.js
MongoDB
Mongoose
JWT
bcrypt
Validation library
Postman
Frontend technology
```

## Architecture

Include:

``` text
Client
 ↓
Routes
 ↓
Middleware
 ↓
Controllers
 ↓
Models
 ↓
MongoDB
```

## Database schema

Explain:

-   collections
-   relationships
-   references
-   embedded data
-   indexes

## API reference

Include:

``` text
METHOD
PATH
DESCRIPTION
AUTH
ROLE
```

## Setup

Example:

``` bash
npm install
```

Then:

``` text
create .env
configure MongoDB URI
configure JWT secret
start server
```

Use the actual package scripts from the repository.

## Testing

Explain Postman collection.

## Known limitations

Document intentionally mocked/out-of-scope integrations.

------------------------------------------------------------------------

# 45. GIT RULES

This repository is shared by 4 people.

Do NOT create giant unstructured commits.

Use meaningful commits such as:

``` text
feat: implement user registration and login
feat: add JWT authentication middleware
feat: add department management APIs
feat: add doctor profile APIs
feat: implement doctor availability validation
feat: implement appointment booking conflict checks
fix: prevent overlapping doctor availability
fix: enforce appointment ownership
test: add appointment conflict scenarios
docs: update API documentation
```

Do not commit:

``` text
.env
node_modules/
logs/
local secrets
temporary files
```

Keep `.gitignore` correct.

------------------------------------------------------------------------

# 46. DO NOT DESTROY TEAMMATE WORK

Because multiple members/agents will work on the same repository:

Before modifying an existing file:

1.  inspect it
2.  understand dependencies
3.  search for imports/usages
4.  preserve compatible behavior
5.  make the smallest clean change possible

If another member has already implemented a feature:

-   integrate with it
-   do not replace it unnecessarily
-   do not create duplicate endpoints
-   do not create duplicate schemas

If a conflict exists, prefer the architecture that satisfies the
official requirements with the least destructive change.

------------------------------------------------------------------------

# 47. DO NOT FAKE FUNCTIONALITY

Never create:

``` text
TODO
coming soon
mock response
hardcoded successful response
fake database result
```

for a feature that is supposed to be functional.

If an external service is explicitly allowed to be mocked, make the mock
explicit and documented.

For example:

``` text
Notification record created
```

is acceptable.

Pretending an SMS was actually delivered is not.

------------------------------------------------------------------------

# 48. DO NOT OVERENGINEER

Avoid introducing:

-   microservices
-   Kubernetes
-   Redis
-   Kafka
-   GraphQL
-   unnecessary event buses
-   complex cloud infrastructure

unless there is a compelling project requirement.

This is a semester academic project.

A clean modular monolith is the correct default.

------------------------------------------------------------------------

# 49. BUSINESS LOGIC MUST LIVE ON THE SERVER

Never rely on:

``` text
frontend validation
```

for:

-   authorization
-   slot conflicts
-   status transitions
-   ownership
-   appointment eligibility
-   department validity
-   doctor availability

The API must remain safe when called directly through Postman.

------------------------------------------------------------------------

# 50. LOGGING

Use useful development logging, but never log:

-   passwords
-   JWT secrets
-   MongoDB credentials
-   sensitive medical information unnecessarily

Errors should be diagnosable without exposing secrets.

------------------------------------------------------------------------

# 51. HTTP STATUS CODE GUIDELINES

Use meaningful status codes.

``` text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

Do not return `200 OK` for every error.

------------------------------------------------------------------------

# 52. ID VALIDATION

Before querying MongoDB by ObjectId:

-   validate the ID
-   return 400 for malformed IDs where appropriate
-   return 404 when the ID is syntactically valid but the resource
    doesn't exist

Do not allow CastError exceptions to become unhandled server crashes.

------------------------------------------------------------------------

# 53. DATABASE CONNECTION

Create a clean database connection module.

On startup:

``` text
load environment
connect MongoDB
start Express server
```

Handle connection failures clearly.

Do not hardcode:

``` text
mongodb://...
```

into source code.

------------------------------------------------------------------------

# 54. ENVIRONMENT CONFIGURATION

Create:

``` text
.env.example
```

Example conceptual values:

``` text
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
```

Do not put actual secrets into `.env.example`.

------------------------------------------------------------------------

# 55. SERVER STARTUP

The server should:

1.  load environment variables
2.  initialize Express
3.  configure middleware
4.  connect to MongoDB
5.  mount API routes
6.  mount 404 handling
7.  mount centralized error handler
8.  listen on configured port

Avoid starting before database connection if the architecture assumes DB
availability.

------------------------------------------------------------------------

# 56. HEALTH ENDPOINT

Add:

``` http
GET /api/health
```

Response:

``` json
{
  "success": true,
  "message": "MediFlow API is healthy"
}
```

This is useful for local demonstration and debugging.

------------------------------------------------------------------------

# 57. DOCUMENT THE DATA MODEL

Create a simple ER/collection diagram in README.

Conceptually:

``` text
                 ┌────────────┐
                 │   USERS    │
                 └─────┬──────┘
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
        ┌──────────┐      ┌──────────┐
        │ PATIENTS │      │ DOCTORS  │
        └────┬─────┘      └────┬─────┘
             │                 │
             │                 ▼
             │          ┌──────────────┐
             │          │ DEPARTMENTS  │
             │          └──────────────┘
             │
             └──────────┐
                        ▼
                ┌──────────────┐
                │ APPOINTMENTS │
                └──────┬───────┘
                       │
                ┌──────┴───────┐
                ▼              ▼
        ┌──────────────┐  ┌─────────┐
        │PRESCRIPTIONS │  │ BILLING │
        └──────────────┘  └─────────┘
```

Adapt the actual diagram to the final schema.

------------------------------------------------------------------------

# 58. APPOINTMENT BOOKING --- DETAILED ALGORITHM

Implement conceptually:

``` text
REQUEST
  ↓
Authenticate
  ↓
Authorize patient/receptionist/admin
  ↓
Validate request
  ↓
Find patient
  ↓
Find doctor
  ↓
Validate slot
  ↓
Check doctor availability
  ↓
Check existing conflicting appointment
  ↓
Create appointment
  ↓
Create notification/reminder record if notification module exists
  ↓
Return appointment
```

Every failure must be explicit.

------------------------------------------------------------------------

# 59. AVAILABILITY --- DETAILED ALGORITHM

When doctor submits availability:

``` text
Authenticate
  ↓
Confirm doctor identity
  ↓
Validate date/time
  ↓
Validate start < end
  ↓
Find existing availability for same doctor/date
  ↓
Detect overlap
  ↓
Reject if conflict
  ↓
Store slot
  ↓
Return updated availability
```

------------------------------------------------------------------------

# 60. DOCTOR CREATION --- DETAILED ALGORITHM

Admin/receptionist flow:

``` text
Authenticate
  ↓
Authorize
  ↓
Validate user information
  ↓
Check email uniqueness
  ↓
Validate department
  ↓
Create User with DOCTOR role
  ↓
Create Doctor profile referencing User
  ↓
Return safe doctor profile
```

Use a transaction/session if the implementation and MongoDB deployment
support it and the team decides it is appropriate.

If not using a transaction, design carefully so partial creation can be
handled.

------------------------------------------------------------------------

# 61. PATIENT REGISTRATION --- DETAILED ALGORITHM

Public patient registration:

``` text
Validate body
  ↓
Normalize email
  ↓
Check duplicate email
  ↓
Hash password
  ↓
Create User with PATIENT role
  ↓
Create Patient profile
  ↓
Return safe user/patient information
```

Do not trust:

``` json
{
  "role": "ADMIN"
}
```

from a public registration request.

------------------------------------------------------------------------

# 62. API OWNERSHIP EXAMPLES

Patient:

``` text
GET /api/patients/me
```

is preferable to allowing unrestricted arbitrary patient IDs for
self-service.

For administrative access:

``` text
GET /api/patients/:id
```

can be role protected.

Use the authenticated identity wherever possible.

------------------------------------------------------------------------

# 63. APPOINTMENT OWNERSHIP EXAMPLES

A patient can:

``` text
view own appointments
cancel own eligible appointment
```

but should not be able to:

``` text
cancel another patient's appointment
change doctor
change appointment status to COMPLETED
```

A doctor can manage appointments associated with that doctor according
to workflow permissions.

Admin/receptionist can have broader operational permissions.

------------------------------------------------------------------------

# 64. DO NOT USE CLIENT-SUPPLIED AUTHORITY

Never trust:

``` json
{
  "role": "ADMIN"
}
```

or:

``` json
{
  "userId": "someone-else"
}
```

as proof of authorization.

Authorization must come from the authenticated server-side identity.

------------------------------------------------------------------------

# 65. DATA NORMALIZATION PRINCIPLE

Avoid storing:

``` text
doctorName
doctorEmail
patientName
departmentName
```

everywhere unless there is a deliberate snapshot requirement.

Prefer references and populate/query appropriately.

However, do NOT use `$lookup` everywhere.

Use MongoDB according to actual access patterns.

------------------------------------------------------------------------

# 66. MONGOOSE MODEL QUALITY

For each schema:

-   define types
-   define required fields
-   define enums where applicable
-   define references
-   define timestamps
-   define indexes
-   define sensible validation

Avoid:

``` js
field: Object
```

for everything.

The evaluator will inspect schema quality.

------------------------------------------------------------------------

# 67. ROUTE QUALITY

Routes should primarily define:

-   endpoint
-   middleware
-   validation
-   controller

Do not place giant business-logic blocks directly inside route
definitions.

Bad:

``` js
router.post("/appointments", async (req,res) => {
   // 150 lines of business logic
});
```

Prefer:

``` text
route
 → validation middleware
 → auth middleware
 → authorization middleware
 → controller/service
```

------------------------------------------------------------------------

# 68. CONTROLLER QUALITY

Controllers should:

-   receive validated request
-   call business logic
-   send standardized response
-   pass unexpected errors to error middleware

Avoid massive controllers.

If appointment logic becomes complex, extract a service.

------------------------------------------------------------------------

# 69. SERVICE LAYER

A service layer is especially justified for:

-   appointment booking
-   conflict detection
-   appointment status transitions
-   authentication
-   reporting

But don't create a service file for trivial one-line CRUD operations
just for appearance.

------------------------------------------------------------------------

# 70. TEST THE HARD PARTS FIRST

Before polishing UI, manually test:

### Authentication

-   register
-   duplicate register
-   wrong password
-   missing token
-   invalid token

### Authorization

-   patient calling admin endpoint
-   patient modifying doctor
-   doctor modifying another doctor's data

### Availability

-   valid slot
-   duplicate slot
-   overlapping slot
-   invalid time

### Appointments

-   valid booking
-   duplicate booking
-   overlapping booking
-   unavailable slot
-   invalid doctor
-   invalid patient
-   unauthorized cancellation
-   invalid status transition

These are more valuable than screenshot-only testing.

------------------------------------------------------------------------

# 71. DEMO DATA SHOULD SHOW BUSINESS RULES

For the final demo, have data prepared so the team can demonstrate:

### Successful booking

Then immediately demonstrate:

### Same-slot conflict

Then:

### Valid confirmation

Then:

### Invalid transition

Then:

### Prescription after completion

Then:

### Admin report

This creates a strong story for the evaluator.

------------------------------------------------------------------------

# 72. VIVA PREPARATION

Every important implementation decision should be explainable.

Agents should leave comments/documentation around:

### Why JWT?

Authentication and stateless API authorization.

### Why bcrypt?

Password hashing.

### Why MongoDB?

Document-oriented model and flexible healthcare application data.

### Why references?

Shared independently managed entities.

### Why embedding?

Small data read with its parent.

### Why indexes?

Frequent lookup/filter patterns.

### Why centralized error handling?

Consistent responses and protection from server crashes.

### Why validation middleware?

Server-side safety independent of frontend.

### Why status state machine?

Prevent invalid appointment lifecycle transitions.

------------------------------------------------------------------------

# 73. CODE QUALITY RULE

Prefer readable code over clever code.

Bad:

``` js
const x = a?.b?.c ?? d;
```

when it makes business logic difficult to understand.

Good code should be understandable to a student explaining it during a
viva.

Use descriptive names:

``` text
doctorId
patientId
appointmentId
currentStatus
requestedStatus
existingAppointment
```

rather than:

``` text
d
p
a
x
y
```

------------------------------------------------------------------------

# 74. COMMENTS

Do NOT comment every obvious line.

Do comment:

-   status transition matrix
-   appointment overlap logic
-   ownership checks
-   security-sensitive behavior
-   reference/embed decisions
-   unusual MongoDB queries

Example:

``` js
// A new appointment conflicts when the requested interval
// overlaps an existing active appointment for the same doctor.
```

------------------------------------------------------------------------

# 75. NO HARDCODED BUSINESS DATA

Avoid putting all doctors/departments/appointments into controller
arrays.

Use MongoDB.

Seed data belongs in a seed mechanism.

------------------------------------------------------------------------

# 76. NO FAKE ANALYTICS

Admin reports must calculate from actual MongoDB data.

For example:

``` text
Today's appointment count
```

should query actual appointments.

Do not return:

``` text
127
```

because it looks good in a screenshot.

------------------------------------------------------------------------

# 77. DATABASE REPORTING

Use MongoDB aggregation where appropriate for:

-   department load
-   appointment counts
-   doctor utilization
-   status distribution

Do not use aggregation merely because it looks advanced.

Document the reason.

------------------------------------------------------------------------

# 78. APPOINTMENT STATUS AND REPORTING

Use one consistent enum everywhere.

For example:

``` js
[
  "BOOKED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW"
]
```

Do not mix:

``` text
Booked
BOOKED
approved
Approved
completed
Completed
```

throughout the codebase.

------------------------------------------------------------------------

# 79. TIME HANDLING

Time is a common source of bugs.

Choose a consistent strategy.

Document:

-   date format
-   timezone assumption
-   slot comparison behavior

Do not compare arbitrary localized strings.

Prefer actual Date values or a consistent ISO/date-time representation.

------------------------------------------------------------------------

# 80. FINAL QUALITY GATE

Before declaring a feature complete, verify:

### Functional

-   endpoint works
-   success response works
-   failure response works

### Validation

-   missing field rejected
-   invalid field rejected

### Auth

-   unauthenticated request rejected

### Authorization

-   wrong role rejected

### Ownership

-   unauthorized resource access rejected

### Database

-   schema correct
-   references correct
-   indexes considered

### Error handling

-   malformed ID handled
-   database error handled
-   no unhandled promise rejection

### Documentation

-   endpoint documented
-   business rule documented

### Testing

-   Postman request exists

------------------------------------------------------------------------

# 81. DEFINITION OF DONE --- MEMBER 1 FOUNDATION

Member 1's first milestone is complete only when all of the following
work:

## Authentication

-   [ ] User model
-   [ ] Patient model
-   [ ] registration
-   [ ] login
-   [ ] bcrypt hashing
-   [ ] JWT
-   [ ] auth middleware
-   [ ] role authorization middleware
-   [ ] validation
-   [ ] centralized errors

## Departments

-   [ ] Department model
-   [ ] create
-   [ ] list
-   [ ] retrieve/update as appropriate
-   [ ] admin authorization
-   [ ] duplicate handling

## Doctors

-   [ ] Doctor model
-   [ ] doctor creation
-   [ ] profile retrieval
-   [ ] profile update
-   [ ] department reference validation

## Availability

-   [ ] add slots
-   [ ] retrieve slots
-   [ ] validate time
-   [ ] prevent duplicates
-   [ ] prevent overlap
-   [ ] role/ownership protection

## Appointments

-   [ ] appointment model
-   [ ] booking
-   [ ] doctor validation
-   [ ] patient validation
-   [ ] availability validation
-   [ ] conflict detection
-   [ ] ownership
-   [ ] safe response

## Infrastructure

-   [ ] `.env.example`
-   [ ] `.gitignore`
-   [ ] database connection
-   [ ] `/api/health`
-   [ ] error handler
-   [ ] validation middleware
-   [ ] README foundation
-   [ ] Postman foundation

------------------------------------------------------------------------

# 82. IMPLEMENTATION ORDER FOR THE AGENT

Do NOT attempt all 13 modules at once.

Execute in this order:

## Phase 1 --- Repository audit

Inspect everything.

## Phase 2 --- Backend foundation

Create/fix:

``` text
Express
MongoDB
Mongoose
environment configuration
error handler
async handling
response format
```

## Phase 3 --- Authentication

Implement:

``` text
User
Patient
Register
Login
JWT
bcrypt
auth middleware
RBAC
```

## Phase 4 --- Departments

Implement department model and APIs.

## Phase 5 --- Doctors

Implement doctor model and APIs.

## Phase 6 --- Availability

Implement slots and conflict rules.

## Phase 7 --- Appointments

Implement booking engine and conflict detection.

## Phase 8 --- Testing

Test Member 1 modules aggressively.

## Phase 9 --- Integration

Prepare contracts for Members 2--4.

## Phase 10 --- Documentation

Update README and Postman.

Only after these are stable should you proceed to advanced features.

------------------------------------------------------------------------

# 83. AGENT BEHAVIOR RULES

When coding:

### DO

-   inspect first
-   reason about existing code
-   make incremental changes
-   run the application
-   run tests where available
-   test APIs
-   inspect errors
-   fix root causes
-   document important decisions
-   keep architecture consistent

### DO NOT

-   blindly rewrite the repository
-   delete working code
-   create duplicate routes
-   create duplicate models
-   hardcode secrets
-   skip validation
-   skip authorization
-   rely only on frontend validation
-   make arbitrary appointment status updates
-   fake database results
-   leave broken imports
-   claim something works without running/testing it

------------------------------------------------------------------------

# 84. WHEN SOMETHING IS AMBIGUOUS

If the specification leaves a detail open:

1.  Prefer the simplest design that satisfies the mandatory requirement.
2.  Preserve consistency with the existing repository.
3.  Document the chosen assumption.
4.  Avoid adding unnecessary infrastructure.
5.  Make the choice easy for another team member to understand.

Do NOT invent requirements that are not needed.

------------------------------------------------------------------------

# 85. WHEN AN ERROR OCCURS

Do not simply patch the visible error.

Investigate:

``` text
What caused it?
Which module owns the behavior?
Could the same bug exist elsewhere?
Does the fix preserve API contracts?
Does the fix break another team member's work?
```

Then fix the root cause.

After fixing, re-run the affected path.

------------------------------------------------------------------------

# 86. WHEN YOU FINISH A TASK

Report internally/through the development workflow:

``` text
Implemented:
- ...

Files changed:
- ...

API endpoints:
- ...

Business rules:
- ...

Tests performed:
- ...

Known limitations:
- ...

Next recommended step:
- ...
```

Do not claim completion until the implementation has actually been
verified.

------------------------------------------------------------------------

# 87. FINAL PROJECT VISION

The finished MediFlow application should tell this story during a demo:

``` text
Patient registers
      ↓
Logs in securely
      ↓
Searches departments/doctors
      ↓
Views doctor's availability
      ↓
Books appointment
      ↓
Backend prevents conflicting booking
      ↓
Doctor/reception confirms appointment
      ↓
Patient attends consultation
      ↓
Appointment becomes COMPLETED
      ↓
Doctor issues prescription
      ↓
Prescription appears in patient history
      ↓
Billing record is available
      ↓
Reminder/notification is generated
      ↓
Admin sees appointment and utilization reports
```

The system should feel like one coherent application, not 13
disconnected CRUD screens.

------------------------------------------------------------------------

# 88. FINAL INSTRUCTION TO THE CODING AGENT

**Start now by inspecting the repository.**

Do not immediately generate a giant amount of code.

First determine:

1.  what already exists
2.  what is missing
3.  which architecture is currently present
4.  whether dependencies are already installed
5.  whether MongoDB configuration exists
6.  whether any teammate work is already present
7.  whether Git configuration is clean

Then implement the **Member 1 foundation** in small, testable
increments.

Your first objective is NOT visual polish.

Your first objective is:

> **A secure, validated, well-structured Node.js + Express + MongoDB
> foundation with Patient Authentication, Department Management, Doctor
> Management, Doctor Availability, and a genuinely conflict-aware
> Appointment Booking Engine.**

Once that foundation is stable, integrate the remaining modules without
breaking existing functionality.

**Build for correctness first. Build for viva second. Build for polish
third.**
