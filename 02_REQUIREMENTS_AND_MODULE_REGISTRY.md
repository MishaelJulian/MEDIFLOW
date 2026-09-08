# MediFlow — Requirements and Module Registry

## 1. Purpose

This is the single source of truth for module ownership and completion.

## 2. Module Registry

| ID | Module | Owner | Priority |
|---|---|---|---|
| M01 | Authentication & Patient Profile | Member 1 | Mandatory |
| M02 | Doctor & Department Management | Member 1 | Mandatory |
| M03 | Doctor Availability | Member 1 | Mandatory |
| M04 | Appointment Booking Engine | Member 1 | Mandatory |
| M05 | Appointment Workflow | Member 2 | Mandatory |
| M06 | Prescription Management | Member 2 | Mandatory |
| M07 | Medical History | Member 2 | Mandatory |
| M08 | Directory | Member 2 | Mandatory |
| M09 | Notifications | Member 2 | Mandatory |
| M10 | Billing & Invoices | Member 3 | Mandatory |
| M11 | Search | Member 3 | Mandatory |
| M12 | Admin Controls | Member 3 | Mandatory |
| M13 | Reports & Dashboards | Member 3 | Mandatory |
| M14 | Integration & Automated Testing | Member 4 | Quality/Integration |
| M15 | AI/Analytics | Member 4 | Bonus |
| M16 | Frontend/Demo Integration | Member 4 | Quality/Integration |

## 3. Completion States

Use:
- `NOT_STARTED`
- `IN_PROGRESS`
- `IMPLEMENTED`
- `TESTED`
- `INTEGRATED`
- `DEMO_READY`

A module must not be described as complete merely because its files exist.

## 4. Cross-Module Dependencies

- Authentication is foundational to all protected modules.
- User/Patient/Doctor/Department models are shared dependencies.
- Availability feeds appointment booking.
- Appointment booking feeds appointment workflow, notifications, prescriptions, billing, and reporting.
- Appointment identity must remain stable across all downstream modules.
- API response conventions apply to every module.

## 5. Acceptance Rule

Every module must have:
- defined inputs,
- defined outputs,
- business rules,
- authorization rules,
- persistence requirements,
- error behavior,
- tests,
- integration notes.
