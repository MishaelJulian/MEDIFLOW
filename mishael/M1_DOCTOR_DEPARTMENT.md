# Member 1 — Doctor and Department Implementation

## Ownership

Member 1 owns doctor and department domain foundations.

## Department

Implement:
- create,
- list,
- retrieve,
- update,
- deactivate/delete strategy.

Rules:
- name required,
- duplicate active department names should be prevented,
- deactivation must not silently orphan doctors.

Administrative operations must be protected.

## Doctor

Implement:
- create/link doctor to User,
- retrieve,
- update,
- list/filter basic fields,
- assign department,
- active/inactive state.

Rules:
- linked User must exist,
- linked User should have DOCTOR role,
- department must exist,
- inactive doctor cannot receive new appointments.

## Relationship

`Doctor.userId → User._id`
`Doctor.departmentId → Department._id`

Do not duplicate credentials inside Doctor.

## Authorization

Patients may view permitted public doctor information.

Only authorized roles may create/update doctors.

Doctors must not modify another doctor's privileged account data.

## Tests

- invalid department,
- invalid user,
- wrong user role,
- duplicate/invalid department,
- inactive doctor booking prevention,
- authorization failures,
- successful doctor creation.
