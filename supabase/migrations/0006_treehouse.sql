-- Sermon on the Mount: the Treehouse, a third private stay (2–5 guests).
-- Run after 0005: Supabase dashboard → SQL Editor → New query → paste → Run.

alter table public.bookings drop constraint bookings_package_check;
alter table public.bookings add constraint bookings_package_check
  check (package in ('lodge', 'chalet', 'treehouse', 'dayuse', 'birthday', 'wedding'));

-- The Treehouse is its own unit, so it can be booked on the same night as the Lodge or Chalet.
-- A generated column can't be altered in place: drop the constraint that uses it, rebuild both.
alter table public.bookings drop constraint no_double_booking;
alter table public.bookings drop column unit;
alter table public.bookings add column unit text generated always as
  (case when package in ('chalet', 'treehouse') then package else 'lodge' end) stored;
alter table public.bookings add constraint no_double_booking exclude using gist (
  unit with =,
  daterange(check_in, check_out) with &&
) where (status <> 'cancelled');
