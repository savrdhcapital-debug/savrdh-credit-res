-- Savrdh Credit Platform core PostgreSQL schema
-- Additive architecture: preserves legacy CRM while introducing production-grade modules.

create extension if not exists pgcrypto;

create type scp_role as enum (
  'customer','partner','employee','credit','manager','finance','owner','lender'
);

create type scp_application_status as enum (
  'draft','submitted','under_review','credit_review','matched','submitted_to_lender',
  'sanctioned','disbursement_pending_verification','disbursed','rejected','cancelled'
);

create type scp_txn_status as enum ('pending','verified','rejected','reversed');

create table if not exists scp_users (
  id uuid primary key default gen_random_uuid(),
  external_auth_id uuid unique,
  role scp_role not null,
  full_name text not null,
  email text,
  mobile text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists scp_customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references scp_users(id),
  customer_type text not null check (customer_type in ('individual','proprietor','partnership','llp','company','other')),
  pan text,
  gstin text,
  legal_name text not null,
  constitution text,
  created_by uuid references scp_users(id),
  created_at timestamptz not null default now()
);

create table if not exists scp_partners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references scp_users(id),
  partner_code text unique not null,
  status text not null default 'active',
  payout_profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists scp_msme_financial_profiles (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references scp_customers(id) on delete cascade,
  financial_year text not null,
  turnover numeric(18,2),
  gross_profit numeric(18,2),
  net_profit numeric(18,2),
  depreciation numeric(18,2),
  existing_debt numeric(18,2),
  monthly_obligation numeric(18,2),
  bank_credit_total numeric(18,2),
  bank_debit_total numeric(18,2),
  gst_turnover numeric(18,2),
  source_snapshot jsonb not null default '{}'::jsonb,
  verified_at timestamptz,
  verified_by uuid references scp_users(id),
  unique(customer_id, financial_year)
);

create table if not exists scp_loan_applications (
  id uuid primary key default gen_random_uuid(),
  application_no text unique not null,
  customer_id uuid not null references scp_customers(id),
  referred_by_partner_id uuid references scp_partners(id),
  assigned_employee_id uuid references scp_users(id),
  assigned_credit_user_id uuid references scp_users(id),
  assigned_manager_id uuid references scp_users(id),
  product_type text not null,
  requested_amount numeric(18,2) not null check (requested_amount > 0),
  tenure_months int,
  purpose text,
  status scp_application_status not null default 'draft',
  sanctioned_amount numeric(18,2),
  sanctioned_at timestamptz,
  legacy_deal_id text,
  created_by uuid not null references scp_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists scp_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references scp_loan_applications(id) on delete cascade,
  customer_id uuid references scp_customers(id) on delete cascade,
  document_type text not null,
  storage_key text not null,
  mime_type text,
  checksum_sha256 text,
  verification_status text not null default 'pending',
  verified_by uuid references scp_users(id),
  verified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  uploaded_by uuid not null references scp_users(id),
  created_at timestamptz not null default now()
);

create table if not exists scp_credit_analyses (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references scp_loan_applications(id) on delete cascade,
  version int not null default 1,
  bureau_summary jsonb not null default '{}'::jsonb,
  banking_summary jsonb not null default '{}'::jsonb,
  gst_summary jsonb not null default '{}'::jsonb,
  ratios jsonb not null default '{}'::jsonb,
  risk_flags jsonb not null default '[]'::jsonb,
  recommendation jsonb not null default '{}'::jsonb,
  created_by uuid not null references scp_users(id),
  verified_by uuid references scp_users(id),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique(application_id, version)
);

create table if not exists scp_lenders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  lender_type text,
  active boolean not null default true,
  integration_mode text not null default 'manual',
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists scp_lender_products (
  id uuid primary key default gen_random_uuid(),
  lender_id uuid not null references scp_lenders(id) on delete cascade,
  name text not null,
  product_code text not null,
  min_amount numeric(18,2),
  max_amount numeric(18,2),
  min_tenure_months int,
  max_tenure_months int,
  min_score int,
  rules jsonb not null default '{}'::jsonb,
  commission_rule jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  unique(lender_id, product_code)
);

create table if not exists scp_lender_matches (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references scp_loan_applications(id) on delete cascade,
  lender_product_id uuid not null references scp_lender_products(id),
  match_score numeric(8,4),
  reasons jsonb not null default '[]'::jsonb,
  rule_snapshot jsonb not null default '{}'::jsonb,
  created_by uuid not null references scp_users(id),
  created_at timestamptz not null default now(),
  unique(application_id, lender_product_id)
);

create table if not exists scp_lender_submissions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references scp_loan_applications(id),
  lender_product_id uuid not null references scp_lender_products(id),
  external_reference text,
  status text not null default 'prepared',
  submitted_at timestamptz,
  submitted_by uuid references scp_users(id),
  response_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists scp_financial_transactions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references scp_loan_applications(id),
  transaction_type text not null check (transaction_type in ('customer_payment','lender_disbursement','refund','commission_payout','adjustment')),
  amount numeric(18,2) not null check (amount > 0),
  currency char(3) not null default 'INR',
  utr_or_transaction_id text not null,
  transaction_date date,
  status scp_txn_status not null default 'pending',
  source text not null default 'manual',
  evidence_document_id uuid references scp_documents(id),
  created_by uuid not null references scp_users(id),
  verified_by uuid references scp_users(id),
  verified_at timestamptz,
  verification_notes text,
  created_at timestamptz not null default now(),
  unique (utr_or_transaction_id)
);

create unique index if not exists scp_unique_verified_disbursement_per_ref
  on scp_financial_transactions(utr_or_transaction_id)
  where transaction_type = 'lender_disbursement' and status = 'verified';

create table if not exists scp_commission_ledger (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references scp_loan_applications(id),
  source_transaction_id uuid not null references scp_financial_transactions(id),
  beneficiary_type text not null check (beneficiary_type in ('partner','employee','company')),
  beneficiary_id uuid,
  basis_amount numeric(18,2) not null,
  rate numeric(9,6) not null default 0,
  commission_amount numeric(18,2) not null,
  rule_snapshot jsonb not null default '{}'::jsonb,
  status text not null default 'accrued',
  approved_by uuid references scp_users(id),
  approved_at timestamptz,
  paid_transaction_id uuid references scp_financial_transactions(id),
  created_at timestamptz not null default now(),
  unique(source_transaction_id, beneficiary_type, beneficiary_id)
);

create table if not exists scp_referrals (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references scp_partners(id),
  application_id uuid not null references scp_loan_applications(id),
  referral_code text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique(partner_id, application_id)
);

create table if not exists scp_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references scp_users(id) on delete cascade,
  channel text not null default 'in_app',
  template_key text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists scp_business_rules (
  id uuid primary key default gen_random_uuid(),
  rule_key text not null,
  version int not null default 1,
  scope text not null default 'global',
  definition jsonb not null,
  active boolean not null default true,
  valid_from timestamptz not null default now(),
  valid_to timestamptz,
  created_by uuid not null references scp_users(id),
  created_at timestamptz not null default now(),
  unique(rule_key, version)
);

create table if not exists scp_audit_log (
  id bigint generated always as identity primary key,
  actor_user_id uuid references scp_users(id),
  actor_role scp_role,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before_data jsonb,
  after_data jsonb,
  ip_address inet,
  user_agent text,
  correlation_id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists scp_integration_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  correlation_id uuid not null default gen_random_uuid(),
  request_payload jsonb not null default '{}'::jsonb,
  response_payload jsonb,
  status text not null default 'queued',
  provider_reference text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Request context helpers. The API sets these transaction-local values.
create or replace function scp_current_user_id() returns uuid
language sql stable as $$
  select nullif(current_setting('app.user_id', true), '')::uuid
$$;

create or replace function scp_current_role() returns scp_role
language sql stable as $$
  select nullif(current_setting('app.role', true), '')::scp_role
$$;

create or replace function scp_audit_row() returns trigger
language plpgsql security definer as $$
begin
  insert into scp_audit_log(actor_user_id, actor_role, action, entity_type, entity_id, before_data, after_data)
  values(
    scp_current_user_id(),
    scp_current_role(),
    tg_op,
    tg_table_name,
    coalesce((case when tg_op='DELETE' then old.id else new.id end)::text, ''),
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end
  );
  return case when tg_op='DELETE' then old else new end;
end;
$$;

create or replace function scp_protect_verified_transaction() returns trigger
language plpgsql as $$
begin
  if old.status = 'verified' then
    if new.amount is distinct from old.amount
       or new.utr_or_transaction_id is distinct from old.utr_or_transaction_id
       or new.application_id is distinct from old.application_id
       or new.transaction_type is distinct from old.transaction_type
       or new.transaction_date is distinct from old.transaction_date
       or new.status is distinct from old.status then
      raise exception 'Verified financial transactions are immutable';
    end if;
  end if;
  return new;
end;
$$;

create or replace function scp_verify_transaction(
  p_transaction_id uuid,
  p_finance_user_id uuid,
  p_notes text default null
) returns scp_financial_transactions
language plpgsql security definer as $$
declare
  v_role scp_role;
  v_tx scp_financial_transactions;
begin
  select role into v_role from scp_users where id = p_finance_user_id and is_active = true;
  if v_role not in ('finance','owner') then
    raise exception 'Only Finance or Owner can verify transactions';
  end if;

  update scp_financial_transactions
     set status='verified',
         verified_by=p_finance_user_id,
         verified_at=now(),
         verification_notes=p_notes
   where id=p_transaction_id
     and status='pending'
  returning * into v_tx;

  if v_tx.id is null then
    raise exception 'Transaction not found or is not pending';
  end if;

  if v_tx.transaction_type = 'lender_disbursement' then
    update scp_loan_applications
       set status='disbursed', updated_at=now()
     where id=v_tx.application_id;
  end if;

  insert into scp_audit_log(actor_user_id,actor_role,action,entity_type,entity_id,after_data)
  values(p_finance_user_id,v_role,'VERIFY_TRANSACTION','scp_financial_transactions',v_tx.id::text,to_jsonb(v_tx));

  return v_tx;
end;
$$;

create or replace function scp_create_commission_from_verified_disbursement(
  p_transaction_id uuid,
  p_beneficiary_type text,
  p_beneficiary_id uuid,
  p_rate numeric,
  p_rule_snapshot jsonb default '{}'::jsonb
) returns scp_commission_ledger
language plpgsql security definer as $$
declare
  v_tx scp_financial_transactions;
  v_row scp_commission_ledger;
begin
  select * into v_tx
    from scp_financial_transactions
   where id=p_transaction_id
     and transaction_type='lender_disbursement'
     and status='verified';

  if v_tx.id is null then
    raise exception 'Commission can only be calculated from a verified lender disbursement';
  end if;

  if p_rate < 0 then raise exception 'Commission rate cannot be negative'; end if;

  insert into scp_commission_ledger(
    application_id, source_transaction_id, beneficiary_type, beneficiary_id,
    basis_amount, rate, commission_amount, rule_snapshot
  )
  values(
    v_tx.application_id, v_tx.id, p_beneficiary_type, p_beneficiary_id,
    v_tx.amount, p_rate, round(v_tx.amount * p_rate, 2), p_rule_snapshot
  )
  on conflict(source_transaction_id, beneficiary_type, beneficiary_id)
  do update set rule_snapshot=excluded.rule_snapshot
  returning * into v_row;

  return v_row;
end;
$$;

drop trigger if exists scp_protect_verified_transaction_tg on scp_financial_transactions;
create trigger scp_protect_verified_transaction_tg
before update on scp_financial_transactions
for each row execute function scp_protect_verified_transaction();

-- Sensitive tables always audited.
do $$
declare t text;
begin
  foreach t in array array[
    'scp_loan_applications','scp_documents','scp_credit_analyses',
    'scp_lender_submissions','scp_financial_transactions',
    'scp_commission_ledger','scp_business_rules'
  ]
  loop
    execute format('drop trigger if exists %I on %I', t || '_audit_tg', t);
    execute format(
      'create trigger %I after insert or update or delete on %I for each row execute function scp_audit_row()',
      t || '_audit_tg', t
    );
  end loop;
end $$;
