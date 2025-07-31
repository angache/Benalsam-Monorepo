-- Aktif session'ları kontrol et
SELECT 
    id,
    user_id,
    session_id,
    ip_address,
    user_agent,
    session_start,
    last_activity,
    status,
    metadata
FROM public.user_session_logs 
WHERE status = 'active' 
ORDER BY last_activity DESC;

-- Session sayılarını özetle
SELECT 
    status,
    COUNT(*) as count,
    MAX(last_activity) as latest_activity
FROM public.user_session_logs 
GROUP BY status 
ORDER BY status;

-- Son 24 saatteki session aktivitelerini kontrol et
SELECT 
    DATE_TRUNC('hour', last_activity) as hour,
    COUNT(*) as activity_count,
    COUNT(DISTINCT user_id) as unique_users
FROM public.user_session_logs 
WHERE last_activity >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', last_activity)
ORDER BY hour DESC;

-- Eski session'ları terminate et (24 saatten eski)
UPDATE public.user_session_logs 
SET status = 'terminated', 
    session_end = NOW(),
    session_duration = (NOW() - session_start)::interval
WHERE status = 'active' 
  AND last_activity < NOW() - INTERVAL '24 hours'; 