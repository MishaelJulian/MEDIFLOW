# Member 3 — Billing and Invoices

## Ownership

Build billing around the stable appointment/patient identities.

## Invoice

Suggested fields:
- appointmentId
- patientId
- invoice number
- lineItems
- subtotal
- tax/discount if used
- total
- paymentStatus
- timestamps

## Rules

- appointment must exist,
- patient relationship must be valid,
- totals calculated server-side,
- controlled payment status enum,
- patient can view own invoice,
- privileged roles can perform permitted administrative billing actions.

## Suggested statuses

`PENDING`
`PAID`
`FAILED`
`REFUNDED`

Only implement transitions the team explicitly supports.

## No Real Payment Gateway Required

For a college demo, payment can be simulated. Do not introduce real payment credentials.

## Tests

- invoice creation,
- total calculation,
- invalid appointment,
- wrong patient ownership,
- status transitions,
- unauthorized access.
