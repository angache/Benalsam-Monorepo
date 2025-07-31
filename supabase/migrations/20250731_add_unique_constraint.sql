-- Add unique constraint for session logging
-- This constraint allows the Edge Function to use onConflict: 'user_id,session_id'

-- Drop existing index if it exists
DROP INDEX IF EXISTS unique_active_session_per_user_session;

-- Create unique constraint for upsert operations
ALTER TABLE public.user_session_logs 
ADD CONSTRAINT unique_user_session 
UNIQUE (user_id, session_id);

-- Create index for active sessions (for performance)
CREATE INDEX idx_user_session_logs_active 
ON public.user_session_logs (user_id, session_id) 
WHERE status = 'active'; 