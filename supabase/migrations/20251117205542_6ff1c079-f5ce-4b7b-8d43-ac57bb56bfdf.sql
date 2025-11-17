-- Create helper to avoid recursive RLS checks
CREATE OR REPLACE FUNCTION public.is_conversation_member(_conversation_id uuid, _user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_participants
    WHERE conversation_id = _conversation_id AND user_id = _user_id
  );
$$;

-- Fix conversation_participants policies to avoid recursion and allow adding the other participant
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;
CREATE POLICY "Users can view participants in their conversations"
ON public.conversation_participants
FOR SELECT
USING (public.is_conversation_member(conversation_id));

DROP POLICY IF EXISTS "Users can join conversations" ON public.conversation_participants;
CREATE POLICY "Users can join conversations"
ON public.conversation_participants
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  OR public.is_conversation_member(conversation_id)
);

-- Update conversations SELECT policy to use helper and avoid policy recursion during return=representation
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view their own conversations"
ON public.conversations
FOR SELECT
USING (public.is_conversation_member(id));

-- Update direct_messages policies to rely on helper too
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.direct_messages;
CREATE POLICY "Users can view messages in their conversations"
ON public.direct_messages
FOR SELECT
USING (public.is_conversation_member(conversation_id));

DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.direct_messages;
CREATE POLICY "Users can send messages in their conversations"
ON public.direct_messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND public.is_conversation_member(conversation_id)
);
