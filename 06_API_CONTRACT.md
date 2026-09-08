# MediFlow — API Contract

## 1. Global Conventions

Base path:

`/api/v1`

Content type:
`application/json`

Use a consistent response envelope.

Success:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Human-readable message",
  "errorCode": "STABLE_MACHINE_CODE"
}
```

## 2. HTTP Semantics

Typical usage:
- `GET` retrieve
- `POST` create/action
- `PATCH` partial update
- `PUT` full replacement only where justified
- `DELETE` remove/deactivate

Use:
- 200 successful retrieval/update
- 201 successful creation
- 204 where intentionally no response body
- 400 invalid input
- 401 unauthenticated
- 403 forbidden
- 404 resource not found
- 409 business conflict/duplicate
- 422 where the team explicitly adopts semantic validation errors
- 500 unexpected server failure

## 3. Endpoint Families

### Auth
- `POST /auth/register`
- `POST /auth/login`
- optional token/session endpoint as needed

### Patients
- `GET /patients/me`
- `PATCH /patients/me`

### Departments
- `GET /departments`
- `POST /departments`
- `GET /departments/:id`
- `PATCH /departments/:id`
- `DELETE /departments/:id` or deactivate

### Doctors
- `GET /doctors`
- `POST /doctors`
- `GET /doctors/:id`
- `PATCH /doctors/:id`
- availability endpoints

### Appointments
- `POST /appointments`
- `GET /appointments`
- `GET /appointments/:id`
- `PATCH /appointments/:id`
- cancellation/status actions as documented

### Prescriptions
- create/list/get endpoints tied to authorized appointments.

### Medical History
- authorized patient-history retrieval endpoints.

### Notifications
- list, read/mark-read.

### Billing
- invoice retrieval and permitted payment-status operations.

### Search
- documented search endpoint(s).

### Admin
- protected administrative endpoints.

### Reports
- protected report endpoints.

## 4. Endpoint Documentation Requirement

Every implemented endpoint must document:
- method/path,
- authentication,
- role,
- request body/query/path params,
- success response,
- errors,
- business rules.

## 5. Contract Stability

Do not casually rename:
- fields,
- status values,
- route paths,
- response envelope properties.

If a change is necessary, update this document and affected modules.
