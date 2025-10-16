-- Fix Storage Permissions (Bucket Already Exists)
-- Run this in your Supabase SQL Editor

-- First, drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow all" ON storage.objects;
DROP POLICY IF EXISTS "Public can view news images" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to news images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view news images" ON storage.objects;

-- Create simple policies for the news-images bucket
CREATE POLICY "Anyone can view news images" ON storage.objects
  FOR SELECT USING (bucket_id = 'news-images');

CREATE POLICY "Anyone can upload news images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'news-images');

CREATE POLICY "Anyone can update news images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'news-images');

CREATE POLICY "Anyone can delete news images" ON storage.objects
  FOR DELETE USING (bucket_id = 'news-images');

-- Make sure the bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'news-images';

SELECT 'Storage permissions fixed! You can now upload images.' as message;