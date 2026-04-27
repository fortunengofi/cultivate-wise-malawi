
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.bump_conversation() from public, anon, authenticated;
revoke execute on function public.update_updated_at_column() from public, anon, authenticated;
revoke execute on function public.has_role(uuid, app_role) from public, anon;
-- has_role stays callable by authenticated for use in RLS policies via security definer
grant execute on function public.has_role(uuid, app_role) to authenticated;
