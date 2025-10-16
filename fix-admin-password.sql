-- Fix admin password hash
-- Run this in your Supabase SQL Editor if you're having login issues

UPDATE admin_users 
SET password_hash = '$2a$12$wJgYKJzTKG88a.MG.qLJ.eQKitDNGTJIfos.42J67mEdLXdCqRQ5S' 
WHERE username = 'admin';

-- Verify the admin user exists
SELECT username, created_at FROM admin_users WHERE username = 'admin';