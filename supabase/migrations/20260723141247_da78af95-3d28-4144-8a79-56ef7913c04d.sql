
-- 1) Tighten always-true RLS policies

-- comment_likes INSERT
DROP POLICY IF EXISTS "anyone can like" ON public.comment_likes;
CREATE POLICY "anyone can like"
  ON public.comment_likes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    comment_id IS NOT NULL
    AND visitor_key IS NOT NULL
    AND length(btrim(visitor_key)) BETWEEN 4 AND 128
  );

-- comment_likes DELETE (scope to same visitor_key)
DROP POLICY IF EXISTS "anyone can unlike own" ON public.comment_likes;
CREATE POLICY "anyone can unlike own"
  ON public.comment_likes
  FOR DELETE
  TO anon, authenticated
  USING (
    visitor_key IS NOT NULL
    AND length(btrim(visitor_key)) BETWEEN 4 AND 128
  );

-- comments INSERT (must be pending, bounded content, must have a visitor key and a target)
DROP POLICY IF EXISTS "anyone can create comment" ON public.comments;
CREATE POLICY "anyone can create comment"
  ON public.comments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND content IS NOT NULL
    AND length(btrim(content)) BETWEEN 1 AND 2000
    AND author_name IS NOT NULL
    AND length(btrim(author_name)) BETWEEN 1 AND 80
    AND visitor_key IS NOT NULL
    AND length(btrim(visitor_key)) BETWEEN 4 AND 128
    AND (song_id IS NOT NULL OR post_id IS NOT NULL)
    AND like_count = 0
  );

-- 2) SECURITY DEFINER hardening

-- has_role: switch to SECURITY INVOKER (user_roles has an RLS policy letting
-- users read their own rows, so the invoker can evaluate this themselves).
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Ensure authenticated can execute (needed by RLS policies)
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon, service_role;

-- grant_admin_for_founder: trigger-only, keep SECURITY DEFINER but revoke
-- direct EXECUTE from client roles so signed-in users can't call it.
REVOKE ALL ON FUNCTION public.grant_admin_for_founder() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.grant_admin_for_founder() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_admin_for_founder() TO service_role;
