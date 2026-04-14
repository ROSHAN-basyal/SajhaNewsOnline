-- Khabar Mulbata production migration
-- Run this in the Supabase SQL Editor before deploying the updated app on Vercel.

begin;

alter table public.news_posts
  add column if not exists image_urls text[];

alter table public.news_posts
  add column if not exists duration_days integer;

alter table public.news_posts
  add column if not exists expires_at timestamptz;

update public.news_posts
set duration_days = 30
where duration_days is null;

update public.news_posts
set duration_days = greatest(1, least(300, duration_days));

update public.news_posts
set image_urls = array[image_url]
where image_url is not null
  and (image_urls is null or cardinality(image_urls) = 0);

update public.news_posts
set expires_at = created_at + make_interval(days => duration_days)
where expires_at is null;

alter table public.news_posts
  alter column duration_days set default 30;

alter table public.news_posts
  alter column duration_days set not null;

create index if not exists news_posts_expires_at_idx
  on public.news_posts (expires_at);

insert into storage.buckets (id, name, public)
values ('news-images', 'news-images', true)
on conflict (id) do nothing;

commit;
