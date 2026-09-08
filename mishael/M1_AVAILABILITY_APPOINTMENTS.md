# Member 1 — Availability and Appointment Booking Engine

## Ownership

Member 1 owns the foundational scheduling and booking engine.

## Availability

Represent availability consistently with the database/API contracts.

Validate:
- doctor exists,
- date/time valid,
- start < end,
- no invalid overlap,
- authorized owner/admin action.

Prevent unauthorized modification of another doctor's availability.

## Appointment Creation

Required flow:

1. Authenticate patient.
2. Validate request.
3. Resolve doctor.
4. Verify doctor active.
5. Verify requested date/time.
6. Verify requested interval lies inside doctor availability.
7. Check patient conflict.
8. Check doctor conflict.
9. Protect the final write from race-condition double booking.
10. Create appointment.
11. Return documented response.

## Conflict Algorithm

For requested interval A and existing interval B:

`A.start < B.end && B.start < A.end`

A true result means conflict.

The check must account for appointment states that actually consume the slot.

## Race Condition Protection

A naive:
`find → check → create`
sequence can still double-book under concurrency.

Use an appropriate database/index/atomic strategy so the final persistence operation cannot silently create duplicate active bookings.

If the chosen design uses a normalized slot key, document it and index it appropriately.

## Appointment Ownership

A patient can create appointments only for themselves.

Do not trust `patientId` from the request body when it contradicts the authenticated identity.

## Cancellation

Implement only according to the shared status-transition rules.

## Tests

At minimum:
- valid booking,
- outside availability,
- past slot,
- invalid doctor,
- inactive doctor,
- patient conflict,
- doctor conflict,
- duplicate booking,
- unauthorized cancellation,
- concurrent/atomic conflict protection,
- successful booking response.

## Critical Principle

This module is the foundation for prescriptions, notifications, billing, reporting, and appointment workflow. Do not change appointment IDs/status names casually.
