-- =====================================================================
-- Derrière l'Abbaye — table des demandes de réservation.
-- À appliquer sur le projet Supabase une fois créé (CLI ou MCP apply_migration).
-- =====================================================================

create table if not exists public.reservations (
  id          uuid primary key default gen_random_uuid(),
  reference   text unique not null,
  date        date not null,
  heure       text not null,
  couverts    int  not null check (couverts between 1 and 20),
  nom         text not null,
  telephone   text,
  email       text,
  message     text,
  statut      text not null default 'en_attente',
  created_at  timestamptz not null default now()
);

-- RLS : le site public (rôle anon) ne peut QUE créer une demande.
-- La lecture / modification reste réservée au service role (admin).
alter table public.reservations enable row level security;

create policy "anon peut créer une demande"
  on public.reservations
  for insert
  to anon
  with check (true);

-- Aucune policy select/update/delete pour anon : non lisible côté public.
