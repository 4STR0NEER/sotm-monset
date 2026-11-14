-- Sermon on the Mount: every booking makes the whole resort exclusive (owner, Nov 2026).
-- Any two live bookings that share a night are refused, whatever the stay. Run after 0006.
-- Fails if live bookings already overlap: cancel or merge those first.

alter table public.bookings drop constraint if exists no_double_booking;
alter table public.bookings drop column if exists spot;
alter table public.bookings add constraint no_double_booking exclude using gist (
  daterange(check_in, check_out) with &&
) where (status <> 'cancelled');
