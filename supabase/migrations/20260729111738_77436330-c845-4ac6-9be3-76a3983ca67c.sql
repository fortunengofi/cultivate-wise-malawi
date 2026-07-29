
-- 1) Restrict profiles SELECT policy
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON public.profiles;

CREATE POLICY "Users view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users view profiles of conversation partners"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE (c.buyer_id = auth.uid() AND c.seller_id = profiles.user_id)
       OR (c.seller_id = auth.uid() AND c.buyer_id = profiles.user_id)
  )
);

CREATE POLICY "Users view profiles of marketplace sellers"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.user_id = profiles.user_id
  )
);

-- 2) Lock down SECURITY DEFINER trigger functions so signed-in users cannot call them directly.
-- They still run from trigger context (owned by postgres) without needing EXECUTE on the invoking role.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.bump_conversation() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
