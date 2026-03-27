
-- Create enum types
create type public.app_role as enum ('admin', 'user');
create type public.tournament_status as enum ('pre-inscription', 'confirming', 'in-progress', 'finished');
create type public.registration_status as enum ('pending', 'confirmed', 'eliminated', 'reentry');

-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  email text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Anyone authenticated can view profiles" on public.profiles for select to authenticated using (true);
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Public can view profiles" on public.profiles for select using (true);

-- User roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'user',
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
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

create policy "Authenticated can view roles" on public.user_roles for select to authenticated using (true);
create policy "Admins can insert roles" on public.user_roles for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update roles" on public.user_roles for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete roles" on public.user_roles for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Tournaments table
create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date date not null,
  time time not null default '16:00',
  location text,
  buy_in numeric not null default 35,
  reentry_fee numeric not null default 25,
  initial_stack integer not null default 5000,
  reentry_stack integer not null default 3500,
  status tournament_status not null default 'pre-inscription',
  max_players integer not null default 18,
  total_players integer,
  prize_pool numeric,
  current_blind_index integer default 0,
  timer_running boolean default false,
  created_at timestamptz default now()
);

alter table public.tournaments enable row level security;
create policy "Tournaments publicly viewable" on public.tournaments for select using (true);
create policy "Admins can insert tournaments" on public.tournaments for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update tournaments" on public.tournaments for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete tournaments" on public.tournaments for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Tournament registrations table
create table public.tournament_registrations (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  status registration_status not null default 'pending',
  position integer,
  created_at timestamptz default now(),
  unique (tournament_id, user_id)
);

alter table public.tournament_registrations enable row level security;
create policy "Registrations publicly viewable" on public.tournament_registrations for select using (true);
create policy "Users can register themselves" on public.tournament_registrations for insert to authenticated with check (auth.uid() = user_id);
create policy "Admins can update registrations" on public.tournament_registrations for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete registrations" on public.tournament_registrations for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Function to create profile + role after signup (called from client)
create or replace function public.create_profile_for_user(
  _user_id uuid,
  _first_name text,
  _last_name text,
  _email text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, email)
  values (_user_id, _first_name, _last_name, _email)
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (_user_id, 'user')
  on conflict (user_id, role) do nothing;
end;
$$;
