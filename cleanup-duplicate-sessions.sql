-- Duplicate session'ları temizle (aynı session_id için sadece en yeni olanı tut)
WITH ranked_sessions AS (
  SELECT 
    id,
    session_id,
    user_id,
    last_activity,
    ROW_NUMBER() OVER (
      PARTITION BY session_id 
      ORDER BY last_activity DESC, created_at DESC
    ) as rn
  FROM public.user_session_logs 
  WHERE status = 'active'
)
DELETE FROM public.user_session_logs 
WHERE id IN (
  SELECT id 
  FROM ranked_sessions 
  WHERE rn > 1
);

-- Sonuçları kontrol et
SELECT 
    session_id,
    COUNT(*) as duplicate_count
FROM public.user_session_logs 
WHERE status = 'active'
GROUP BY session_id 
HAVING COUNT(*) > 1; 