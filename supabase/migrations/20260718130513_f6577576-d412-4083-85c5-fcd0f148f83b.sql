
-- 1) Comment moderation: add status column
ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved'
  CHECK (status IN ('pending','approved','rejected'));

CREATE INDEX IF NOT EXISTS comments_status_idx ON public.comments (status);

-- 2) Replace public read policy to only expose approved comments
DROP POLICY IF EXISTS "comments public read" ON public.comments;
CREATE POLICY "comments public read approved"
  ON public.comments FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Admins can read all comments (for moderation)
DROP POLICY IF EXISTS "admins read all comments" ON public.comments;
CREATE POLICY "admins read all comments"
  ON public.comments FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update comments (approve / reject)
DROP POLICY IF EXISTS "admins update comments" ON public.comments;
CREATE POLICY "admins update comments"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3) Normalize founder email check + also verify on email confirm
CREATE OR REPLACE FUNCTION public.grant_admin_for_founder()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  if new.email is not null
     and lower(btrim(new.email)) = 'reversflowstudio@gmail.com'
     and new.email_confirmed_at is not null then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin')
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created_grant_founder ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_founder
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_admin_for_founder();

DROP TRIGGER IF EXISTS on_auth_user_confirmed_grant_founder ON auth.users;
CREATE TRIGGER on_auth_user_confirmed_grant_founder
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (old.email_confirmed_at IS NULL AND new.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.grant_admin_for_founder();
