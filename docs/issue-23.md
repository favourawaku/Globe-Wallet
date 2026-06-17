# Issue #23 — Send Form: Contact Selection & Send Confirmation

## Design Rationale

The send form was refactored from a single-step fire-and-forget into a **two-step flow**:

1. **Form step** — recipient selection (contact picker or manual address), amount, asset, optional memo, and client-side validation.
2. **Confirmation step** — `SendSummary` displays all fields and the estimated fee before the user commits.

This pattern prevents accidental sends, mirrors real wallet UX (Coinbase, Stellar Wallets), and makes each step independently testable.

### Contact Picker

A `ContactPicker` UI component (`components/ui/contact-picker.tsx`) provides:
- Live search filtering via `ContactService.search(query)`
- Keyboard-accessible item list (`role="listbox"`, `tabIndex`, `Enter` key support)
- A clear/remove button when a contact is selected
- When a contact has a known `address`, the manual address field is hidden

### Service Layer

`ContactService` (`lib/services/contact.service.ts`) is a pure, injectable class:
- `getContacts()` — full list
- `search(query)` — case-insensitive name/handle filter
- `getById(id)` — lookup

`useContacts` hook (`hooks/useContacts.ts`) wraps the service for React consumption.

### API Route

`POST /api/send` accepts `SendRequest` and returns `SendResponse`. It delegates to `WalletService.sendPayment` after validating address and amount. It is fully mockable in integration tests.

---

## API Contracts

### `POST /api/send`

**Request body** (`SendRequest`):
```json
{
  "destination": "G...",
  "amount": 10.5,
  "asset": "XLM",
  "memo": "optional"
}
```

**Success response** (`200`):
```json
{
  "success": true,
  "hash": "0x...",
  "status": "completed"
}
```

**Validation error** (`422`):
```json
{
  "success": false,
  "error": "Invalid Stellar destination address"
}
```

**Missing fields** (`400`):
```json
{
  "success": false,
  "error": "Missing required fields: destination, amount, asset"
}
```

---

## New/Modified Types (`lib/types.ts`)

| Type | Description |
|---|---|
| `Contact.address?` | Optional on-chain Stellar address for a contact |
| `ContactsState` | Shape of `useContacts` return value |
| `SendConfirmation` | Payload passed from form step to confirmation step |
| `SendRequest` | `/api/send` request body |
| `SendResponse` | `/api/send` response body |

---

## Test Instructions

### Unit tests
```bash
npm run test:unit
# or specifically:
npx jest tests/unit/services/contact.service.test.ts
```

### Component tests
```bash
npm run test:component
# or specifically:
npx jest tests/component/send-form.test.tsx
```

### Integration tests
```bash
npm run test:integration
# or specifically:
npx jest tests/integration/send-flow.test.tsx
```

### E2E tests
```bash
npm run test:e2e -- --grep "Send Flow"
# requires dev server running:
pnpm dev
```

### All tests with coverage
```bash
npm run test:coverage
```

---

## Rollout / Migration Notes

- `Contact.address` is optional — existing seed data without an address still works; the contact can be selected but the user must supply a manual address.
- No database schema changes required (mock DB only).
- The `/api/send` route is additive — no existing routes modified.
- `SendForm` is a drop-in replacement; the `app/send/page.tsx` import is unchanged.

---

## Security Note

- **Never commit private keys or mnemonics.** All Stellar keys used in tests are mock/testnet values.
- The `MERGE_ANALYTICS_URL` is stored as a GitHub repository secret and never hardcoded.
- The `/api/send` route runs `validateAddress` before executing any transaction.
- Testnet and mainnet are controlled via the `NEXT_PUBLIC_STELLAR_NETWORK` environment variable. Always verify this is set to `testnet` in non-production environments.
- Fee and balance checks happen client-side (UX) and should be duplicated server-side / on-chain in production.

---

## QA Checklist

- [ ] Contact search filters correctly by name and handle
- [ ] Selecting a contact hides the manual address input
- [ ] Clear button removes selected contact and restores address input
- [ ] Invalid address shows accessible error (`role="alert"`)
- [ ] Zero / negative amount blocked with error
- [ ] Insufficient balance blocked with error
- [ ] Review step shows `SendSummary` with correct amount, fee, and recipient
- [ ] Back button returns to form without data loss
- [ ] Confirm button calls `sendPayment` with correct args including optional memo
- [ ] Success message shown and form reset after completed send
- [ ] Service error surfaces as inline error, returns user to form
- [ ] All tests pass in CI
- [ ] No TypeScript errors (`tsc --noEmit`)
