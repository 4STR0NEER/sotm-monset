-- Sermon on the Mount: staff, expenses and payroll. Owner-only, nothing public.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run (after 0001).

create table public.staff (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(name) between 2 and 120),
  designation text not null default '' check (length(designation) <= 80),
  pay_type    text not null check (pay_type in ('monthly', 'daily')),
  rate        int  not null check (rate >= 0),            -- pesos per month, or per day worked
  on_call     int[] not null default '{}' check (on_call <@ array[0,1,2,3,4,5,6]), -- 0 = Sunday
  phone       text not null default '',
  created_at  timestamptz not null default now()
);

create table public.expenses (
  id          uuid primary key default gen_random_uuid(),
  spent_on    date not null default current_date,
  category    text not null check (length(category) between 1 and 40),
  description text not null default '' check (length(description) <= 300),
  amount      int  not null check (amount > 0),
  created_at  timestamptz not null default now()
);
create index expenses_spent_on on public.expenses (spent_on);

-- One payout per person per month. Name is copied so history survives removing the staff member.
create table public.payroll (
  id          uuid primary key default gen_random_uuid(),
  staff_id    uuid references public.staff (id) on delete set null,
  name        text not null,
  month       text not null check (month ~ '^\d{4}-\d{2}$'),
  days        int  not null default 0 check (days between 0 and 31),
  amount      int  not null check (amount >= 0),
  paid_on     date not null default current_date,
  created_at  timestamptz not null default now(),
  unique (staff_id, month)
);

alter table public.staff    enable row level security;
alter table public.expenses enable row level security;
alter table public.payroll  enable row level security;

create policy "owner only" on public.staff    for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "owner only" on public.expenses for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "owner only" on public.payroll  for all to authenticated using (public.is_owner()) with check (public.is_owner());

alter publication supabase_realtime add table public.staff, public.expenses, public.payroll;
