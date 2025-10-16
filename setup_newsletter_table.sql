-- Create newsletter_subscribers table for the NewzNepal newsletter feature
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to insert (subscribe) - using anon role
CREATE POLICY "Allow public to subscribe to newsletter" 
ON newsletter_subscribers FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Policy to allow anyone to read subscribers (for the API)
CREATE POLICY "Allow public to read subscribers" 
ON newsletter_subscribers FOR SELECT 
TO anon, authenticated
USING (true);

-- Policy to allow anyone to update subscribers (unsubscribe, etc.)
CREATE POLICY "Allow public to update subscribers" 
ON newsletter_subscribers FOR UPDATE 
TO anon, authenticated
USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON newsletter_subscribers(active);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed_at ON newsletter_subscribers(subscribed_at);

-- Create function to auto-update the updated_at column
CREATE OR REPLACE FUNCTION update_newsletter_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER trigger_newsletter_subscribers_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_subscribers_updated_at();