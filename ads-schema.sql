-- Advertisement Management System Schema
-- Run this in your Supabase SQL editor to set up the ads system

-- Create ads table for banner advertisements
CREATE TABLE IF NOT EXISTS advertisements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    click_url TEXT NOT NULL,
    placement VARCHAR(50) NOT NULL CHECK (placement IN ('header', 'sidebar_top', 'in_content', 'sidebar_mid', 'footer')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired', 'draft')),
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 10),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    target_impressions INTEGER DEFAULT 0,
    target_clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ad_analytics table for tracking performance
CREATE TABLE IF NOT EXISTS ad_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID REFERENCES advertisements(id) ON DELETE CASCADE,
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('impression', 'click')),
    user_ip VARCHAR(45), -- Support both IPv4 and IPv6
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ads_placement_status ON advertisements(placement, status);
CREATE INDEX IF NOT EXISTS idx_ads_priority ON advertisements(priority DESC);
CREATE INDEX IF NOT EXISTS idx_ads_dates ON advertisements(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_analytics_ad_id ON ad_analytics(ad_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON ad_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON ad_analytics(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ad_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_ads_updated_at
    BEFORE UPDATE ON advertisements
    FOR EACH ROW
    EXECUTE FUNCTION update_ad_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for advertisements (public read, admin write)
CREATE POLICY "Anyone can view active ads" ON advertisements
    FOR SELECT USING (status = 'active' AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW()));

CREATE POLICY "Only authenticated admins can manage ads" ON advertisements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_sessions 
            WHERE session_token = current_setting('request.jwt.claims', true)::json->>'session_token'
            AND expires_at > NOW()
        )
    );

-- Create policies for ad_analytics (admin only)
CREATE POLICY "Only authenticated admins can view ad analytics" ON ad_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_sessions 
            WHERE session_token = current_setting('request.jwt.claims', true)::json->>'session_token'
            AND expires_at > NOW()
        )
    );

-- Insert sample advertisements for demonstration
INSERT INTO advertisements (title, description, image_url, click_url, placement, priority, start_date) VALUES 
('Nepal Tourism Board', 'Visit Nepal 2024 - Discover the beauty of Nepal', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=728&h=90&fit=crop', 'https://www.welcomenepal.com', 'header', 1, NOW()),
('Local Business Ad', 'Best restaurant in Kathmandu - Authentic Nepali cuisine', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=300&h=250&fit=crop', 'https://example-restaurant.com', 'sidebar_top', 2, NOW()),
('Tech Company', 'Leading IT solutions in Nepal - Digital transformation experts', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=728&h=90&fit=crop', 'https://example-tech.com', 'in_content', 1, NOW()),
('Banking Services', 'Modern banking for modern Nepal - Open your account today', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&h=600&fit=crop', 'https://example-bank.com', 'sidebar_mid', 1, NOW()),
('Education Institute', 'Quality education in Nepal - Enroll now for better future', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=728&h=90&fit=crop', 'https://example-education.com', 'footer', 3, NOW());

-- Create view for ad analytics summary
CREATE OR REPLACE VIEW ad_performance_summary AS
SELECT 
    a.id,
    a.title,
    a.placement,
    a.status,
    a.start_date,
    a.end_date,
    COALESCE(impressions.count, 0) as total_impressions,
    COALESCE(clicks.count, 0) as total_clicks,
    CASE 
        WHEN COALESCE(impressions.count, 0) > 0 
        THEN ROUND((COALESCE(clicks.count, 0)::decimal / impressions.count::decimal) * 100, 2)
        ELSE 0
    END as ctr_percentage,
    a.created_at,
    a.updated_at
FROM advertisements a
LEFT JOIN (
    SELECT ad_id, COUNT(*) as count 
    FROM ad_analytics 
    WHERE event_type = 'impression' 
    GROUP BY ad_id
) impressions ON a.id = impressions.ad_id
LEFT JOIN (
    SELECT ad_id, COUNT(*) as count 
    FROM ad_analytics 
    WHERE event_type = 'click' 
    GROUP BY ad_id
) clicks ON a.id = clicks.ad_id
ORDER BY a.priority DESC, a.created_at DESC;

COMMENT ON TABLE advertisements IS 'Banner advertisements with placement and scheduling';
COMMENT ON TABLE ad_analytics IS 'Advertisement performance tracking';
COMMENT ON VIEW ad_performance_summary IS 'Summary view of ad performance with CTR calculations';