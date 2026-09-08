# Member 2 — Directory and Notifications

## Directory

Provide authorized directory functionality for:
- doctors,
- patients where permitted,
- departments.

Doctor directory may expose:
- name,
- specialization,
- department,
- availability summary,
- active status.

Do not expose private patient data through public search/listing.

## Notifications

Notification fields:
- recipient,
- type,
- message,
- related entity,
- read/unread,
- timestamps.

Generate notifications for meaningful events:
- appointment created,
- appointment confirmed,
- appointment cancelled,
- prescription available,
- billing event where appropriate.

## API

Implement list and mark-read behavior using shared API conventions.

## Tests

- correct recipient,
- unauthorized notification access blocked,
- read state update,
- event creates notification,
- directory privacy.
