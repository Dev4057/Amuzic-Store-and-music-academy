-- Enable RLS on every table
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.students enable row level security;
alter table public.teachers enable row level security;
alter table public.batches enable row level security;
alter table public.batch_enrollments enable row level security;
alter table public.attendance enable row level security;
alter table public.fee_records enable row level security;
alter table public.progress_notes enable row level security;
alter table public.demo_bookings enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.showcase_videos enable row level security;

-- Helper functions
create or replace function public.is_director()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'director'
  );
$$ language sql security definer;

create or replace function public.is_teacher()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('director', 'teacher')
  );
$$ language sql security definer;

-- profiles
drop policy if exists "Authenticated users can read profiles" on public.profiles;
create policy "Authenticated users can read profiles"
  on public.profiles for select using (auth.role() = 'authenticated');

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

drop policy if exists "Director can insert profiles" on public.profiles;
create policy "Director can insert profiles"
  on public.profiles for insert with check (is_director());

drop policy if exists "Director can delete profiles" on public.profiles;
create policy "Director can delete profiles"
  on public.profiles for delete using (is_director());

-- courses
drop policy if exists "Anyone can read active courses" on public.courses;
create policy "Anyone can read active courses"
  on public.courses for select using (true);

drop policy if exists "Director can manage courses" on public.courses;
create policy "Director can manage courses"
  on public.courses for all using (is_director());

-- students
drop policy if exists "Teachers and director read all students" on public.students;
create policy "Teachers and director read all students"
  on public.students for select using (is_teacher());

drop policy if exists "Director and teachers can insert students" on public.students;
create policy "Director and teachers can insert students"
  on public.students for insert with check (is_teacher());

drop policy if exists "Director and teachers can update students" on public.students;
create policy "Director and teachers can update students"
  on public.students for update using (is_teacher());

drop policy if exists "Director can delete students" on public.students;
create policy "Director can delete students"
  on public.students for delete using (is_director());

-- teachers
drop policy if exists "Authenticated users read teachers" on public.teachers;
create policy "Authenticated users read teachers"
  on public.teachers for select using (auth.role() = 'authenticated');

drop policy if exists "Director manages teachers" on public.teachers;
create policy "Director manages teachers"
  on public.teachers for all using (is_director());

-- batches
drop policy if exists "Director reads all batches" on public.batches;
create policy "Director reads all batches"
  on public.batches for select using (is_director());

drop policy if exists "Teachers read their own batches" on public.batches;
create policy "Teachers read their own batches"
  on public.batches for select using (
    exists (
      select 1 from public.teachers
      where profile_id = auth.uid() and id = batches.teacher_id
    )
  );

drop policy if exists "Director manages batches" on public.batches;
create policy "Director manages batches"
  on public.batches for all using (is_director());

-- batch_enrollments
drop policy if exists "Director manages all enrollments" on public.batch_enrollments;
create policy "Director manages all enrollments"
  on public.batch_enrollments for all using (is_director());

drop policy if exists "Teachers manage enrollments for their batches" on public.batch_enrollments;
create policy "Teachers manage enrollments for their batches"
  on public.batch_enrollments for all using (
    exists (
      select 1 from public.batches b
      join public.teachers t on t.id = b.teacher_id
      where b.id = batch_enrollments.batch_id and t.profile_id = auth.uid()
    )
  );

-- attendance
drop policy if exists "Director manages all attendance" on public.attendance;
create policy "Director manages all attendance"
  on public.attendance for all using (is_director());

drop policy if exists "Teachers manage attendance for their batches" on public.attendance;
create policy "Teachers manage attendance for their batches"
  on public.attendance for all using (
    exists (
      select 1 from public.batches b
      join public.teachers t on t.id = b.teacher_id
      where b.id = attendance.batch_id and t.profile_id = auth.uid()
    )
  );

-- fee_records
drop policy if exists "Director manages all fees" on public.fee_records;
create policy "Director manages all fees"
  on public.fee_records for all using (is_director());

drop policy if exists "Teachers can read fees" on public.fee_records;
create policy "Teachers can read fees"
  on public.fee_records for select using (is_teacher());

-- progress_notes
drop policy if exists "Director manages all progress notes" on public.progress_notes;
create policy "Director manages all progress notes"
  on public.progress_notes for all using (is_director());

drop policy if exists "Teachers manage their own notes" on public.progress_notes;
create policy "Teachers manage their own notes"
  on public.progress_notes for all using (
    exists (
      select 1 from public.teachers
      where profile_id = auth.uid() and id = progress_notes.teacher_id
    )
  );

-- demo_bookings
drop policy if exists "Anyone can create a demo booking" on public.demo_bookings;
create policy "Anyone can create a demo booking"
  on public.demo_bookings for insert with check (true);

drop policy if exists "Teachers and director read demo bookings" on public.demo_bookings;
create policy "Teachers and director read demo bookings"
  on public.demo_bookings for select using (is_teacher());

drop policy if exists "Director manages demo bookings" on public.demo_bookings;
create policy "Director manages demo bookings"
  on public.demo_bookings for all using (is_director());

-- products
drop policy if exists "Anyone can read available products" on public.products;
create policy "Anyone can read available products"
  on public.products for select using (true);

drop policy if exists "Director manages products" on public.products;
create policy "Director manages products"
  on public.products for all using (is_director());

-- orders
drop policy if exists "Anyone can place an order" on public.orders;
create policy "Anyone can place an order"
  on public.orders for insert with check (true);

drop policy if exists "Director manages orders" on public.orders;
create policy "Director manages orders"
  on public.orders for all using (is_director());

-- showcase_videos
drop policy if exists "Anyone can read published videos" on public.showcase_videos;
create policy "Anyone can read published videos"
  on public.showcase_videos for select using (is_published = true);

drop policy if exists "Director manages all videos" on public.showcase_videos;
create policy "Director manages all videos"
  on public.showcase_videos for all using (is_director());
