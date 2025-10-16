-- Database Migration for Enhanced Admin Session Management
-- Run this in your Supabase SQL editor when you're ready for advanced features

-- Add new columns to admin_sessions table
ALTER TABLE admin_sessions 
ADD COLUMN IF NOT EXISTS device_id TEXT,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing sessions with default values
UPDATE admin_sessions 
SET 
  last_activity = NOW(),
  created_at = COALESCE(created_at, NOW()),
  device_id = COALESCE(device_id, 'legacy_device_' || gen_random_uuid()::text)
WHERE device_id IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_admin_sessions_device_id ON admin_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_last_activity ON admin_sessions(last_activity);

-- Optional: Create a function to clean up old sessions
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM admin_sessions 
  WHERE expires_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-sessions', '0 2 * * *', 'SELECT cleanup_old_sessions();');

COMMENT ON COLUMN admin_sessions.device_id IS 'Unique identifier for each login device';
COMMENT ON COLUMN admin_sessions.last_activity IS 'Timestamp of last session activity';
COMMENT ON COLUMN admin_sessions.created_at IS 'Session creation timestamp';