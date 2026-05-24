-- Generic updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to all tables with updated_at
drop trigger if exists handle_updated_at on public.profiles;
create trigger handle_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists handle_updated_at on public.courses;
create trigger handle_updated_at before update on public.courses
  for each row execute function public.handle_updated_at();

drop trigger if exists handle_updated_at on public.students;
create trigger handle_updated_at before update on public.students
  for each row execute function public.handle_updated_at();

drop trigger if exists handle_updated_at on public.teachers;
create trigger handle_updated_at before update on public.teachers
  for each row execute function public.handle_updated_at();

drop trigger if exists handle_updated_at on public.batches;
create trigger handle_updated_at before update on public.batches
  for each row execute function public.handle_updated_at();

drop trigger if exists handle_updated_at on public.fee_records;
create trigger handle_updated_at before update on public.fee_records
  for each row execute function public.handle_updated_at();

drop trigger if exists handle_updated_at on public.demo_bookings;
create trigger handle_updated_at before update on public.demo_bookings
  for each row execute function public.handle_updated_at();

drop trigger if exists handle_updated_at on public.products;
create trigger handle_updated_at before update on public.products
  for each row execute function public.handle_updated_at();

drop trigger if exists handle_updated_at on public.orders;
create trigger handle_updated_at before update on public.orders
  for each row execute function public.handle_updated_at();

-- Auto-create profile on Supabase Auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'teacher')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-mark fee_records as overdue
create or replace function public.mark_overdue_fees()
returns void as $$
begin
  update public.fee_records
  set status = 'overdue'
  where status = 'pending'
    and due_date < current_date;
end;
$$ language plpgsql;
