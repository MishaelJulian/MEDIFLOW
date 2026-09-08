# MediFlow — Database Schema Specification

## 1. General Rules

Use MongoDB with Mongoose.

Every schema must:
- use timestamps where appropriate,
- validate important fields,
- use references when relationships are better represented by references,
- use embedding only where data is tightly coupled and bounded,
- define indexes for common lookup/conflict operations.

Never store plaintext passwords.

## 2. Core Collections

### User

Suggested fields:
- `_id`
- `name`
- `email`
- `passwordHash`
- `role`
- `phone`
- `isActive`
- timestamps

Constraints:
- email unique,
- passwordHash never returned by normal API serializers,
- role restricted to documented enum.

### Patient

Suggested fields:
- `_id`
- `userId`
- date of birth
- gender
- blood group if required
- address/contact details as appropriate
- timestamps

`userId` references User.

### Doctor

Suggested fields:
- `_id`
- `userId`
- `departmentId`
- specialization
- license/employee identifier if appropriate for demo
- profile information
- active status
- timestamps

`userId` references User.
`departmentId` references Department.

### Department

Suggested fields:
- `_id`
- name
- description
- active status
- timestamps

Department name should have an appropriate uniqueness strategy.

### DoctorAvailability

Suggested fields:
- `_id`
- doctorId
- date/day or recurrence representation
- startTime
- endTime
- slot duration where applicable
- active status
- timestamps

The exact representation must be consistent across booking and UI.

### Appointment

Suggested fields:
- `_id`
- patientId
- doctorId
- departmentId where useful/denormalized
- appointment date
- startTime
- endTime
- status
- reason/notes if permitted
- timestamps

Appointment identity must remain stable.

## 3. Downstream Collections

### Prescription
References:
- appointment
- doctor
- patient

Contains bounded prescription items with medicine, dosage, frequency, duration, instructions.

### MedicalHistory
Can reference patient and relevant appointments/clinical records. Avoid uncontrolled duplication of full records.

### Notification
References recipient user/patient/doctor as appropriate.
Fields include type, message, read status, related entity, timestamps.

### Invoice/Billing
References appointment and patient.
Contains line items, totals, payment status, timestamps.

## 4. Relationship Principles

Use references for:
- User ↔ Patient
- User ↔ Doctor
- Doctor ↔ Department
- Appointment ↔ Patient
- Appointment ↔ Doctor
- Prescription ↔ Appointment
- Invoice ↔ Appointment

Embedding is acceptable for bounded child structures such as invoice line items or prescription items.

## 5. Indexing

At minimum consider:
- User email
- Doctor department/specialization
- Appointment doctor + date + start/end/status
- Appointment patient + date
- Notification recipient + read status
- Invoice patient + status
- search fields required by the actual implementation

## 6. Data Integrity

Database-level uniqueness/indexes are not a substitute for service-level business rules. Conflict-sensitive appointment operations must also perform server-side validation and use an appropriate atomic/unique strategy.

## 7. Schema Change Rule

A shared schema change must:
1. identify affected modules,
2. preserve compatibility where possible,
3. update this file,
4. update API contracts if necessary,
5. update tests.
