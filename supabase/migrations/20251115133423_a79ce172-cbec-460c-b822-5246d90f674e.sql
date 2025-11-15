-- Fix search path for validate_status_expiry function
CREATE OR REPLACE FUNCTION validate_status_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at <= now() THEN
    RAISE EXCEPTION 'expires_at must be in the future';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public;

-- Fix search path for delete_expired_statuses function
CREATE OR REPLACE FUNCTION delete_expired_statuses()
RETURNS void AS $$
BEGIN
  DELETE FROM public.statuses WHERE expires_at <= now();
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public;