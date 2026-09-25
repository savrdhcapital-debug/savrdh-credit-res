-- Savrdh Credit marketplace hardening: additive, idempotent where practical.
-- Applied to Supabase project savrdh-credit-resolution on 2026-09-25.

create or replace function sfs_private.prevent_audit_mutation()
returns trigger
language plpgsql
security definer
set search_path = 'pg_catalog','public'
as $$
begin
  raise exception 'Audit logs are immutable';
end;
$$;

revoke all on function sfs_private.prevent_audit_mutation() from public, anon, authenticated;

drop trigger if exists trg_sfs_audit_logs_immutable on public.sfs_audit_logs;
create trigger trg_sfs_audit_logs_immutable
before update or delete on public.sfs_audit_logs
for each row execute function sfs_private.prevent_audit_mutation();

drop trigger if exists trg_audit_sfs_loan_applications on public.sfs_loan_applications;
create trigger trg_audit_sfs_loan_applications after insert or update or delete on public.sfs_loan_applications
for each row execute function sfs_private.audit_sensitive_row();

drop trigger if exists trg_audit_sfs_lenders on public.sfs_lenders;
create trigger trg_audit_sfs_lenders after insert or update or delete on public.sfs_lenders
for each row execute function sfs_private.audit_sensitive_row();

drop trigger if exists trg_audit_sfs_lender_products on public.sfs_lender_products;
create trigger trg_audit_sfs_lender_products after insert or update or delete on public.sfs_lender_products
for each row execute function sfs_private.audit_sensitive_row();

drop trigger if exists trg_audit_sfs_lender_matches on public.sfs_lender_matches;
create trigger trg_audit_sfs_lender_matches after insert or update or delete on public.sfs_lender_matches
for each row execute function sfs_private.audit_sensitive_row();

drop trigger if exists trg_audit_sfs_msme_financial_profiles on public.sfs_msme_financial_profiles;
create trigger trg_audit_sfs_msme_financial_profiles after insert or update or delete on public.sfs_msme_financial_profiles
for each row execute function sfs_private.audit_sensitive_row();

drop trigger if exists trg_audit_sfs_partner_referrals on public.sfs_partner_referrals;
create trigger trg_audit_sfs_partner_referrals after insert or update or delete on public.sfs_partner_referrals
for each row execute function sfs_private.audit_sensitive_row();

drop policy if exists "owner manages lender master" on public.sfs_lenders;
create policy "owner manages lender master" on public.sfs_lenders for all to authenticated
using (sfs_private.has_role(array['manager','owner']))
with check (sfs_private.has_role(array['manager','owner']));

drop policy if exists "owner manages lender products" on public.sfs_lender_products;
create policy "owner manages lender products" on public.sfs_lender_products for all to authenticated
using (sfs_private.has_role(array['credit','manager','owner']))
with check (sfs_private.has_role(array['credit','manager','owner']));

drop policy if exists "credit manages lender matches" on public.sfs_lender_matches;
create policy "credit manages lender matches" on public.sfs_lender_matches for all to authenticated
using (sfs_private.has_role(array['credit','manager','owner']))
with check (sfs_private.has_role(array['credit','manager','owner']));

drop policy if exists "credit manages lender submissions" on public.sfs_lender_submissions;
create policy "credit manages lender submissions" on public.sfs_lender_submissions for all to authenticated
using (sfs_private.has_role(array['credit','manager','owner']))
with check (sfs_private.has_role(array['credit','manager','owner']));

drop policy if exists "credit manages sanctions" on public.sfs_sanctions;
create policy "credit manages sanctions" on public.sfs_sanctions for all to authenticated
using (sfs_private.has_role(array['credit','manager','owner']))
with check (sfs_private.has_role(array['credit','manager','owner']));

drop policy if exists "customer manages own msme profile" on public.sfs_msme_financial_profiles;
create policy "customer manages own msme profile" on public.sfs_msme_financial_profiles for insert to authenticated
with check (
  customer_id in (select id from public.sfs_customers where user_id=auth.uid())
  or sfs_private.has_role(array['employee','credit','manager','owner'])
);

drop policy if exists "customer updates own unverified msme profile" on public.sfs_msme_financial_profiles;
create policy "customer updates own unverified msme profile" on public.sfs_msme_financial_profiles for update to authenticated
using (
  (customer_id in (select id from public.sfs_customers where user_id=auth.uid()) and verification_status in ('draft','needs_information'))
  or sfs_private.has_role(array['employee','credit','manager','owner'])
)
with check (
  (customer_id in (select id from public.sfs_customers where user_id=auth.uid()) and verification_status in ('draft','needs_information'))
  or sfs_private.has_role(array['employee','credit','manager','owner'])
);

drop policy if exists "partner creates own referrals" on public.sfs_partner_referrals;
create policy "partner creates own referrals" on public.sfs_partner_referrals for insert to authenticated
with check (
  partner_id in (select id from public.sfs_partners where user_id=auth.uid())
  or sfs_private.has_role(array['employee','manager','owner'])
);

drop policy if exists "staff updates referrals" on public.sfs_partner_referrals;
create policy "staff updates referrals" on public.sfs_partner_referrals for update to authenticated
using (sfs_private.has_role(array['employee','credit','manager','owner']))
with check (sfs_private.has_role(array['employee','credit','manager','owner']));

drop policy if exists "customer updates own draft application" on public.sfs_loan_applications;
create policy "customer updates own draft application" on public.sfs_loan_applications for update to authenticated
using (sfs_private.is_customer_owner(customer_id) and status in ('draft','needs_information'))
with check (sfs_private.is_customer_owner(customer_id) and status in ('draft','needs_information'));

drop policy if exists "operations manage applications" on public.sfs_loan_applications;
create policy "operations manage applications" on public.sfs_loan_applications for update to authenticated
using (sfs_private.has_role(array['employee','credit','manager','owner']))
with check (sfs_private.has_role(array['employee','credit','manager','owner']));

grant select,insert,update on public.sfs_msme_financial_profiles to authenticated;
grant select,insert,update on public.sfs_partner_referrals to authenticated;
grant select,insert,update,delete on public.sfs_lender_matches to authenticated;
grant select,insert,update,delete on public.sfs_lender_submissions to authenticated;
grant select,insert,update,delete on public.sfs_sanctions to authenticated;
grant select,insert,update,delete on public.sfs_lenders to authenticated;
grant select,insert,update,delete on public.sfs_lender_products to authenticated;
grant select,update on public.sfs_loan_applications to authenticated;

create index if not exists idx_sfs_disbursements_application_id on public.sfs_disbursements(application_id);
create index if not exists idx_sfs_disbursements_sanction_id on public.sfs_disbursements(sanction_id);
create index if not exists idx_sfs_sanctions_application_id on public.sfs_sanctions(application_id);
create index if not exists idx_sfs_sanctions_submission_id on public.sfs_sanctions(lender_submission_id);
create index if not exists idx_sfs_lender_submissions_application_id on public.sfs_lender_submissions(application_id);
create index if not exists idx_sfs_lender_submissions_product_id on public.sfs_lender_submissions(lender_product_id);
create index if not exists idx_sfs_lender_matches_application_id on public.sfs_lender_matches(application_id);
create index if not exists idx_sfs_lender_matches_product_id on public.sfs_lender_matches(lender_product_id);
create index if not exists idx_sfs_partner_referrals_partner_id on public.sfs_partner_referrals(partner_id);
create index if not exists idx_sfs_partner_referrals_application_id on public.sfs_partner_referrals(application_id);
create index if not exists idx_sfs_msme_profiles_customer_id on public.sfs_msme_financial_profiles(customer_id);
create index if not exists idx_sfs_commissions_application_id on public.sfs_commissions(loan_application_id);
create index if not exists idx_sfs_audit_logs_actor on public.sfs_audit_logs(actor_user_id);
create index if not exists idx_sfs_audit_logs_entity on public.sfs_audit_logs(entity_type,entity_id,created_at desc);
