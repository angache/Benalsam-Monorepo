-- Duplicate session'ları önlemek için trigger function (silme yok, sadece terminate)
CREATE OR REPLACE FUNCTION prevent_duplicate_active_sessions()
RETURNS TRIGGER AS $$
BEGIN
  -- Eğer yeni session aktifse, aynı session_id için diğer aktif session'ları terminate et (loglar kalır)
  IF NEW.status = 'active' THEN
    UPDATE public.user_session_logs 
    SET 
      status = 'terminated',
      session_end = NOW(),
      session_duration = (NOW() - session_start)::interval,
      updated_at = NOW()
    WHERE session_id = NEW.session_id 
      AND status = 'active' 
      AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger'ı oluştur
DROP TRIGGER IF EXISTS prevent_duplicate_sessions_trigger ON public.user_session_logs;
CREATE TRIGGER prevent_duplicate_sessions_trigger
  BEFORE INSERT OR UPDATE ON public.user_session_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_active_sessions();

-- Session cleanup function (günlük çalışacak) - Sadece terminate, silme yok
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $$
BEGIN
  -- 24 saatten eski aktif session'ları terminate et (loglar kalır)
  UPDATE public.user_session_logs 
  SET 
    status = 'terminated',
    session_end = NOW(),
    session_duration = (NOW() - session_start)::interval,
    updated_at = NOW()
  WHERE status = 'active' 
    AND last_activity < NOW() - INTERVAL '24 hours';
    
  -- 7 günden eski terminated session'ları sil (opsiyonel - audit trail için kapatıldı)
  -- DELETE FROM public.user_session_logs 
  -- WHERE status = 'terminated' 
  --   AND session_end < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Duplicate session'ları terminate etmek için function (silme yok)
CREATE OR REPLACE FUNCTION terminate_duplicate_sessions()
RETURNS void AS $$
BEGIN
  -- Aynı session_id için eski aktif session'ları terminate et (en yeni olanı tut)
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
  UPDATE public.user_session_logs 
  SET 
    status = 'terminated',
    session_end = NOW(),
    session_duration = (NOW() - session_start)::interval,
    updated_at = NOW()
  WHERE id IN (
    SELECT id 
    FROM ranked_sessions 
    WHERE rn > 1
  );
END;
$$ LANGUAGE plpgsql;

-- Cron job için pg_cron extension (eğer yoksa)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Günlük cleanup job (pg_cron varsa)
-- SELECT cron.schedule('cleanup-old-sessions', '0 2 * * *', 'SELECT cleanup_old_sessions();'); 