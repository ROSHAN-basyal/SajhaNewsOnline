-- Fix RLS policies for newsletter_subscribers table
-- Run this in your Supabase SQL Editor if you're getting RLS policy errors

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public to subscribe to newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow authenticated users to read subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow authenticated users to update subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow public to read subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow public to update subscribers" ON newsletter_subscribers;

-- Create new policies that work with anon role
CREATE POLICY "Allow public to subscribe to newsletter" 
ON newsletter_subscribers FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public to read subscribers" 
ON newsletter_subscribers FOR SELECT 
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public to update subscribers" 
ON newsletter_subscribers FOR UPDATE 
TO anon, authenticated
USING (true);