-- Debug constraint issue
-- Check if constraint exists and its exact definition

-- 1. Check all constraints on user_session_logs table
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition,
    conkey as column_numbers
FROM pg_constraint 
WHERE conrelid = 'public.user_session_logs'::regclass
ORDER BY conname;

-- 2. Check table columns for exact names
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_session_logs' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if there are any unique constraints
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'user_session_logs' 
AND tc.table_schema = 'public'
AND tc.constraint_type = 'UNIQUE'
ORDER BY tc.constraint_name, kcu.ordinal_position; 