-- 2026-11: loan purpose categories + cash flow (Banking_Daily) table
-- Run once in Supabase → SQL Editor. Safe to run again.

alter table public.loan_txns add column if not exists category text;

create table if not exists public.bank_txns (
  id bigserial primary key,
  date date,                       -- null = opening balance row
  company text,
  account text not null,           -- e.g. SNK-LDB-CNY
  currency text not null,          -- LAK / CNY / USD / THB
  activity text,                   -- Activity Code (REVENUE, EXPENSE, ...)
  code text,                       -- Expense Code
  amt_in numeric default 0,
  amt_out numeric default 0,
  opening numeric default 0,
  descr text
);
create index if not exists bank_txns_date on public.bank_txns(date);

alter table public.bank_txns enable row level security;
drop policy if exists "read_bank_txns" on public.bank_txns;
drop policy if exists "write_bank_txns" on public.bank_txns;
create policy "read_bank_txns" on public.bank_txns for select to authenticated using (true);
create policy "write_bank_txns" on public.bank_txns for all to authenticated using (public.is_admin()) with check (public.is_admin());
