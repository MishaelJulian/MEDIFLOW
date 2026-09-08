# Member 1 — Authentication and Patient Implementation

## Ownership

Member 1 owns the authentication foundation and patient/user account layer.

## Deliverables

### User model
Implement:
- name
- email
- passwordHash
- role
- phone
- isActive
- timestamps

### Patient model
Implement:
- userId
- patient profile fields
- timestamps

### Authentication
Implement:
- registration,
- login,
- password hashing,
- JWT issuance,
- auth middleware,
- safe serialization.

## Registration Rules

Normal public registration creates a PATIENT account.

Do not allow a request such as:
`{ "role": "ADMIN" }`
to create an administrator.

Validate:
- name,
- email,
- password,
- required fields,
- duplicate email.

## Login Rules

Reject:
- nonexistent user,
- wrong password,
- inactive account.

Return:
- token,
- safe user identity/role.

Never return passwordHash.

## Middleware

Create reusable:
- `authenticate`
- `authorize(...roles)` or equivalent.

Authentication middleware must attach the authenticated user identity to the request.

## Patient Endpoints

Implement according to the shared API contract:
- get own profile,
- update own profile.

Ownership must be derived from the authenticated identity, not from arbitrary user-supplied patient IDs.

## Tests

Include:
- registration success,
- duplicate email,
- invalid password,
- login success,
- wrong password,
- inactive account,
- missing token,
- invalid token,
- patient ownership.

## Agent Constraint

Do not create a second authentication system elsewhere in the repository.
