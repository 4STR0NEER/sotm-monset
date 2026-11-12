-- Sermon on the Mount: cash advances and payroll deductions. Run after 0002.

-- Standing monthly deductions per person, e.g. {"SSS": 450, "PhilHealth": 250, "Pag-IBIG": 100}
alter table public.staff add column deductions jsonb not null default '{}';

-- What each payout was made of: amount (net) = gross - sum(deductions) - advance
alter table public.payroll
  add column gross      int   not null default 0 check (gross >= 0),
  add column deductions jsonb not null default '{}',
  add column advance    int   not null default 0 check (advance >= 0);
update public.payroll set gross = amount where gross = 0;

-- Cash handed out ahead of payday. Outstanding = advances given - advance recovered in payroll.
create table public.advances (
  id          uuid primary key default gen_random_uuid(),
  staff_id    uuid references public.staff (id) on delete set null,
  name        text not null,
  given_on    date not null default current_date,
  amount      int  not null check (amount > 0),
  note        text not null default '' check (length(note) <= 300),
  created_at  timestamptz not null default now()
);

alter table public.advances enable row level security;
create policy "owner only" on public.advances for all to authenticated using (public.is_owner()) with check (public.is_owner());
alter publication supabase_realtime add table public.advances;
