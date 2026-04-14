# Vercel Production Checklist

## 1. Supabase migration

Run `docs/supabase-production-migration.sql` in the Supabase SQL Editor before deploying.

This updates `public.news_posts` to support:

- `image_urls`
- `duration_days`
- `expires_at`

It also ensures the `news-images` storage bucket exists.

## 2. Vercel environment variables

Set these in the Vercel project:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `CRON_SECRET`

Recommended for production:

- `ENABLE_LOCAL_ADMIN_LOGIN=false`

Optional if you still want a separate manual cleanup secret:

- `CLEANUP_SECRET`

## 3. Automatic expiry cleanup

`vercel.json` schedules `/api/cleanup` once per day at `03:00 UTC`.

The cleanup route accepts:

- `CRON_SECRET` for Vercel Cron requests
- `CLEANUP_SECRET` for manual external requests

## 4. Deploy

After the SQL migration and env vars are in place:

1. Push the branch to GitHub.
2. Let Vercel build the new deployment.
3. Open the deployed admin portal.
4. Create a test post with:
   - custom duration
   - multiple images
   - `/img2` or `/img3` in content
5. Confirm the post is saved and renders correctly on production.
