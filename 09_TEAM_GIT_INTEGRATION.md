# MediFlow — Team, Git and AI-Agent Integration Protocol

## 1. Team Ownership

### Member 1
Foundation:
- authentication,
- patient/user,
- doctor/department,
- availability,
- appointment booking engine.

### Member 2
Clinical workflow:
- appointment workflow,
- prescriptions,
- medical history,
- directory,
- notifications.

### Member 3
Business/admin:
- billing,
- search,
- admin controls,
- reports,
- dashboards.

### Member 4
Quality/integration:
- integration,
- automated tests,
- frontend/demo integration,
- AI/analytics bonus,
- final QA.

## 2. Branching

Recommended:
- `main`
- `develop` if the team chooses to use it
- `feature/member1-auth`
- `feature/member1-appointments`
- etc.

Avoid committing directly to `main` during active parallel development unless the team has explicitly chosen that workflow.

## 3. Commit Convention

Prefer:

`feat: add appointment conflict validation`
`fix: prevent inactive doctor booking`
`test: add RBAC appointment tests`
`docs: update API contract`
`refactor: extract appointment service`

## 4. Shared-Code Rule

Before changing a shared file:
1. inspect consumers,
2. identify owning member,
3. preserve compatibility,
4. communicate the change,
5. update tests/documentation.

## 5. AI Agent Rule

An agent must not:
- reset the repository,
- delete another member's work,
- regenerate the entire project,
- replace the architecture without approval,
- introduce duplicate models/services,
- silently change shared enums.

## 6. Integration Sequence

Recommended:
1. Member 1 establishes foundation/schema/auth.
2. Member 2 builds clinical modules against stable contracts.
3. Member 3 builds business/admin modules.
4. Member 4 integrates, tests, and stabilizes.
5. Team performs final end-to-end demo.

Parallel development is allowed after contracts are stable.

## 7. Merge Checklist

- no secrets,
- tests pass,
- no unrelated changes,
- schema/API changes documented,
- integration dependencies identified,
- branch rebased/updated as appropriate,
- reviewer understands changed business rules.
