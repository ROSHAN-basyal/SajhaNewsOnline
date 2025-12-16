# Sajha News Online - Project Notes

## Product goals
- Reader UI: simple scroll feed (Reddit-like), fast article pages, clean design.
- Admin: hidden route at `/secret-admin-portal`, authenticated login with persistent sessions, CRUD for posts + ads.
- Styling: keep CSS in the project’s CSS files (avoid inline styles).

## Supabase configuration
- Store credentials in `.env.local` (don’t hardcode project URLs/keys in the repo):
  - `NEXT_PUBLIC_SUPABASE_URL=...`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
  - `NEXT_PUBLIC_SITE_URL=https://sajhanewsonline.com`
