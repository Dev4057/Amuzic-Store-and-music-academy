-- Storage buckets (run in Supabase dashboard or via CLI)
insert into storage.buckets (id, name, public)
  values ('course-assets', 'course-assets', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('student-photos', 'student-photos', false)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('showcase-videos', 'showcase-videos', false)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('product-images', 'product-images', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

-- Storage policies
drop policy if exists "Authenticated users can upload course assets" on storage.objects;
create policy "Authenticated users can upload course assets"
  on storage.objects for insert with check (
    bucket_id = 'course-assets' and auth.role() = 'authenticated'
  );

drop policy if exists "Anyone can read course assets" on storage.objects;
create policy "Anyone can read course assets"
  on storage.objects for select using (bucket_id = 'course-assets');

drop policy if exists "Authenticated users upload student photos" on storage.objects;
create policy "Authenticated users upload student photos"
  on storage.objects for insert with check (
    bucket_id = 'student-photos' and auth.role() = 'authenticated'
  );

drop policy if exists "Authenticated users read student photos" on storage.objects;
create policy "Authenticated users read student photos"
  on storage.objects for select using (
    bucket_id = 'student-photos' and auth.role() = 'authenticated'
  );

drop policy if exists "Director uploads showcase videos" on storage.objects;
create policy "Director uploads showcase videos"
  on storage.objects for insert with check (
    bucket_id = 'showcase-videos' and auth.role() = 'authenticated'
  );

drop policy if exists "Authenticated read showcase videos" on storage.objects;
create policy "Authenticated read showcase videos"
  on storage.objects for select using (
    bucket_id = 'showcase-videos' and auth.role() = 'authenticated'
  );

drop policy if exists "Authenticated upload product images" on storage.objects;
create policy "Authenticated upload product images"
  on storage.objects for insert with check (
    bucket_id = 'product-images' and auth.role() = 'authenticated'
  );

drop policy if exists "Anyone can read product images" on storage.objects;
create policy "Anyone can read product images"
  on storage.objects for select using (bucket_id = 'product-images');

drop policy if exists "Anyone can read avatars" on storage.objects;
create policy "Anyone can read avatars"
  on storage.objects for select using (bucket_id = 'avatars');

drop policy if exists "Authenticated upload avatars" on storage.objects;
create policy "Authenticated upload avatars"
  on storage.objects for insert with check (
    bucket_id = 'avatars' and auth.role() = 'authenticated'
  );
