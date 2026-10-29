create table public.immobrain_google_connections (
user_id uuid primary key references auth.users(id) on delete cascade,
refresh_cipher text not null, calendar_id text, mappings jsonb not null default '{}',
lease_until timestamptz not null default '1970-01-01', last_synced timestamptz, last_error text);
alter table public.immobrain_google_connections enable row level security;
revoke all on public.immobrain_google_connections from anon, authenticated;
grant all on public.immobrain_google_connections to service_role;
create table public.immobrain_google_oauth (
state_hash text primary key,user_id uuid not null references auth.users(id) on delete cascade,
verifier text not null,expires_at timestamptz not null);
alter table public.immobrain_google_oauth enable row level security;
revoke all on public.immobrain_google_oauth from anon, authenticated;
grant all on public.immobrain_google_oauth to service_role;

-- Datenschutzfunktionen: vorhandene Verbindungen behalten alle Termine, bis eine Frist gewählt wird.
alter table public.immobrain_google_connections
 add column retention_days integer not null default 0 check (retention_days in (0,30,90,365)),
 add column paused boolean not null default false;
