-- Add last_activity column to user_session_logs table
ALTER TABLE public.user_session_logs 
ADD COLUMN IF NOT EXISTS last_activity timestamptz DEFAULT now();

-- Update existing records to have last_activity
UPDATE public.user_session_logs 
SET last_activity = session_start 
WHERE last_activity IS NULL; 