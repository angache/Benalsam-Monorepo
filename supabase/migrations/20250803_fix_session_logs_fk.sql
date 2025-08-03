-- Fix foreign key constraint for user_session_logs table
-- This migration adds CASCADE DELETE to prevent FK constraint violations

-- Drop the existing foreign key constraint
ALTER TABLE user_session_logs 
DROP CONSTRAINT IF EXISTS user_session_logs_session_id_fkey;

-- Add the foreign key constraint with CASCADE DELETE
ALTER TABLE user_session_logs 
ADD CONSTRAINT user_session_logs_session_id_fkey 
FOREIGN KEY (session_id) REFERENCES auth.sessions(id) 
ON DELETE CASCADE;

-- Clean up orphaned session logs (optional)
DELETE FROM user_session_logs 
WHERE session_id NOT IN (SELECT id FROM auth.sessions);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_session_logs_session_id 
ON user_session_logs(session_id);

-- Add index for timestamp queries
CREATE INDEX IF NOT EXISTS idx_user_session_logs_created_at 
ON user_session_logs(created_at); 