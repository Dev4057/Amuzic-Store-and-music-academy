-- PROFILES (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  email text not null,
  phone text,
  role text not null check (role in ('director', 'teacher', 'student')),
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- INSTRUMENTS / COURSE TYPES
create table if not exists public.courses (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  duration_months integer,
  monthly_fee numeric(8,2),
  admission_fee numeric(8,2),
  is_active boolean default true,
  syllabus_url text,
  cover_image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- STUDENTS
create table if not exists public.students (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  phone text not null,
  email text,
  date_of_birth date,
  gender text check (gender in ('male', 'female', 'other')),
  address text,
  guardian_name text,
  guardian_phone text,
  student_type text check (student_type in ('child', 'adult', 'senior')),
  enrollment_date date default current_date,
  status text default 'active' check (status in ('active', 'inactive', 'on_hold', 'completed')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TEACHERS
create table if not exists public.teachers (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  phone text not null,
  email text,
  specializations text[] default '{}',
  bio text,
  photo_url text,
  joining_date date,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- BATCHES
create table if not exists public.batches (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  course_id uuid references public.courses(id) on delete restrict not null,
  teacher_id uuid references public.teachers(id) on delete set null,
  schedule_days text[] not null,
  schedule_time time not null,
  duration_minutes integer default 45,
  max_students integer default 8,
  status text default 'active' check (status in ('active', 'inactive', 'completed')),
  start_date date,
  end_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- BATCH ENROLLMENTS
create table if not exists public.batch_enrollments (
  id uuid default gen_random_uuid() primary key,
  batch_id uuid references public.batches(id) on delete cascade not null,
  student_id uuid references public.students(id) on delete cascade not null,
  enrolled_at timestamptz default now(),
  status text default 'active' check (status in ('active', 'dropped', 'completed')),
  unique(batch_id, student_id)
);

-- ATTENDANCE
create table if not exists public.attendance (
  id uuid default gen_random_uuid() primary key,
  batch_id uuid references public.batches(id) on delete cascade not null,
  student_id uuid references public.students(id) on delete cascade not null,
  class_date date not null,
  status text not null check (status in ('present', 'absent', 'late', 'cancelled')),
  marked_by uuid references public.profiles(id),
  notes text,
  created_at timestamptz default now(),
  unique(batch_id, student_id, class_date)
);

-- FEES
create table if not exists public.fee_records (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  batch_id uuid references public.batches(id) on delete set null,
  fee_type text not null check (fee_type in ('admission', 'monthly', 'annual', 'exam', 'other')),
  amount numeric(8,2) not null,
  due_date date not null,
  paid_date date,
  paid_amount numeric(8,2),
  payment_mode text check (payment_mode in ('cash', 'upi', 'bank_transfer', 'cheque')),
  status text default 'pending' check (status in ('pending', 'paid', 'overdue', 'waived')),
  month_year text,
  notes text,
  collected_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- STUDENT PROGRESS NOTES
create table if not exists public.progress_notes (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  batch_id uuid references public.batches(id) on delete set null,
  teacher_id uuid references public.teachers(id) on delete set null,
  note_text text not null,
  skill_level text check (skill_level in ('beginner', 'elementary', 'intermediate', 'advanced')),
  class_date date default current_date,
  created_at timestamptz default now()
);

-- DEMO BOOKINGS
create table if not exists public.demo_bookings (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  phone text not null,
  email text,
  course_interest text,
  preferred_date date,
  preferred_time text,
  student_type text check (student_type in ('child', 'adult', 'senior')),
  message text,
  status text default 'new' check (status in ('new', 'contacted', 'scheduled', 'completed', 'cancelled')),
  source text default 'website',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- STORE PRODUCTS
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  category text check (category in ('keyboard', 'guitar', 'drums', 'vocals', 'accessories', 'other')),
  price numeric(8,2) not null,
  stock_quantity integer default 0,
  images text[] default '{}',
  is_available boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- STORE ORDERS
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  items jsonb not null,
  total_amount numeric(8,2) not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'delivered', 'cancelled')),
  payment_mode text check (payment_mode in ('cash', 'upi', 'bank_transfer')),
  payment_status text default 'pending' check (payment_status in ('pending', 'paid')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- SHOWCASE VIDEOS
create table if not exists public.showcase_videos (
  id uuid default gen_random_uuid() primary key,
  student_name text not null,
  student_id uuid references public.students(id) on delete set null,
  course text not null,
  title text not null,
  video_url text not null,
  thumbnail_url text,
  duration_seconds integer,
  is_published boolean default false,
  display_order integer default 0,
  created_at timestamptz default now()
);

-- INDEXES
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_students_status on public.students(status);
create index if not exists idx_students_created_at on public.students(created_at);
create index if not exists idx_teachers_is_active on public.teachers(is_active);
create index if not exists idx_batches_course_id on public.batches(course_id);
create index if not exists idx_batches_teacher_id on public.batches(teacher_id);
create index if not exists idx_batches_status on public.batches(status);
create index if not exists idx_batch_enrollments_batch_id on public.batch_enrollments(batch_id);
create index if not exists idx_batch_enrollments_student_id on public.batch_enrollments(student_id);
create index if not exists idx_attendance_batch_id on public.attendance(batch_id);
create index if not exists idx_attendance_student_id on public.attendance(student_id);
create index if not exists idx_attendance_class_date on public.attendance(class_date);
create index if not exists idx_fee_records_student_id on public.fee_records(student_id);
create index if not exists idx_fee_records_status on public.fee_records(status);
create index if not exists idx_fee_records_due_date on public.fee_records(due_date);
create index if not exists idx_fee_records_created_at on public.fee_records(created_at);
create index if not exists idx_progress_notes_student_id on public.progress_notes(student_id);
create index if not exists idx_progress_notes_teacher_id on public.progress_notes(teacher_id);
create index if not exists idx_demo_bookings_status on public.demo_bookings(status);
create index if not exists idx_demo_bookings_created_at on public.demo_bookings(created_at);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at);
create index if not exists idx_showcase_videos_is_published on public.showcase_videos(is_published);
create index if not exists idx_showcase_videos_display_order on public.showcase_videos(display_order);
