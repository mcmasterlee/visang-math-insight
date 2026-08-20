create table if not exists public.book_snapshots (
  key text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.book_snapshots enable row level security;
revoke all on table public.book_snapshots from anon, authenticated;
grant all on table public.book_snapshots to service_role;
