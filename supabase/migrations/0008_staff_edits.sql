-- Sermon on the Mount: admins edit any booking; staff can change headcount, visitors, pets, notes,
-- payment and status (walk-ins on the day, deposits, confirm/cancel), not the stay, dates or guest
-- details. Run after 0007. Requests from the website can't update at all (no policy for them), and
-- the SQL editor / CLI (no signed-in user) is left alone.

create or replace function public.staff_edit_limits() returns trigger
language plpgsql as $$
begin
  if auth.uid() is not null and not public.is_owner()
     and (new.id, new.package, new.check_in, new.check_out, new.name, new.phone, new.email, new.source)
         is distinct from (old.id, old.package, old.check_in, old.check_out, old.name, old.phone, old.email, old.source) then
    raise exception 'Only admins can change the stay, dates or guest details' using errcode = '42501';
  end if;
  return new;
end $$;

drop trigger if exists staff_edit_limits on public.bookings;
create trigger staff_edit_limits before update on public.bookings
  for each row execute function public.staff_edit_limits();
