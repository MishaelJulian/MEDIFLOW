# Member 3 — Search, Admin Controls and Reports

## Search

Implement authorized search across appropriate entities.

Support useful filters such as:
- doctor specialization,
- department,
- active status,
- appointment status/date.

Use indexes where justified.

Never expose private patient information through an unrestricted search endpoint.

## Admin Controls

Admin can:
- manage users,
- manage doctors,
- manage departments,
- oversee appointments,
- activate/deactivate accounts as permitted.

Do not let admin operations bypass integrity constraints.

## Reports

Reports should derive from persisted data.

Useful metrics:
- appointments per day,
- appointments by department,
- completed/cancelled/no-show counts,
- doctor workload,
- patient counts,
- revenue/billing summaries.

## Tests

- admin access succeeds,
- non-admin blocked,
- search filters correct,
- private data protected,
- report totals match fixture data.


# Dashboards



## Goal

Create useful role-specific dashboards using real API data.

## Admin Dashboard

Show:
- total patients,
- total doctors,
- departments,
- today's appointments,
- appointment status distribution,
- revenue summary,
- cancellation/no-show metrics where data exists.

## Doctor Dashboard

Show:
- today's appointments,
- upcoming appointments,
- completed consultations,
- relevant workload.

## Patient Dashboard

Show:
- next appointment,
- appointment history,
- prescriptions,
- billing summary,
- notifications.

## Rules

- Dashboard values must come from APIs.
- Do not hard-code statistics.
- Respect authorization.
- Keep loading/error/empty states explicit.
- Do not move sensitive business logic into the frontend.
