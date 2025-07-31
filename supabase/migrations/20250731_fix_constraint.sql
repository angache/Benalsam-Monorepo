-- Fix session logging constraint
-- This adds the proper unique constraint for upsert operations

-- First, check if constraint already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_user_session' 
        AND conrelid = 'public.user_session_logs'::regclass
    ) THEN
        -- Add unique constraint for upsert operations
        ALTER TABLE public.user_session_logs 
        ADD CONSTRAINT unique_user_session 
        UNIQUE (user_id, session_id);
        
        RAISE NOTICE 'Unique constraint added successfully';
    ELSE
        RAISE NOTICE 'Unique constraint already exists';
    END IF;
END $$;

-- Create performance index for active sessions
CREATE INDEX IF NOT EXISTS idx_user_session_logs_active 
ON public.user_session_logs (user_id, session_id) 
WHERE status = 'active'; 