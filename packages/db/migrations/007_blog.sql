create table if not exists public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  cover_image_url text,
  tags text[] default '{}',
  author_name text default 'Amuzic Academy',
  is_published boolean default false,
  published_at timestamptz,
  reading_time_minutes integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.blog_posts enable row level security;

create policy "Anyone can read published posts"
  on public.blog_posts for select using (is_published = true);

create policy "Director manages blog posts"
  on public.blog_posts for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'director'
    )
  );

drop trigger if exists handle_updated_at on public.blog_posts;
create trigger handle_updated_at before update on public.blog_posts
  for each row execute function public.handle_updated_at();
