-- Supabase Storage Setup for Image Uploads
-- Run this in your Supabase SQL Editor after running the main setup

-- Create storage bucket for news images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'news-images',
  'news-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
);

-- Allow public access to view images
CREATE POLICY "Anyone can view news images" ON storage.objects
  FOR SELECT USING (bucket_id = 'news-images');

-- Allow authenticated admins to upload images
CREATE POLICY "Authenticated admins can upload news images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'news-images' AND
    EXISTS (
      SELECT 1 FROM admin_sessions 
      WHERE session_token = current_setting('request.jwt.claims', true)::json->>'session_token'
      AND expires_at > NOW()
    )
  );

-- Allow authenticated admins to delete images
CREATE POLICY "Authenticated admins can delete news images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'news-images' AND
    EXISTS (
      SELECT 1 FROM admin_sessions 
      WHERE session_token = current_setting('request.jwt.claims', true)::json->>'session_token'
      AND expires_at > NOW()
    )
  );

SELECT 'Storage bucket created successfully! You can now upload images.' as message;