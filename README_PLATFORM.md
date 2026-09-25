# Savrdh Credit Platform
Production-grade modular financial CRM and digital credit marketplace on Next.js, React, TypeScript and PostgreSQL/Supabase.

## Portals
Customer, Partner, Employee, Credit, Manager, Finance, Owner and future Lender.

## Financial controls
- Partner/employee cannot mark a loan WON/disbursed.
- Disbursement and payment verification requires Finance/Owner.
- Duplicate UTR/transaction references are rejected at database level.
- Commissions are created only from verified configured basis events.
- Verified financial rows are locked; correction is additive/reversal, not history editing.
- Sensitive actions write audit logs.

## Integration boundaries
Provider-neutral contracts exist for bureau, GST, banking data, KYC, WhatsApp/messaging, eSign and lender APIs. Canonical application/payment/disbursement tables do not depend on provider payloads.

## Environment
Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in Vercel. Keep all provider/service secrets server-only.
