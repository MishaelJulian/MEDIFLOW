# MediFlow — System Architecture

## 1. Architecture Style

Use a modular Express REST API with clear separation of concerns.

Recommended flow:

Client
→ Route
→ Authentication/Authorization Middleware
→ Validation Middleware
→ Controller
→ Service
→ Mongoose Model
→ MongoDB

Errors flow through centralized error middleware.

## 2. Recommended Backend Structure

```text
src/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  validators/
  utils/
  errors/
  tests/
  app.js
  server.js
```

Equivalent organization is acceptable if responsibilities remain clear.

## 3. Responsibilities

### Routes
- define HTTP methods and paths,
- attach middleware,
- delegate to controllers.

### Controllers
- read validated request data,
- call services,
- return documented responses,
- do not contain large business algorithms.

### Services
- contain business rules,
- coordinate multiple models,
- enforce ownership and state transitions,
- handle transactional/conflict-sensitive logic.

### Models
- define MongoDB schemas,
- indexes,
- persistence-level validation.

### Middleware
- authentication,
- authorization,
- request validation,
- error handling,
- request metadata/logging where safe.

## 4. API Versioning

Use a stable base such as:

`/api/v1`

Do not create inconsistent versions across modules.

## 5. Configuration

All environment-dependent values belong in environment variables/configuration:
- MongoDB URI
- JWT secret
- JWT expiry
- frontend origin
- application port
- optional service credentials

Provide `.env.example`.

## 6. Shared Infrastructure

Shared infrastructure should be implemented once and reused:
- database connection,
- JWT middleware,
- role middleware,
- validation utilities,
- error classes,
- response helpers,
- pagination helpers,
- logging utilities.

Do not create competing versions of these utilities.

## 7. Architectural Change Protocol

If a member needs to change:
- a shared model,
- API response format,
- authentication behavior,
- route convention,
- status enum,
- ID relationship,

the change must be documented and communicated before merging.
