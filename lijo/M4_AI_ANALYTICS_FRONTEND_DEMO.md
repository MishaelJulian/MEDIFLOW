# Member 4 — Frontend and Demo Integration

## Goal

Turn the APIs into a coherent, demonstrable application.

## Required Screens

- login/register,
- patient dashboard,
- doctor directory,
- doctor availability,
- appointment booking,
- appointment details/status,
- doctor dashboard,
- prescription,
- notifications,
- billing,
- admin dashboard/reports.

## UX Rules

- clear loading states,
- clear empty states,
- clear API errors,
- role-specific navigation,
- responsive layout,
- no sensitive data leakage.

## Business Rules in UI

Frontend should help users avoid invalid actions, but server APIs remain authoritative.

Examples:
- disable booking past slots,
- hide unauthorized actions,
- show unavailable slots,
- show status transition buttons only when relevant.

## Demo Preparation

Ensure the demo journey from the shared evaluation document can be completed without manual database edits.

Seed data must be deterministic and documented.


# AI and Analytics Bonus

## Priority

This is a bonus feature. It must never block or destabilize mandatory modules.

## Candidate Feature

Appointment no-show risk prediction.

Possible inputs:
- appointment lead time,
- historical cancellation count,
- historical no-show count,
- day/time,
- appointment type if available.

Output:
- low,
- medium,
- high risk.

## Safety

This is an academic operational analytics feature, not medical diagnosis or clinical decision support.

Do not claim medical accuracy.

## Implementation Options

A lightweight model or deterministic analytics baseline is acceptable if properly documented.

If a real ML model is used:
- record dataset/source,
- preprocessing,
- training/evaluation method,
- metrics,
- limitations.

## UI

Show the prediction only to authorized operational/admin users.

## Fallback

If the model/service is unavailable, the core application must continue working.
