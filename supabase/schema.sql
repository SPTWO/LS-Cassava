-- =====================================================================
-- LS Cassava: ໂຄງສ້າງຖານຂໍ້ມູນ + ກົດສິດ (ແລ່ນຄັ້ງດຽວ ໃນ Supabase → SQL Editor)
-- =====================================================================

-- ---------- ສິດຜູ້ໃຊ້ ----------
create table if not exists public.user_roles (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  username  text not null,
  role      text not null default 'viewer' check (role in ('admin','viewer')),
  created_at timestamptz not null default now()
);

-- ສ້າງແຖວ user_roles ອັດຕະໂນມັດ ເມື່ອເພີ່ມຜູ້ໃຊ້ໃໝ່ (ເລີ່ມເປັນ viewer)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_roles(user_id, username)
  values (new.id, split_part(coalesce(new.email, new.id::text), '@', 1))
  on conflict (user_id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin');
$$;

-- ---------- ຄ່າຕັ້ງ ----------
create table if not exists public.settings (
  key   text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------- ແຜນ (PL Projection V2) ----------
create table if not exists public.plans (
  season text not null, factory text not null check (factory in ('xan','nan')), month date not null,
  proc_t numeric default 0, prod_t numeric default 0, exp_t numeric default 0,
  rev_exp numeric default 0, rev_pulp numeric default 0,
  raw numeric default 0, oth numeric default 0, mkt numeric default 0,
  sal_l numeric default 0, sal_f numeric default 0, admin numeric default 0, maint numeric default 0,
  support numeric default 0, asset numeric default 0, oth_i numeric default 0,
  interest numeric default 0, net numeric default 0,
  primary key (season, factory, month)
);

-- ---------- ເກັບຊື້ມັນຕົ້ນ (3.1 / 3.2 Cassava In-Out) ----------
create table if not exists public.procurements (
  id bigserial primary key, season text not null, factory text not null, date date not null,
  supplier text, account_name text, ticket_no text, truck text,
  gross_kg numeric default 0, net_kg numeric default 0, price numeric default 0, amount numeric default 0,
  to_prod_kg numeric default 0, waste_kg numeric default 0
);
create index if not exists procurements_sf on public.procurements(season, factory, date);

-- ---------- ຜະລິດ (4.1 / 4.2 Tapioca Produced) ----------
create table if not exists public.production (
  id bigserial primary key, season text not null, factory text not null, date date not null,
  shift text, line text, raw_kg numeric default 0, net_raw_kg numeric default 0, starch_pct numeric,
  expected_kg numeric default 0, p25_kg numeric default 0, p850_kg numeric default 0,
  onspec_kg numeric default 0, offspec_kg numeric default 0, output_kg numeric default 0, pulp_kg numeric default 0
);
create index if not exists production_sf on public.production(season, factory, date);

-- ---------- ອອກສາງ / ຂາຍ (5.1 / 5.2 Tapioca Sale) ----------
create table if not exists public.stock_moves (
  id bigserial primary key, season text not null, factory text not null, date date not null,
  kind text not null check (kind in ('starch','pulp')), direction text, buyer_type text,
  product text, bag_size numeric, bags numeric, weight_kg numeric default 0, company text, note text
);
create index if not exists stock_moves_sf on public.stock_moves(season, factory, date);

-- ---------- ການສົ່ງອອກ ຕາມໃບແຈ້ງໜີ້ (2.1 / 2.2) ----------
create table if not exists public.shipments (
  id bigserial primary key, season text not null, factory text not null, date date not null,
  invoice_no text, contract_no text, tons numeric default 0, price numeric default 0,
  amount numeric default 0, cash numeric default 0, deduct numeric default 0
);
create index if not exists shipments_sf on public.shipments(season, factory, date);

-- ---------- ສັນຍາ ແລະ ເງິນມັດຈຳ ----------
create table if not exists public.contracts (
  contract_no text primary key, season text not null, factory text not null,
  customer text, grade text, destination text,
  tons numeric default 0, value numeric, deduct_pct numeric,
  deposit_total numeric default 0, deposit_received numeric default 0, note text
);

-- ---------- ຕົ້ນທຶນລາຍເດືອນ (Cost of SNK / MN) ----------
create table if not exists public.cost_entries (
  season text not null, factory text not null, month date not null, code text not null,
  category text not null, amount numeric default 0,
  primary key (season, factory, month, code)
);

-- ---------- ເງິນກູ້ ----------
create table if not exists public.loans (
  loan_no text primary key, currency text not null check (currency in ('LAK','CNY','USD','THB')),
  limit_amt numeric default 0, balance numeric default 0, rate numeric default 0,
  available numeric default 0, interest_due numeric default 0, interest_period text,
  purpose text check (purpose in ('fix','wc')), maturity date, sort int default 0
);
create table if not exists public.loan_txns (
  id bigserial primary key, date date not null, loan_no text not null references public.loans(loan_no) on delete cascade,
  type text not null check (type in ('draw','repay','int','adj')), amount numeric default 0, prev_balance numeric,
  note text, created_by uuid default auth.uid(), created_at timestamptz not null default now()
);

-- ---------- ປະຫວັດການນຳເຂົ້າ ----------
create table if not exists public.import_log (
  id bigserial primary key, file_name text, sheets jsonb, rows int, created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);

-- ---------- ກົດສິດ (Row Level Security) ----------
-- ທຸກຄົນທີ່ login ແລ້ວ ອ່ານໄດ້; ແກ້ໄຂໄດ້ສະເພາະ admin
do $$
declare t text;
begin
  foreach t in array array['settings','plans','procurements','production','stock_moves','shipments',
                           'contracts','cost_entries','loans','loan_txns','import_log'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "read_%1$s" on public.%1$I', t);
    execute format('drop policy if exists "write_%1$s" on public.%1$I', t);
    execute format('create policy "read_%1$s" on public.%1$I for select to authenticated using (true)', t);
    execute format('create policy "write_%1$s" on public.%1$I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

alter table public.user_roles enable row level security;
drop policy if exists "read_own_role" on public.user_roles;
create policy "read_own_role" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
