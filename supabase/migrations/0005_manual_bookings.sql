-- Sermon on the Mount: bookings entered by the team from the dashboard (phone, walk-in, Facebook…).
-- Run after 0004.

-- Admins and staff can add bookings with any status/payment; source 'manual' marks them.
-- Guests still go through "guests file requests" (source must be 'web'), so they can't fake one.
create policy "team adds" on public.bookings for insert to authenticated with check (public.is_staff());

-- Walk-ins and phone bookings don't always leave an email.
alter table public.bookings drop constraint bookings_email_check;
alter table public.bookings add constraint bookings_email_check check (email = '' or email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$');
