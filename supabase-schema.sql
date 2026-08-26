create type public.presence_status as enum (
  'present',
  'wfh',
  'meeting',
  'away',
  'leave'
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  department text not null,
  avatar_url text,
  status public.presence_status not null default 'present',
  status_note text,
  updated_at timestamptz not null default now()
);

create or replace function public.set_team_members_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger team_members_updated_at
before update on public.team_members
for each row execute function public.set_team_members_updated_at();

alter table public.team_members enable row level security;

-- ponytail: open policies make local integration testing easy; replace with auth policies before production.
create policy "Public read team members"
on public.team_members for select
using (true);

create policy "Public insert team members"
on public.team_members for insert
with check (true);

create policy "Public update team members"
on public.team_members for update
using (true)
with check (true);

create policy "Public delete team members"
on public.team_members for delete
using (true);

alter publication supabase_realtime add table public.team_members;

-- App settings table for PIN and general config
create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value)
values ('admin_pin', '1234')
on conflict (key) do nothing;

alter table public.app_settings enable row level security;

create policy "Public read app settings"
on public.app_settings for select
using (true);

create policy "Public insert app settings"
on public.app_settings for insert
with check (true);

create policy "Public update app settings"
on public.app_settings for update
using (true)
with check (true);
