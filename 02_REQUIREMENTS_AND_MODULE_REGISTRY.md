# MediFlow — Requirements and Module Registry

## 1. Purpose

This is the single source of truth for module ownership and completion.

## 2. Module Registry

| ID | Module | Owner | Priority | Status |
|---|---|---|---|---|
| M01 | Authentication & Patient Profile | Member 1 | Mandatory | `DEMO_READY` |
| M02 | Doctor & Department Management | Member 1 | Mandatory | `DEMO_READY` |
| M03 | Doctor Availability | Member 1 | Mandatory | `DEMO_READY` |
| M04 | Appointment Booking Engine | Member 1 | Mandatory | `DEMO_READY` |
| M05 | Appointment Workflow | Member 2 | Mandatory | `DEMO_READY` |
| M06 | Prescription Management | Member 2 | Mandatory | `DEMO_READY` |
| M07 | Medical History | Member 2 | Mandatory | `DEMO_READY` |
| M08 | Directory | Member 2 | Mandatory | `DEMO_READY` |
| M09 | Notifications | Member 2 | Mandatory | `DEMO_READY` |
| M10 | Billing & Invoices | Member 3 | Mandatory | `DEMO_READY` |
| M11 | Search | Member 3 | Mandatory | `DEMO_READY` |
| M12 | Admin Controls | Member 3 | Mandatory | `DEMO_READY` |
| M13 | Reports & Dashboards | Member 3 | Mandatory | `DEMO_READY` |
| M14 | Integration & Automated Testing | Member 4 | Quality/Integration | `DEMO_READY` |
| M15 | AI/Analytics | Member 4 | Bonus | `DEMO_READY` |
| M16 | Frontend/Demo Integration | Member 4 | Quality/Integration | `DEMO_READY` |

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
