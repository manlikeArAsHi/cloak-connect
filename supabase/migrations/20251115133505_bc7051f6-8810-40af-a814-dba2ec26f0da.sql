-- Fix search path for check_and_suspend_user function
CREATE OR REPLACE FUNCTION check_and_suspend_user()
RETURNS TRIGGER AS $$
DECLARE
  report_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO report_count
  FROM public.reports
  WHERE reported_user_id = NEW.reported_user_id;
  
  IF report_count >= 3 THEN
    UPDATE public.profiles
    SET is_suspended = true,
        suspend_reason = 'Auto-suspended after 3 reports',
        suspended_at = now()
    WHERE id = NEW.reported_user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public;