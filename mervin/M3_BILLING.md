# Member 3 — Billing and Invoices (Module M10)

## 1. Overview & Ownership

Member 3 owns the financial and invoice management module (`M10`) of the MediFlow Hospital Management System. It handles automatic invoice generation linked to verified patient appointments, server-side pricing calculations (consultation fees, custom diagnostic line items, discounts, taxes), role-based access control, simulated payment processing, administrative status overrides (e.g. refund/cancellation adjustments), and real-time patient notifications.

---

## 2. Invoice Data Model & Schema

- **Mongoose Model**: `src/models/Invoice.js`
- **Fields**:
  - `invoiceNumber` (String, unique indexed, auto-formatted `INV-XXXXXX-XXX`)
  - `appointmentId` (ObjectId, ref: `'Appointment'`, required)
  - `patientId` (ObjectId, ref: `'Patient'`, required)
  - `doctorId` (ObjectId, ref: `'Doctor'`, optional)
  - `lineItems` (Array of subdocuments):
    - `description` (String, required)
    - `amount` (Number, min: 0)
    - `quantity` (Number, min: 1, default: 1)
  - `subtotal` (Number, min: 0, server-calculated)
  - `tax` (Number, min: 0, default: 0)
  - `discount` (Number, min: 0, default: 0)
  - `total` (Number, min: 0, server-calculated as `Math.max(0, subtotal + tax - discount)`)
  - `paymentStatus` (Enum: `['PENDING', 'PAID', 'FAILED', 'REFUNDED']`, default: `'PENDING'`)
  - `paidAt` (Date, timestamp of confirmed payment)
  - `paymentMethod` (Enum: `['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'INSURANCE', 'UPI', 'ONLINE_SIMULATION']`)
  - `notes` (String, max 500 chars)

---

## 3. Business & Security Rules

1. **Appointment Validation**:
   - Invoices can only be generated for existing appointments.
   - If line items are omitted during creation, the system automatically falls back to the assigned doctor's consultation fee.
   - Only one invoice is created per appointment; idempotency is maintained.
2. **Server-Side Financial Integrity**:
   - Subtotals and final totals are calculated strictly on the server.
   - Totals are constrained to never be negative (`Math.max(0, ...)`).
3. **Role-Based Access Control (RBAC)**:
   - `PATIENT`: Can view only their own invoices (`/api/v1/billing/my-invoices` or `/api/v1/billing/:id`). Attempting to view or pay another patient's invoice returns `403 Forbidden`.
   - `DOCTOR`: Can generate invoices and view invoices for consultations.
   - `RECEPTIONIST` & `ADMIN`: Can create invoices, list all clinic invoices with filters, process payments, and perform status updates (e.g., mark `REFUNDED` or `FAILED`).
4. **Payment Processing Simulation**:
   - Supports instant simulated online checkout, UPI, cards, and cash.
   - Payment transitions status from `PENDING` to `PAID`, stamps `paidAt`, and prevents duplicate payments (`400 Bad Request` if already paid).
5. **Real-time Notifications**:
   - Generates immediate `BILLING_EVENT` notifications sent to the patient upon invoice generation, payment confirmation, and status changes.

---

## 4. API Endpoints

| Method | Endpoint | Authorized Roles | Description |
|---|---|---|---|
| `POST` | `/api/v1/billing` | `DOCTOR`, `RECEPTIONIST`, `ADMIN` | Create invoice for an appointment |
| `GET` | `/api/v1/billing` | `RECEPTIONIST`, `ADMIN` | Query all invoices (filter by status, patient, doctor) |
| `GET` | `/api/v1/billing/my-invoices` | `PATIENT` | List current authenticated patient's invoices |
| `GET` | `/api/v1/billing/:id` | `PATIENT` (owner), `DOCTOR`, `RECEPTIONIST`, `ADMIN` | Retrieve single invoice details |
| `POST` | `/api/v1/billing/:id/pay` | `PATIENT` (owner), `RECEPTIONIST`, `ADMIN` | Process simulated invoice payment |
| `PATCH` | `/api/v1/billing/:id/status` | `RECEPTIONIST`, `ADMIN` | Update payment status (e.g. `REFUNDED`, `FAILED`) |

---

## 5. Test Suite Verification

Comprehensive test coverage in `tests/billing.test.js` verified with 100% pass rate:
- `TC-BILL-001`: Create invoice with doctor default fee
- `TC-BILL-002`: Compute custom line items, tax, and discount
- `TC-BILL-003`: Idempotent handling of existing invoice
- `TC-BILL-004`: Rejection of unauthorized invoice creation by patients
- `TC-BILL-005`: Patient retrieving own invoice vs blocking other patients (403)
- `TC-BILL-006`: Administrative querying of all invoices
- `TC-BILL-007`: Successful payment simulation & status transition to `PAID`
- `TC-BILL-008`: Rejection of double payment on paid invoices
- `TC-BILL-009`: Administrative status change to `REFUNDED`
- `TC-BILL-010`: Rejection of invalid status enums
