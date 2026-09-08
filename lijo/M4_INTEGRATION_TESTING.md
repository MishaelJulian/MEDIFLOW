# Member 4 — Integration and Automated Testing

## Ownership

Member 4 is the integration quality owner.

## Responsibilities

- establish test infrastructure,
- integrate member modules,
- detect contract mismatches,
- run regression tests,
- prepare deterministic seed/demo data,
- verify clean startup.

## Integration Tests

At minimum cover:

Patient:
login → doctor discovery → availability → booking.

Doctor:
login → appointment → confirm → complete → prescription.

Patient:
view prescription → notification → invoice.

Admin:
login → oversight → reports.

## Contract Verification

Check:
- route paths,
- request fields,
- response envelopes,
- status enums,
- model relationships,
- authorization assumptions.

## Seed Data

Provide safe demo data:
- admin,
- doctor(s),
- patient(s),
- departments,
- availability,
- appointments,
- prescription,
- invoice,
- notifications.

Never include real credentials or personal data.

## Final Rule

Do not rewrite member modules merely to make them look uniform. Fix integration issues at the smallest safe boundary.
