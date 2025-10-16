-- Simple Storage Setup (Alternative)
-- Use this if the main setup-storage.sql doesn't work

-- Create storage bucket for news images (simple version)
INSERT INTO storage.buckets (id, name, public)
VALUES ('news-images', 'news-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to view images
CREATE POLICY "Public can view news images" ON storage.objects
  FOR SELECT USING (bucket_id = 'news-images');

-- Allow all operations (simplified for development)
CREATE POLICY "Allow all operations on news images" ON storage.objects
  FOR ALL USING (bucket_id = 'news-images');

SELECT 'Simple storage bucket created successfully!' as message;