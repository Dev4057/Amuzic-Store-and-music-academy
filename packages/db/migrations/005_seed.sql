-- Idempotent seed data

-- 4 courses
insert into public.courses (name, slug, description, duration_months, monthly_fee, admission_fee)
values
  ('Keyboard', 'keyboard', 'Learn to play keyboard from basics to advanced. Covers music theory, scales, chords, and popular songs.', 12, 1500.00, 500.00),
  ('Guitar',   'guitar',   'Acoustic and electric guitar. Learn chords, strumming patterns, fingerpicking, and your favorite songs.', 12, 1500.00, 500.00),
  ('Drums',    'drums',    'Learn rhythm, coordination, and drumming techniques from beginner beats to complex patterns.', 12, 1800.00, 500.00),
  ('Vocals',   'vocals',   'Develop your voice with proper breathing, pitch, tone, and performance techniques.', 12, 1500.00, 500.00)
on conflict (slug) do nothing;

-- 2 teachers (profile_id linked after Supabase Auth users are created)
insert into public.teachers (full_name, phone, specializations, bio, joining_date)
values
  ('Gopal',      '9999999991', array['keyboard', 'guitar'], 'Gopal is a versatile musician with expertise in both Keyboard and Guitar. Passionate about making music accessible to everyone.', '2022-01-01'),
  ('Jay Nawale',  '9999999992', array['drums'],             'Jay brings energy and rhythm to every class. Specializes in teaching drums to students of all ages.',                            '2022-01-01')
on conflict do nothing;
