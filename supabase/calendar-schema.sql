create table public.immobrain_calendar_state (
 user_id uuid primary key references auth.users(id) on delete cascade,
 events jsonb not null default '[]'::jsonb check (jsonb_typeof(events) = 'array' and jsonb_array_length(events) <= 5000),
 revision bigint not null default 1,
 updated_at timestamptz not null default now()
);
alter table public.immobrain_calendar_state enable row level security;
revoke all on public.immobrain_calendar_state from anon, authenticated;
grant select, insert, update, delete on public.immobrain_calendar_state to authenticated;
create policy calendar_owner_select on public.immobrain_calendar_state for select to authenticated using ((select auth.uid()) = user_id);
create policy calendar_owner_insert on public.immobrain_calendar_state for insert to authenticated with check ((select auth.uid()) = user_id);
create policy calendar_owner_update on public.immobrain_calendar_state for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy calendar_owner_delete on public.immobrain_calendar_state for delete to authenticated using ((select auth.uid()) = user_id);
create table public.immobrain_calendar_subscriptions (
 user_id uuid primary key references auth.users(id) on delete cascade,
 token_hash text unique not null check (token_hash ~ '^[0-9a-f]{64}$'),
 created_at timestamptz not null default now()
);
alter table public.immobrain_calendar_subscriptions enable row level security;
revoke all on public.immobrain_calendar_subscriptions from anon, authenticated;
grant all on public.immobrain_calendar_state, public.immobrain_calendar_subscriptions to service_role;
create policy calendar_tokens_backend_only on public.immobrain_calendar_subscriptions for all to anon, authenticated using (false) with check (false);
