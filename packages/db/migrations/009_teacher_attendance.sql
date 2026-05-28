-- TEACHER ATTENDANCE
create table if not exists public.teacher_attendance (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references public.teachers(id) on delete cascade not null,
  marked_date date not null default current_date,
  status text not null check (status in ('present', 'absent', 'half_day', 'on_leave')),
  marked_by uuid references public.profiles(id),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(teacher_id, marked_date)
);

create index if not exists idx_teacher_attendance_teacher_id on public.teacher_attendance(teacher_id);
create index if not exists idx_teacher_attendance_marked_date on public.teacher_attendance(marked_date);

alter table public.teacher_attendance enable row level security;

create policy "Director manages teacher attendance"
  on public.teacher_attendance for all using (is_director());

create policy "Teachers can read their own attendance"
  on public.teacher_attendance for select using (
    teacher_id in (select id from public.teachers where profile_id = auth.uid())
  );
