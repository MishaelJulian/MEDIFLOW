# Member 2 — Prescription and Medical History

## Prescription

A prescription must be linked to:
- appointment,
- doctor,
- patient.

Prescription items should contain bounded fields:
- medicine,
- dosage,
- frequency,
- duration,
- instructions.

## Rules

- only authorized doctor can create,
- prescription should relate to an appropriate appointment,
- patient can view own prescription,
- unauthorized users cannot access another patient's prescription.

## Medical History

Expose authorized historical clinical information based on actual stored records.

Do not invent diagnoses or medical events.

Prefer references to source records rather than copying complete records into multiple collections.

## Privacy

Medical history is private by default.

Authorization must be enforced server-side.

## Tests

- doctor creates valid prescription,
- wrong doctor rejected,
- unrelated appointment rejected,
- patient sees own prescription,
- other patient blocked,
- invalid prescription item rejected.


# Appointment Workflow



## Ownership

Build workflow operations on top of Member 1's appointment entity and booking engine.

## Responsibilities

- appointment listing by authorized role,
- confirmation,
- completion,
- cancellation,
- no-show where supported,
- status history if implemented.

## State Machine

Baseline:

`BOOKED → CONFIRMED → COMPLETED`

Alternate:

`BOOKED → CANCELLED`
`CONFIRMED → CANCELLED`
`CONFIRMED → NO_SHOW`

Reject undefined transitions.

## Authorization

Patient:
- view own appointments,
- perform only permitted cancellation/action.

Doctor:
- view assigned appointments,
- perform permitted clinical workflow actions.

Admin/receptionist:
- perform explicitly authorized operational actions.

## Tests

Test every valid and invalid transition and ownership boundary.

Do not duplicate the appointment conflict algorithm. Reuse Member 1's service/domain logic.
