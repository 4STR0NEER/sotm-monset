-- Sermon on the Mount: bookings.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
--
-- Who can do what (enforced here, not in the app):
--   guests (anon)  insert a booking request, and see which nights are taken (dates only, no names)
--   owner          sermononthemount.ph@gmail.com, signed in: read, update and delete everything
--   edge function  service role (bypasses RLS) to send the confirmation emails

create extension if not exists btree_gist;

create table public.bookings (
  id          text primary key check (id ~ '^SOTM-[A-Z0-9]{6}$'),
  package     text not null check (package in ('lodge', 'chalet', 'dayuse', 'birthday', 'wedding')),
  -- which accommodation it occupies; day use and functions run at the Cabin Lodge
  unit        text generated always as (case when package = 'chalet' then 'chalet' else 'lodge' end) stored,
  check_in    date not null,
  check_out   date not null check (check_out > check_in),
  guests      int  not null default 1 check (guests between 1 and 100),
  kids        int  not null default 0 check (kids between 0 and 50),
  pets        int  not null default 0 check (pets between 0 and 10),
  visitors    int  not null default 0 check (visitors between 0 and 200),
  event       boolean not null default false,
  addons      jsonb not null default '{}',
  name        text not null check (length(name) between 2 and 120),
  phone       text not null check (phone ~ '^(\+?63|0)9\d{9}$'),
  email       text not null check (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  notes       text not null default '' check (length(notes) <= 2000),
  total       int  not null default 0,
  deposit     int  not null default 0,
  paid        int  not null default 0,
  status      text not null default 'requested' check (status in ('requested', 'confirmed', 'completed', 'cancelled')),
  source      text not null default 'web',
  emailed_at  timestamptz,
  created_at  timestamptz not null default now(),
  -- one group per stay per night: overlapping live bookings of the same unit are rejected (error 23P01)
  constraint no_double_booking exclude using gist (
    unit with =,
    daterange(check_in, check_out) with &&
  ) where (status <> 'cancelled')
);

create index bookings_check_in on public.bookings (check_in);

alter table public.bookings enable row level security;

create or replace function public.is_owner() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'sermononthemount.ph@gmail.com'
$$;

-- Guests may only file a fresh, unpaid request for a future date.
-- ponytail: totals come from the browser. The owner reviews every request before confirming,
-- and the PayMongo checkout must recompute the deposit server-side before taking money.
create policy "guests file requests" on public.bookings
  for insert to anon, authenticated
  with check (status = 'requested' and paid = 0 and emailed_at is null and source = 'web' and check_in >= current_date);

create policy "owner reads" on public.bookings for select to authenticated using (public.is_owner());
create policy "owner updates" on public.bookings for update to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "owner deletes" on public.bookings for delete to authenticated using (public.is_owner());

-- Availability for the booking calendar: dates and stay only, never guest details.
create or replace function public.booked_ranges()
returns table (unit text, check_in date, check_out date)
language sql stable security definer set search_path = public as $$
  select unit, check_in, check_out from bookings
  where status <> 'cancelled' and check_out >= current_date
$$;
revoke all on function public.booked_ranges() from public;
grant execute on function public.booked_ranges() to anon, authenticated;

-- Live updates for the owner dashboard (RLS still applies to what each client receives).
alter publication supabase_realtime add table public.bookings;
