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

-- Create admin_users table for authentication
CREATE TABLE admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_sessions table for persistent login
CREATE TABLE admin_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user (username: admin, password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO admin_users (username, password_hash) VALUES 
('admin', '$2a$12$wJgYKJzTKG88a.MG.qLJ.eQKitDNGTJIfos.42J67mEdLXdCqRQ5S');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_news_posts_updated_at
    BEFORE UPDATE ON news_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for news_posts (public read, admin write)
CREATE POLICY "Anyone can view news posts" ON news_posts
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated admins can insert news posts" ON news_posts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_sessions 
            WHERE session_token = current_setting('request.jwt.claims', true)::json->>'session_token'
            AND expires_at > NOW()
        )
    );

CREATE POLICY "Only authenticated admins can update news posts" ON news_posts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_sessions 
            WHERE session_token = current_setting('request.jwt.claims', true)::json->>'session_token'
            AND expires_at > NOW()
        )
    );

CREATE POLICY "Only authenticated admins can delete news posts" ON news_posts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM admin_sessions 
            WHERE session_token = current_setting('request.jwt.claims', true)::json->>'session_token'
            AND expires_at > NOW()
        )
    );

-- Admin tables are only accessible to authenticated admins
CREATE POLICY "Only authenticated admins can view admin_users" ON admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_sessions 
            WHERE session_token = current_setting('request.jwt.claims', true)::json->>'session_token'
            AND expires_at > NOW()
        )
    );

CREATE POLICY "Only authenticated admins can manage sessions" ON admin_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_sessions 
            WHERE session_token = current_setting('request.jwt.claims', true)::json->>'session_token'
            AND expires_at > NOW()
        )
    );

-- Insert sample news posts with images
INSERT INTO news_posts (title, content, summary, image_url) VALUES 
(
    'Welcome to NewzNepal',
    'Welcome to NewzNepal, your premier destination for the latest news from Nepal and around the world. Our mission is to provide accurate, timely, and comprehensive news coverage that keeps you informed about the events that matter most. Whether you are interested in politics, business, sports, entertainment, or international affairs, we have got you covered. Our team of dedicated journalists works around the clock to bring you breaking news as it happens, in-depth analysis of complex issues, and exclusive interviews with key figures. We believe in the power of journalism to inform, educate, and inspire positive change in our communities. Thank you for choosing NewzNepal as your trusted news source.',
    'Welcome to NewzNepal, your premier destination for news from Nepal and around the world.',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop'
),
(
    'Mount Everest Climbing Season Opens with New Safety Measures',
    'The Nepal government has announced the opening of the Mount Everest climbing season with enhanced safety protocols and environmental protection measures. This year, climbers will be required to carry GPS devices and follow strict waste management guidelines. The Department of Tourism has issued permits to over 300 climbers from around the world, bringing significant revenue to local communities. New weather monitoring systems have been installed at various altitudes to provide real-time updates to climbers and base camp operators. The Sherpa community has been actively involved in implementing these safety measures, drawing from their extensive experience and traditional knowledge of the mountain. Additionally, helicopter rescue services have been improved with better equipment and training for high-altitude operations.',
    'Mount Everest climbing season opens with enhanced safety protocols and environmental protection measures.',
    'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=800&h=400&fit=crop'
),
(
    'Kathmandu Valley Celebrates Dashain Festival with Grand Festivities',
    'The Kathmandu Valley is adorned with colorful decorations as thousands of Nepalis celebrate Dashain, the biggest festival in Nepal. Traditional kite flying competitions have taken place across the valley, with participants of all ages showcasing their skills. Local markets are bustling with shoppers purchasing new clothes, gifts, and festival essentials. The historic Durbar Squares of Kathmandu, Patan, and Bhaktapur are hosting cultural programs featuring traditional music, dance, and theatrical performances. Families are coming together from across the country to celebrate this auspicious occasion, sharing traditional delicacies and exchanging blessings. The festival also marks an important time for tourism, with many international visitors experiencing Nepali culture firsthand.',
    'Kathmandu Valley celebrates Dashain festival with colorful decorations and traditional festivities.',
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=400&fit=crop'
),
(
    'Nepal''s Hydroelectric Power Generation Reaches New Milestone',
    'Nepal has achieved a significant milestone in renewable energy generation, with hydroelectric power production reaching an all-time high this monsoon season. The recently completed Upper Tamakoshi Hydroelectric Project is now contributing substantially to the national grid, reducing Nepal''s dependency on imported electricity. Government officials report that the country is now generating enough electricity to meet domestic demand and has begun exporting surplus power to neighboring India. This development is expected to boost Nepal''s economy and provide reliable electricity to rural areas that have historically faced power shortages. Environmental groups have praised the focus on clean energy, noting that hydroelectric power aligns with Nepal''s commitment to carbon neutrality. The success has encouraged further investment in renewable energy projects across the country.',
    'Nepal''s hydroelectric power generation reaches new heights, achieving energy self-sufficiency.',
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=400&fit=crop'
),
(
    'Traditional Nepali Architecture Restored in Historic Patan Durbar Square',
    'A major restoration project in Patan Durbar Square has successfully preserved several ancient temples and palaces damaged during the 2015 earthquake. Master craftsmen using traditional techniques have painstakingly rebuilt structures using original materials and methods passed down through generations. The project, supported by international heritage organizations, has become a model for earthquake-resistant traditional architecture. Local artisans have been trained in traditional woodcarving, metalwork, and stone masonry, ensuring these ancient skills are preserved for future generations. Tourists and locals alike are amazed by the attention to detail in the restoration work, which maintains the historical authenticity of this UNESCO World Heritage site. The completion of this project marks a significant step in Nepal''s post-earthquake cultural recovery.',
    'Historic Patan Durbar Square sees successful restoration of earthquake-damaged traditional architecture.',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop'
),
(
    'Nepal''s Tea Industry Gains International Recognition for Quality',
    'Nepali tea has received international acclaim at the World Tea Championship, with several gardens from Ilam and Dhankuta districts winning prestigious awards. The high-altitude growing conditions and traditional processing methods have produced teas that rival the finest varieties from Darjeeling and Assam. Small-scale farmers are benefiting from fair trade initiatives that ensure better prices for their premium tea leaves. International buyers are increasingly interested in Nepali orthodox teas, creating new export opportunities for local producers. The government has launched programs to support tea farmers with modern processing equipment while maintaining traditional quality standards. This recognition is expected to significantly boost Nepal''s tea exports and provide sustainable income for thousands of farming families.',
    'Nepali tea wins international awards, boosting recognition for high-altitude grown varieties.',
    'https://images.unsplash.com/photo-1558618047-67c7353ecb11?w=800&h=400&fit=crop'
),
(
    'Wildlife Conservation Success: Tiger Population Increases in Chitwan National Park',
    'Chitwan National Park has reported a significant increase in its tiger population, marking a conservation success story for Nepal. The latest wildlife census shows a 30% increase in tiger numbers compared to the previous count five years ago. Anti-poaching efforts have been strengthened with community involvement and modern surveillance technology. Local communities living around the park buffer zone have been actively participating in conservation programs, receiving alternative livelihood support. The success is attributed to improved habitat management, reduced human-wildlife conflict, and international conservation partnerships. Tourist numbers have also increased as visitors come to experience Nepal''s remarkable wildlife recovery story.',
    'Tiger population in Chitwan National Park shows remarkable 30% increase due to conservation efforts.',
    'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&h=400&fit=crop'
),
(
    'Startup Revolution: Young Entrepreneurs Transform Nepal''s Tech Landscape',
    'A new generation of young entrepreneurs is revolutionizing Nepal''s technology sector with innovative startups addressing local and global challenges. From fintech solutions for rural banking to agricultural apps helping farmers access market information, these startups are making significant social and economic impact. The government has launched several incubation programs and funding initiatives to support young entrepreneurs. Co-working spaces in Kathmandu and Pokhara are buzzing with activity as tech enthusiasts collaborate on cutting-edge projects. International investors are taking notice of Nepal''s growing startup ecosystem, leading to increased funding opportunities. These developments are creating high-skilled job opportunities and positioning Nepal as an emerging tech hub in South Asia.',
    'Young entrepreneurs are transforming Nepal''s technology sector with innovative startups and solutions.',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop'
),
(
    'Ancient Buddhist Monastery in Mustang Opens to International Researchers',
    'A 1,000-year-old Buddhist monastery in Upper Mustang has opened its doors to international researchers for the first time, revealing precious manuscripts and artifacts. The monastery, located in the remote Trans-Himalayan region, contains one of the largest collections of Tibetan Buddhist texts outside of Tibet. Scholars from around the world are collaborating with local monks to digitize and preserve these ancient documents. The project is expected to provide new insights into Buddhist philosophy, art, and culture from medieval times. Local communities are excited about the increased attention their heritage is receiving, while ensuring that tourism development remains sustainable and respectful of their traditions. The monastery''s opening represents a significant step in Nepal''s efforts to preserve and share its rich cultural heritage.',
    'Ancient Buddhist monastery in Mustang opens to researchers, revealing precious manuscripts and artifacts.',
    'https://images.unsplash.com/photo-1544736151-6e4b9c2c9dd8?w=800&h=400&fit=crop'
),
(
    'Organic Farming Movement Grows Across Nepal''s Rural Communities',
    'Rural communities across Nepal are embracing organic farming practices, with thousands of farmers transitioning from chemical-intensive agriculture to sustainable methods. Government extension programs are providing training on natural pest control, composting, and crop rotation techniques. Organic cooperatives are helping farmers access premium markets and obtain better prices for their produce. International certification organizations have recognized several Nepali organic farms, opening doors to export opportunities. The movement is not only improving farmer incomes but also protecting soil health and water resources for future generations. Urban consumers are increasingly demanding organic products, creating a growing domestic market for chemical-free agricultural produce.',
    'Organic farming movement spreads across Nepal, with rural communities adopting sustainable agriculture practices.',
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop'
);