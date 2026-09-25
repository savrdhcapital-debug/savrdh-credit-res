# Savrdh Credit Platform

Production-grade modular financial CRM + digital credit marketplace being introduced alongside the existing Savrdh Credit CRM.

## Migration strategy

The legacy Vite/React CRM remains untouched while the new platform is developed under `/platform`.
This lets Savrdh preserve its controlled deal/payment/commission flow during migration and move modules incrementally.

## Portals

- Customer
- Partner
- Employee
- Credit
- Manager
- Finance
- Owner
- Future Lender

## Core modules

1. Customer onboarding and KYC-ready profiles
2. Loan applications
3. MSME financial profiles
4. Document management
5. Credit analysis
6. Lender + product master
7. Rule-driven lender matching
8. Lender submission tracking
9. Sanction workflow
10. Finance-verified disbursement
11. Commission ledger
12. Partner referral management
13. Audit logs
14. Notifications
15. Analytics
16. Versioned configurable business rules
17. Integration event outbox / adapter layer

## Mandatory financial controls

- Partner and Employee roles have no permission to verify a payment/disbursement.
- A loan becomes `disbursed` only through `scp_verify_transaction()`.
- `UTR/transaction_id` is unique at database level.
- Verified transaction amount/reference/type/application/status cannot be edited.
- Commission calculation accepts only a verified `lender_disbursement`.
- Sensitive tables have database audit triggers.
- External integrations write correlation IDs and request/response snapshots to `scp_integration_events`.

## Integration architecture

Vendor integrations must implement the adapter contract in
`src/lib/integrations/contracts.ts`.

Future providers can therefore be added for:

- Credit bureau
- GST
- Account Aggregator / banking data
- KYC
- WhatsApp
- eSign
- Lender APIs

without changing core loan/application/transaction tables.

## Database

Apply migrations in `db/migrations` to PostgreSQL. The API should set
transaction-local `app.user_id` and `app.role` before sensitive writes so
audit records retain the actor identity and role.

## Next implementation slices

- Auth/session + PostgreSQL repository
- Portal layouts and permission-aware navigation
- Customer onboarding/application screens
- Operations pipeline
- Credit workstation
- Finance verification queue
- Lender matching engine
- Analytics + notifications
