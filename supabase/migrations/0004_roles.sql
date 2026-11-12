-- Sermon on the Mount: two roles for the dashboard. Run after 0003.
--   admin  everything: bookings, staff, expenses, payroll, and creating accounts
--   staff  bookings and the calendar: read and update (confirm, record payments), never delete
-- Accounts are created by an admin from the dashboard (supabase/functions/accounts), never by sign-up.

create table public.roles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  name       text not null default '' check (length(name) <= 120),
  role       text not null check (role in ('admin', 'staff')),
  created_at timestamptz not null default now()
);

-- The Gmail account already in Supabase → Auth is the first admin.
insert into public.roles (user_id, email, role)
select id, email, 'admin' from auth.users where email = 'sermononthemount.ph@gmail.com'
on conflict (user_id) do update set role = 'admin';

-- security definer so policies can ask "what am I?" without recursing through roles' own RLS
create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role from roles where user_id = auth.uid()
$$;
revoke all on function public.my_role() from public;
grant execute on function public.my_role() to authenticated;

-- is_owner() now means "is an admin", so every owner-only policy from 0001–0003 follows the table.
create or replace function public.is_owner() returns boolean
language sql stable as $$ select coalesce(public.my_role() = 'admin', false) $$;

create or replace function public.is_staff() returns boolean
language sql stable as $$ select public.my_role() is not null $$;

-- Staff work the bookings too; only admins delete.
drop policy "owner reads" on public.bookings;
drop policy "owner updates" on public.bookings;
create policy "team reads" on public.bookings for select to authenticated using (public.is_staff());
create policy "team updates" on public.bookings for update to authenticated using (public.is_staff()) with check (public.is_staff());

alter table public.roles enable row level security;
create policy "see own role, admins see all" on public.roles for select to authenticated
  using (user_id = auth.uid() or public.is_owner());
-- admins change other people's roles, never their own (so the last admin can't lock everyone out)
create policy "admins change others" on public.roles for update to authenticated
  using (public.is_owner() and user_id <> auth.uid()) with check (public.is_owner());
-- inserts and deletes go through the accounts function (service role), which also manages auth.users

alter publication supabase_realtime add table public.roles;
