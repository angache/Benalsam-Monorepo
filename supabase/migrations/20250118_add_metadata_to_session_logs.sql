-- Add metadata column to user_session_logs table
ALTER TABLE public.user_session_logs 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb; 