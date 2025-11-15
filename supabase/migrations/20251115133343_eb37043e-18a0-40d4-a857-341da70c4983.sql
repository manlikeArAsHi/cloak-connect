-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_suspended BOOLEAN DEFAULT false,
  suspend_reason TEXT,
  suspended_at TIMESTAMPTZ
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Create groups table
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('level', 'interest')),
  level TEXT CHECK (level IN ('100lvl', '200lvl', '300lvl', '400lvl')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create group_members table
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_voice_note BOOLEAN DEFAULT false,
  voice_note_url TEXT
);

-- Create statuses table
CREATE TABLE public.statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Create trigger function for validating expires_at
CREATE OR REPLACE FUNCTION validate_status_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at <= now() THEN
    RAISE EXCEPTION 'expires_at must be in the future';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status validation
CREATE TRIGGER check_status_expiry
  BEFORE INSERT OR UPDATE ON public.statuses
  FOR EACH ROW
  EXECUTE FUNCTION validate_status_expiry();

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(reported_user_id, reporter_id)
);

-- Create appeals table
CREATE TABLE public.appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Create wallpapers storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('wallpapers', 'wallpapers', true);

-- Create voice_notes storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('voice-notes', 'voice-notes', false);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appeals ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles RLS policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- User roles RLS policies
CREATE POLICY "Anyone can view roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Groups RLS policies
CREATE POLICY "Anyone can view groups"
  ON public.groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage groups"
  ON public.groups FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Group members RLS policies
CREATE POLICY "Anyone can view group members"
  ON public.group_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join groups"
  ON public.group_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON public.group_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Messages RLS policies
CREATE POLICY "Group members can view messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = messages.group_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = messages.group_id AND user_id = auth.uid()
    )
  );

-- Statuses RLS policies
CREATE POLICY "Anyone can view non-expired statuses"
  ON public.statuses FOR SELECT
  TO authenticated
  USING (expires_at > now());

CREATE POLICY "Users can create their own statuses"
  ON public.statuses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own statuses"
  ON public.statuses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Reports RLS policies
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
  ON public.reports FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Appeals RLS policies
CREATE POLICY "Users can create their own appeals"
  ON public.appeals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own appeals"
  ON public.appeals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update appeals"
  ON public.appeals FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Storage RLS policies for wallpapers
CREATE POLICY "Anyone can view wallpapers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wallpapers');

CREATE POLICY "Authenticated users can upload wallpapers"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'wallpapers');

-- Storage RLS policies for voice notes
CREATE POLICY "Group members can view voice notes"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'voice-notes');

CREATE POLICY "Users can upload voice notes"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.statuses;

-- Function to auto-suspend users after 3 reports
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER auto_suspend_after_reports
  AFTER INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION check_and_suspend_user();

-- Function to delete expired statuses
CREATE OR REPLACE FUNCTION delete_expired_statuses()
RETURNS void AS $$
BEGIN
  DELETE FROM public.statuses WHERE expires_at <= now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create default groups
INSERT INTO public.groups (name, type, level, description) VALUES
  ('100 Level', 'level', '100lvl', 'First year students'),
  ('200 Level', 'level', '200lvl', 'Second year students'),
  ('300 Level', 'level', '300lvl', 'Third year students'),
  ('400 Level', 'level', '400lvl', 'Final year students'),
  ('General Chat', 'interest', NULL, 'General discussion'),
  ('Study Group', 'interest', NULL, 'Academic discussions'),
  ('Sports & Fitness', 'interest', NULL, 'Sports and fitness activities');