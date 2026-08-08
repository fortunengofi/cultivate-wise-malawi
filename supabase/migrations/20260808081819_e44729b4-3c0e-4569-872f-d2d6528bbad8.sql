create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  insert into public.profiles (user_id, display_name, phone)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'display_name', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      new.phone,
      'Farmer'
    ),
    new.phone
  );
  insert into public.user_roles (user_id, role) values (new.id, 'farmer');
  return new;
end; $function$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;