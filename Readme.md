# Sajha News Online

A modern Nepali news portal built with Next.js (App Router) + Supabase, including a hidden admin portal for managing posts and advertisements.

## Features

### Public site
- Responsive news feed with category navigation and search
- Dedicated article pages (`/posts/[id]`) with share actions
- Ad slots (header/sidebar/in-content/footer)

### Admin portal
- URL: `/secret-admin-portal`
- Login sessions with persistence
- Posts: create, edit, delete, and clean expired posts
- Ads: create, edit, delete, placement selector, analytics

## Requirements

- Node.js + npm
- A Supabase project

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Set up Supabase (database + storage)

1. Open Supabase Dashboard → your project
2. SQL Editor → New query
3. Run `supabase-schema.sql` (creates tables, policies, ads system, and the `news-images` storage bucket + policies when permitted)

This schema also seeds:
- Default admin user: `admin` / `admin123`
- Sample posts (only if `news_posts` is empty)

### 3) Configure environment variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:443
```

## Run locally

```bash
npm run dev
```

- Public site: `http://localhost:443`
- Admin portal: `http://localhost:443/secret-admin-portal`

Alternate port:

```bash
npm run dev-alt
```

## Images (uploads)

News images are stored in Supabase Storage bucket `news-images`.

If `supabase-schema.sql` couldn’t create storage/policies (permission/role limitations), create it manually:
- Supabase Dashboard → Storage → create bucket `news-images` and set it public
- Then add policies in Storage → Policies (or re-run the schema as a role that can manage `storage.objects`)

## Maintenance

- Clean expired posts (older than 30 days): available via the Admin UI
- Manual cleanup API: `POST /api/cleanup` (used by the admin UI)

## Troubleshooting

### Clear Next.js cache

If you see stale UI/TS errors:

```bash
rmdir /s .next
npm run dev
```

### Can’t log in as admin

Re-run `supabase-schema.sql`, or reset the seeded admin password hash:

```sql
UPDATE admin_users
SET password_hash = '$2a$12$wJgYKJzTKG88a.MG.qLJ.eQKitDNGTJIfos.42J67mEdLXdCqRQ5S'
WHERE username = 'admin';
```

