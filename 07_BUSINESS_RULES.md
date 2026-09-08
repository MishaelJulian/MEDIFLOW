# MediFlow — Business Rules

## 1. Purpose

Business rules are server-side invariants. Frontend checks are helpful for UX but never sufficient.

## 2. Authentication Rules

- Email must be unique.
- Passwords are hashed.
- Inactive accounts cannot authenticate.
- Privileged roles cannot be self-created through normal patient registration.

## 3. Doctor/Department Rules

- A doctor must reference a valid department.
- A doctor must have a valid linked user account.
- Inactive doctors must not receive new appointments.
- Department deletion/deactivation must not orphan active doctor records.

## 4. Availability Rules

- Start time must precede end time.
- Invalid dates/times are rejected.
- Overlapping availability windows should be rejected or normalized according to the selected representation.
- Availability belongs to a specific doctor.
- Unauthorized users cannot modify another doctor's availability.
- Past slots cannot be newly booked.

## 5. Appointment Booking Rules

Before booking:
1. authenticated patient must be valid/active,
2. doctor must exist and be active,
3. requested date/time must be valid,
4. slot must be within doctor availability,
5. slot must not conflict with an existing appointment,
6. patient must not already have a conflicting appointment,
7. appointment must start in the future according to the application timezone policy.

### Conflict rule

For intervals A and B:

`A.start < B.end AND B.start < A.end`

If true, they overlap.

The implementation must protect against concurrent duplicate bookings as well as simple sequential checks.

## 6. Appointment State Machine

Baseline states:

`BOOKED → CONFIRMED → COMPLETED`

Possible terminal/alternate states:

`BOOKED → CANCELLED`
`CONFIRMED → CANCELLED`
`CONFIRMED → NO_SHOW`

Invalid transitions must be rejected.

The exact allowed transition matrix must be implemented consistently across API and UI.

## 7. Ownership Rules

Patients may access only their own private resources unless a role explicitly has broader permission.

Doctors may access only patients/appointments allowed by clinical workflow.

Admins have broader access but must still preserve data integrity.

## 8. Prescription Rules

- Only authorized doctors may create prescriptions.
- A prescription should be tied to an appropriate appointment/clinical encounter.
- Patients can view their own permitted prescriptions.
- Prescription records should not be silently edited by unauthorized users.

## 9. Billing Rules

- An invoice must be tied to a valid appointment/patient.
- Totals must be calculated server-side.
- Payment status must use a controlled enum.
- Patients may view their own bills.

## 10. Notification Rules

Notifications are generated from meaningful system events, such as:
- appointment creation,
- confirmation,
- cancellation,
- prescription availability,
- billing events.

## 11. Search Rules

Search must respect authorization. Do not expose private patient information through a public search endpoint.

## 12. Reporting Rules

Reports must be computed from actual persisted data and should not invent statistics.

## 13. Error Rule

A rejected business rule should return a stable, understandable error code and appropriate HTTP status, especially for conflicts such as appointment double-booking.
