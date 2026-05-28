create table if not exists public.testimonials (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null,
  quote text not null,
  rating integer default 5 check (rating between 1 and 5),
  course text,
  student_type text check (student_type in ('child', 'adult', 'senior')),
  is_published boolean default false,
  display_order integer default 0,
  created_at timestamptz default now()
);

alter table public.testimonials enable row level security;

create policy "Anyone can read published testimonials"
  on public.testimonials for select using (is_published = true);

create policy "Director manages testimonials"
  on public.testimonials for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'director'
    )
  );

insert into public.testimonials
  (name, role, quote, rating, course, student_type, is_published, display_order)
values
  ('Priya Kulkarni', 'Parent of keyboard student',
   'My daughter has been learning keyboard at Amuzic for 8 months. The transformation is remarkable — she is more focused, more patient, and performs at every family gathering now. Gopal sir explains everything so clearly.',
   5, 'keyboard', 'child', true, 1),
  ('Rahul Deshmukh', 'Software Engineer, learning guitar',
   'I started guitar at 34, thinking it was too late. The teachers proved me completely wrong. After 6 months I can play 10 songs. The best stress relief after a long day of meetings.',
   5, 'guitar', 'adult', true, 2),
  ('Sudha Joshi', 'Retired teacher, learning vocals',
   'I fulfilled my lifelong dream of learning music after retirement. The teachers are so patient and encouraging. Amuzic Academy truly believes music is for everyone — and they live it.',
   5, 'vocals', 'senior', true, 3)
on conflict do nothing;
