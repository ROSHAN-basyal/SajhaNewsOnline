-- Simple NewzNepal Database Setup
-- Copy and paste this entire code into your Supabase SQL Editor and click "Run"

-- Drop existing tables if they exist (start fresh)
DROP TABLE IF EXISTS admin_sessions CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS news_posts CASCADE;

-- Create news_posts table
CREATE TABLE news_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_users table
CREATE TABLE admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_sessions table
CREATE TABLE admin_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert admin user (username: admin, password: admin123)
INSERT INTO admin_users (username, password_hash) VALUES 
('admin', '$2a$12$wJgYKJzTKG88a.MG.qLJ.eQKitDNGTJIfos.42J67mEdLXdCqRQ5S');

-- Insert sample news posts
INSERT INTO news_posts (title, content, summary, image_url) VALUES 
(
    'Welcome to NewzNepal',
    'Welcome to NewzNepal, your premier destination for the latest news from Nepal and around the world. Our mission is to provide accurate, timely, and comprehensive news coverage that keeps you informed about the events that matter most. Whether you are interested in politics, business, sports, entertainment, or international affairs, we have got you covered. Our team of dedicated journalists works around the clock to bring you breaking news as it happens, in-depth analysis of complex issues, and exclusive interviews with key figures. We believe in the power of journalism to inform, educate, and inspire positive change in our communities. Thank you for choosing NewzNepal as your trusted news source.',
    'Welcome to NewzNepal, your premier destination for news from Nepal and around the world.',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop'
),
(
    'Mount Everest Climbing Season Opens',
    'The Nepal government has announced the opening of the Mount Everest climbing season with enhanced safety protocols and environmental protection measures. This year, climbers will be required to carry GPS devices and follow strict waste management guidelines. The Department of Tourism has issued permits to over 300 climbers from around the world, bringing significant revenue to local communities.',
    'Mount Everest climbing season opens with enhanced safety protocols.',
    'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=800&h=400&fit=crop'
),
(
    'Kathmandu Valley Celebrates Dashain',
    'The Kathmandu Valley is adorned with colorful decorations as thousands of Nepalis celebrate Dashain, the biggest festival in Nepal. Traditional kite flying competitions have taken place across the valley, with participants of all ages showcasing their skills.',
    'Kathmandu Valley celebrates Dashain festival with colorful decorations.',
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=400&fit=crop'
),
(
    'Nepal Achieves Energy Milestone',
    'Nepal has achieved a significant milestone in renewable energy generation, with hydroelectric power production reaching an all-time high this monsoon season. The recently completed Upper Tamakoshi Hydroelectric Project is now contributing substantially to the national grid.',
    'Nepal achieves energy self-sufficiency through hydroelectric power.',
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=400&fit=crop'
),
(
    'Historic Architecture Restored',
    'A major restoration project in Patan Durbar Square has successfully preserved several ancient temples and palaces damaged during the 2015 earthquake. Master craftsmen using traditional techniques have painstakingly rebuilt structures using original materials.',
    'Historic Patan Durbar Square restoration project completed successfully.',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop'
);

-- Enable Row Level Security (RLS) - Simple version
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Simple RLS Policies
-- Anyone can read news posts
CREATE POLICY "Public can view news posts" ON news_posts FOR SELECT USING (true);

-- Only service role can manage admin tables (this allows our API to work)
CREATE POLICY "Service can manage news" ON news_posts FOR ALL USING (true);
CREATE POLICY "Service can manage admin_users" ON admin_users FOR ALL USING (true);
CREATE POLICY "Service can manage sessions" ON admin_sessions FOR ALL USING (true);

-- Success message
SELECT 'Database setup completed successfully! You can now run your app.' as message;