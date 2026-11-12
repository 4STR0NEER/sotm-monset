-- Sermon on the Mount: the Treehouse, a third private stay (2–5 guests) that books the whole resort.
-- Run after 0005: Supabase dashboard → SQL Editor → New query → paste → Run.
-- Safe to run again, or over an earlier version of this file.

alter table public.bookings drop constraint if exists bookings_package_check;
alter table public.bookings add constraint bookings_package_check
  check (package in ('lodge', 'chalet', 'treehouse', 'dayuse', 'birthday', 'wedding'));

-- unit: which stay a booking is for (shown in the app). spot: what it occupies on the property, as a
-- range, so overlap means clash: the Lodge is [1,2), the Chalet [2,3), and the Treehouse [1,3), the
-- whole resort. Lodge and Chalet groups can still share a night; nobody shares one with the Treehouse.
-- A generated column can't be altered in place: drop the constraint that uses it, rebuild.
alter table public.bookings drop constraint if exists no_double_booking;
alter table public.bookings drop column if exists spot;
alter table public.bookings drop column if exists unit;
alter table public.bookings add column unit text generated always as
  (case when package in ('chalet', 'treehouse') then package else 'lodge' end) stored;
alter table public.bookings add column spot int4range generated always as
  (case package when 'chalet' then int4range(2, 3) when 'treehouse' then int4range(1, 3) else int4range(1, 2) end) stored;
alter table public.bookings add constraint no_double_booking exclude using gist (
  spot with &&,
  daterange(check_in, check_out) with &&
) where (status <> 'cancelled');
