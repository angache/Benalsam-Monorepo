-- Check if the unique constraint exists
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.user_session_logs'::regclass
AND conname = 'unique_user_session';

-- Check all constraints on the table
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.user_session_logs'::regclass;

-- Check table structure
\d public.user_session_logs 