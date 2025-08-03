-- Check foreign key constraint for user_session_logs table
-- This script verifies if the CASCADE DELETE has been properly applied

-- Method 1: Check constraint details
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'user_session_logs'
    AND kcu.column_name = 'session_id';

-- Method 2: Check if constraint exists and its properties
SELECT 
    conname AS constraint_name,
    confrelid::regclass AS referenced_table,
    confdeltype AS delete_action,
    confupdtype AS update_action
FROM pg_constraint 
WHERE conrelid = 'user_session_logs'::regclass 
    AND contype = 'f';

-- Method 3: Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_session_logs'
ORDER BY ordinal_position;

-- Method 4: Count orphaned records (should be 0 after cleanup)
SELECT COUNT(*) AS orphaned_session_logs
FROM user_session_logs 
WHERE session_id NOT IN (SELECT id FROM auth.sessions);

-- Method 5: Check if indexes were created
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'user_session_logs'; 