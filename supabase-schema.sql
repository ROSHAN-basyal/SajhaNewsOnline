-- Sajha News Online — Complete Supabase Setup (Single File)
-- Paste this entire file into Supabase SQL Editor and run.
--
-- Includes:
-- - News posts (with categories)
-- - Custom admin auth tables (users + sessions)
-- - Advertisement system (ads + analytics + summary view)
-- - Storage bucket (news-images) + policies
--
-- NOTE (security):
-- This project currently enforces admin access in Next.js API routes.
-- The policies below are permissive so the app works with the public anon key.
-- If you want strict DB-level security, tell me and I will switch the server routes to a service-role client + tighten RLS.

-- 0) Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Core tables
CREATE TABLE IF NOT EXISTS public.news_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'latest',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure category exists for older databases
ALTER TABLE public.news_posts ADD COLUMN IF NOT EXISTS category TEXT;
UPDATE public.news_posts SET category = 'latest' WHERE category IS NULL;
ALTER TABLE public.news_posts ALTER COLUMN category SET DEFAULT 'latest';
ALTER TABLE public.news_posts ALTER COLUMN category SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_news_posts_created_at ON public.news_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_posts_category_created_at ON public.news_posts (category, created_at DESC);

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  device_id TEXT,
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backfill columns if the table existed before these were added
ALTER TABLE public.admin_sessions ADD COLUMN IF NOT EXISTS device_id TEXT;
ALTER TABLE public.admin_sessions ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.admin_sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions (session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON public.admin_sessions (expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_device_id ON public.admin_sessions (device_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_last_activity ON public.admin_sessions (last_activity);

-- 2) Advertisement system
CREATE TABLE IF NOT EXISTS public.advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  click_url TEXT NOT NULL,
  placement VARCHAR(50) NOT NULL CHECK (placement IN ('header', 'sidebar_top', 'in_content', 'sidebar_mid', 'footer')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired', 'draft')),
  priority INTEGER NOT NULL DEFAULT 1 CHECK (priority >= 1 AND priority <= 10),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  target_impressions INTEGER NOT NULL DEFAULT 0,
  target_clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ad_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES public.advertisements(id) ON DELETE CASCADE,
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('impression', 'click')),
  user_ip VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ads_placement_status ON public.advertisements(placement, status);
CREATE INDEX IF NOT EXISTS idx_ads_priority ON public.advertisements(priority DESC);
CREATE INDEX IF NOT EXISTS idx_ads_dates ON public.advertisements(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_analytics_ad_id ON public.ad_analytics(ad_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.ad_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.ad_analytics(created_at);

-- 3) updated_at trigger helper (shared)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_news_posts_updated_at ON public.news_posts;
CREATE TRIGGER trigger_news_posts_updated_at
BEFORE UPDATE ON public.news_posts
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_ads_updated_at ON public.advertisements;
CREATE TRIGGER trigger_ads_updated_at
BEFORE UPDATE ON public.advertisements
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 4) Analytics view
CREATE OR REPLACE VIEW public.ad_performance_summary AS
SELECT
  a.id,
  a.title,
  a.placement,
  a.status,
  a.start_date,
  a.end_date,
  COALESCE(impressions.count, 0) AS total_impressions,
  COALESCE(clicks.count, 0) AS total_clicks,
  CASE
    WHEN COALESCE(impressions.count, 0) > 0
    THEN ROUND((COALESCE(clicks.count, 0)::decimal / impressions.count::decimal) * 100, 2)
    ELSE 0
  END AS ctr_percentage,
  a.created_at,
  a.updated_at
FROM public.advertisements a
LEFT JOIN (
  SELECT ad_id, COUNT(*) AS count
  FROM public.ad_analytics
  WHERE event_type = 'impression'
  GROUP BY ad_id
) impressions ON a.id = impressions.ad_id
LEFT JOIN (
  SELECT ad_id, COUNT(*) AS count
  FROM public.ad_analytics
  WHERE event_type = 'click'
  GROUP BY ad_id
) clicks ON a.id = clicks.ad_id
ORDER BY a.priority DESC, a.created_at DESC;

COMMENT ON TABLE public.advertisements IS 'Banner advertisements with placement and scheduling';
COMMENT ON TABLE public.ad_analytics IS 'Advertisement performance tracking';
COMMENT ON VIEW public.ad_performance_summary IS 'Summary view of ad performance with CTR calculations';

-- 5) Row Level Security (RLS)
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (to keep re-runs smooth)
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT polname FROM pg_policy WHERE polrelid = 'public.news_posts'::regclass LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.news_posts', pol.polname);
  END LOOP;
  FOR pol IN SELECT polname FROM pg_policy WHERE polrelid = 'public.admin_users'::regclass LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.admin_users', pol.polname);
  END LOOP;
  FOR pol IN SELECT polname FROM pg_policy WHERE polrelid = 'public.admin_sessions'::regclass LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.admin_sessions', pol.polname);
  END LOOP;
  FOR pol IN SELECT polname FROM pg_policy WHERE polrelid = 'public.advertisements'::regclass LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.advertisements', pol.polname);
  END LOOP;
  FOR pol IN SELECT polname FROM pg_policy WHERE polrelid = 'public.ad_analytics'::regclass LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.ad_analytics', pol.polname);
  END LOOP;
END $$;

CREATE POLICY "Public access news_posts" ON public.news_posts
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public access admin_users" ON public.admin_users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public access admin_sessions" ON public.admin_sessions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public access advertisements" ON public.advertisements
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public access ad_analytics" ON public.ad_analytics
  FOR ALL USING (true) WITH CHECK (true);

-- 6) Storage bucket + policies (news-images)
-- If you see: "must be owner of table objects"
-- it means your current SQL Editor role can't manage `storage.objects` policies.
-- In many Supabase projects, Storage tables are owned by `supabase_storage_admin`.
-- This block attempts to switch to that role when available; otherwise it skips without failing.
DO $$
DECLARE policies_notice_shown boolean := false;
BEGIN
  IF to_regclass('storage.objects') IS NULL OR to_regclass('storage.buckets') IS NULL THEN
    RAISE NOTICE 'Supabase Storage tables not found; skipping storage setup.';
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_storage_admin') THEN
    BEGIN
      EXECUTE 'SET ROLE supabase_storage_admin';
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  -- Bucket (safe to re-run)
  BEGIN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'news-images',
      'news-images',
      true,
      5242880,
      ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    )
    ON CONFLICT (id) DO UPDATE
    SET
      public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;
  EXCEPTION
    WHEN undefined_column THEN
      -- Older storage schema: fall back to minimal bucket definition.
      BEGIN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('news-images', 'news-images', true)
        ON CONFLICT (id) DO UPDATE
        SET public = EXCLUDED.public;
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping storage bucket creation (insufficient privileges). Create a public bucket named "news-images" in Dashboard > Storage.';
    WHEN OTHERS THEN
      RAISE NOTICE 'Skipping storage bucket creation: %', SQLERRM;
  END;

  -- Policies (ignore duplicates)
  BEGIN
    EXECUTE $news_images_policy$
      CREATE POLICY "Anyone can view news images"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'news-images');
    $news_images_policy$;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN insufficient_privilege THEN
      IF NOT policies_notice_shown THEN
        RAISE NOTICE 'Skipping storage.objects policies (insufficient privileges). Add policies in Dashboard > Storage > Policies.';
        policies_notice_shown := true;
      END IF;
  END;

  BEGIN
    EXECUTE $news_images_policy$
      CREATE POLICY "Anyone can upload news images"
      ON storage.objects
      FOR INSERT
      WITH CHECK (bucket_id = 'news-images');
    $news_images_policy$;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN insufficient_privilege THEN
      IF NOT policies_notice_shown THEN
        RAISE NOTICE 'Skipping storage.objects policies (insufficient privileges). Add policies in Dashboard > Storage > Policies.';
        policies_notice_shown := true;
      END IF;
  END;

  BEGIN
    EXECUTE $news_images_policy$
      CREATE POLICY "Anyone can update news images"
      ON storage.objects
      FOR UPDATE
      USING (bucket_id = 'news-images')
      WITH CHECK (bucket_id = 'news-images');
    $news_images_policy$;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN insufficient_privilege THEN
      IF NOT policies_notice_shown THEN
        RAISE NOTICE 'Skipping storage.objects policies (insufficient privileges). Add policies in Dashboard > Storage > Policies.';
        policies_notice_shown := true;
      END IF;
  END;

  BEGIN
    EXECUTE $news_images_policy$
      CREATE POLICY "Anyone can delete news images"
      ON storage.objects
      FOR DELETE
      USING (bucket_id = 'news-images');
    $news_images_policy$;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN insufficient_privilege THEN
      IF NOT policies_notice_shown THEN
        RAISE NOTICE 'Skipping storage.objects policies (insufficient privileges). Add policies in Dashboard > Storage > Policies.';
        policies_notice_shown := true;
      END IF;
  END;

  BEGIN
    EXECUTE 'RESET ROLE';
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;

-- 7) Seed admin + sample content (only if empty)
-- Default admin: admin / admin123
INSERT INTO public.admin_users (username, password_hash)
VALUES ('admin', '$2a$12$wJgYKJzTKG88a.MG.qLJ.eQKitDNGTJIfos.42J67mEdLXdCqRQ5S')
ON CONFLICT (username) DO NOTHING;

DO $$
BEGIN
  IF (SELECT COUNT(*) FROM public.news_posts) = 0 THEN
    INSERT INTO public.news_posts (title, content, summary, category, image_url)
    VALUES
      (
        'Welcome to Sajha News Online',
        'Welcome to Sajha News Online. This is a sample post — you can delete it from the admin portal once your site is live.',
        'Welcome to Sajha News Online.',
        'latest',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop'
      ),
      (
        'Breaking: Sample Headline',
        'This is a sample breaking news post used to verify layouts, cards, and share actions.',
        'Sample breaking news post.',
        'breaking',
        'https://images.unsplash.com/photo-1594736797933-d0fa2fe2c813?w=800&h=400&fit=crop'
      ),
      (
        'Politics: Sample Story',
        'This is a sample politics post. Replace with real content from your admin portal.',
        'Sample politics post.',
        'politics',
        'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=400&fit=crop'
      ),
      (
        'Sports: Sample Update',
        'This is a sample sports post. Replace with real content from your admin portal.',
        'Sample sports post.',
        'sports',
        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=400&fit=crop'
      ),
      (
        'Business: Sample Market News',
        'This is a sample business post. Replace with real content from your admin portal.',
        'Sample business post.',
        'business',
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop'
      ),
      (
        'Entertainment: Sample Feature',
        'This is a sample entertainment post. Replace with real content from your admin portal.',
        'Sample entertainment post.',
        'entertainment',
        'https://images.unsplash.com/photo-1489599856826-2b3d0d4e84c1?w=800&h=400&fit=crop'
      );
  END IF;
END $$;

DO $$
BEGIN
  IF (SELECT COUNT(*) FROM public.advertisements) = 0 THEN
    INSERT INTO public.advertisements (title, description, image_url, click_url, placement, priority, start_date, status)
    VALUES
      ('Nepal Tourism Board', 'Visit Nepal - Discover the beauty of Nepal', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=728&h=90&fit=crop', 'https://www.welcomenepal.com', 'header', 1, NOW(), 'active'),
      ('Local Business Ad', 'Best restaurant in Kathmandu - Authentic Nepali cuisine', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=300&h=250&fit=crop', 'https://example-restaurant.com', 'sidebar_top', 2, NOW(), 'active'),
      ('Tech Company', 'Leading IT solutions in Nepal - Digital transformation experts', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=728&h=90&fit=crop', 'https://example-tech.com', 'in_content', 1, NOW(), 'active'),
      ('Banking Services', 'Modern banking for modern Nepal - Open your account today', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&h=600&fit=crop', 'https://example-bank.com', 'sidebar_mid', 1, NOW(), 'active'),
      ('Education Institute', 'Quality education in Nepal - Enroll now for better future', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=728&h=90&fit=crop', 'https://example-education.com', 'footer', 3, NOW(), 'active');
  END IF;
END $$;

SELECT 'Sajha News Online: Supabase setup completed successfully.' AS message;
