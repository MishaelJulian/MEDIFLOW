# MediFlow — Authentication, RBAC and Security

## 1. Authentication

Implement secure authentication using:
- password hashing with bcrypt/bcryptjs,
- JWT or another approved secure token mechanism,
- environment-stored secret,
- expiration,
- protected route middleware.

Registration must never accept unrestricted creation of privileged roles.

## 2. Login

Login flow:
1. validate input,
2. locate user,
3. verify password hash,
4. reject inactive accounts,
5. issue token,
6. return safe user information and token according to API contract.

Never return:
- password,
- passwordHash,
- secret values.

## 3. Authorization

Authentication answers:
> Who are you?

Authorization answers:
> What may you do?

Ownership answers:
> Are you allowed to access this particular resource?

All three must be considered.

## 4. Roles

Baseline roles:
- PATIENT
- DOCTOR
- RECEPTIONIST
- ADMIN

Exact role names must remain consistent throughout the codebase.

## 5. Permission Principles

### Patient
- own profile,
- own appointments,
- own permitted medical records/prescriptions,
- own notifications,
- own bills.

### Doctor
- own profile/availability according to policy,
- assigned appointments,
- permitted patient clinical data,
- prescriptions for appropriate consultations.

### Receptionist
- operational appointment/search workflows permitted by policy,
- no unrestricted administrative privileges.

### Admin
- system-level management,
- reports,
- user/doctor/department management,
- privileged controls.

## 6. Security Controls

Implement as appropriate:
- Helmet/security headers,
- CORS restriction,
- request validation,
- rate limiting for sensitive authentication endpoints if feasible,
- safe error messages,
- safe logging,
- environment configuration,
- input sanitization appropriate to the stack.

## 7. Secrets

Never commit:
- `.env`
- database credentials
- JWT secrets
- third-party API keys.

Commit `.env.example` with placeholder names only.

## 8. Sensitive Healthcare Data

For this academic project:
- minimize sensitive information,
- never expose another patient's data,
- enforce server-side authorization,
- avoid logging medical details unnecessarily.

## 9. Security Acceptance Tests

At minimum test:
- invalid credentials,
- expired/invalid token,
- missing token,
- wrong role,
- accessing another patient's resource,
- inactive account,
- privileged role creation restriction.
