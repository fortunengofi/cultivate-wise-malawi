
-- ROLES ENUM + TABLE
create type public.app_role as enum ('admin', 'farmer', 'buyer');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null default 'farmer',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users view own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);
create policy "Admins manage roles" on public.user_roles
  for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- PROFILES
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  location text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles viewable by authenticated" on public.profiles
  for select to authenticated using (true);
create policy "Users insert own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = user_id);
create policy "Users delete own profile" on public.profiles
  for delete to authenticated using (auth.uid() = user_id);

-- TIMESTAMP TRIGGER FN
create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

-- AUTO-CREATE PROFILE + DEFAULT ROLE ON SIGNUP
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  insert into public.user_roles (user_id, role) values (new.id, 'farmer');
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- FARM RECORDS
create table public.farm_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income','expense')),
  category text not null,
  description text not null,
  amount numeric not null check (amount >= 0),
  date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.farm_records enable row level security;
create policy "Users view own records" on public.farm_records for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own records" on public.farm_records for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own records" on public.farm_records for update to authenticated using (auth.uid() = user_id);
create policy "Users delete own records" on public.farm_records for delete to authenticated using (auth.uid() = user_id);
create index idx_farm_records_user on public.farm_records(user_id, date desc);

-- LISTINGS
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product text not null,
  category text not null,
  quantity text not null,
  price text not null,
  location text not null,
  description text,
  image_url text,
  emoji text default '🌾',
  status text not null default 'active' check (status in ('active','sold','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.listings enable row level security;
create policy "Listings viewable by authenticated" on public.listings for select to authenticated using (true);
create policy "Users insert own listings" on public.listings for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own listings" on public.listings for update to authenticated using (auth.uid() = user_id);
create policy "Users delete own listings" on public.listings for delete to authenticated using (auth.uid() = user_id);
create trigger update_listings_updated_at before update on public.listings
  for each row execute function public.update_updated_at_column();
create index idx_listings_status on public.listings(status, created_at desc);

-- CONVERSATIONS
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id)
);

alter table public.conversations enable row level security;
create policy "Participants view conversations" on public.conversations
  for select to authenticated using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "Buyers create conversations" on public.conversations
  for insert to authenticated with check (auth.uid() = buyer_id);
create policy "Participants update conversations" on public.conversations
  for update to authenticated using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- MESSAGES
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (length(content) between 1 and 2000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Participants view messages" on public.messages
  for select to authenticated using (
    exists (select 1 from public.conversations c
      where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid()))
  );
create policy "Participants send messages" on public.messages
  for insert to authenticated with check (
    auth.uid() = sender_id and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );
create index idx_messages_conv on public.messages(conversation_id, created_at);

-- Bump conversation last_message_at on new message
create or replace function public.bump_conversation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.conversations set last_message_at = now() where id = new.conversation_id;
  return new;
end; $$;
create trigger trg_bump_conversation after insert on public.messages
  for each row execute function public.bump_conversation();

-- MARKET PRICES (public reference data)
create table public.market_prices (
  id uuid primary key default gen_random_uuid(),
  product text not null,
  unit text not null default 'kg',
  min_price numeric not null,
  max_price numeric not null,
  market text not null,
  updated_at timestamptz not null default now()
);

alter table public.market_prices enable row level security;
create policy "Market prices readable" on public.market_prices for select to authenticated using (true);
create policy "Admins manage prices" on public.market_prices for all to authenticated using (public.has_role(auth.uid(),'admin'));

insert into public.market_prices (product, unit, min_price, max_price, market) values
  ('Maize','kg',220,300,'Lilongwe'),
  ('Groundnuts','kg',1400,1700,'Mzuzu'),
  ('Soya Beans','kg',900,1200,'Lilongwe'),
  ('Rice','kg',1100,1400,'Salima'),
  ('Tomatoes','crate',7000,9500,'Blantyre'),
  ('Sweet Potatoes','kg',350,500,'Zomba'),
  ('Beans','kg',1800,2200,'Mangochi'),
  ('Cassava','kg',300,450,'Nkhotakota');

-- REALTIME for messages + conversations
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
alter table public.messages replica identity full;
alter table public.conversations replica identity full;
