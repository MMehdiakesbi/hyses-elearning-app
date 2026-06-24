-- =====================================================================
--  HYSES e-learning — Schema Supabase (Postgres)
--  Formation Habilitation electrique B0 H0V (NF C 18-510)
--
--  A executer dans : Supabase Dashboard > SQL Editor > New query > Run
--  Idempotent : peut etre rejoue sans casser l'existant.
-- =====================================================================

-- ------------------------------------------------------------------
-- 1) TABLE profiles  (identite du stagiaire, 1 ligne par compte)
-- ------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  prenom      text,
  nom         text,
  fonction    text,
  entreprise  text,
  created_at  timestamptz not null default now()
);

comment on table public.profiles is 'Identite du stagiaire, liee 1:1 a auth.users';

-- ------------------------------------------------------------------
-- 2) TABLE progress  (parcours + resultats, 1 ligne par compte)
--    Couvre toutes les donnees a stocker du cahier des charges :
--    nom/prenom + entreprise (table profiles), date debut/fin,
--    temps passe, score positionnement, score quiz final,
--    date d'emission de l'attestation.
-- ------------------------------------------------------------------
create table if not exists public.progress (
  user_id                uuid primary key references auth.users (id) on delete cascade,
  formation_code         text        not null default 'B0H0V',

  -- modules consultes : tableau des index de modules valides (0..8)
  modules_done           int[]       not null default '{}',

  -- test de positionnement (entree)
  positioning_score      int,
  positioning_done       boolean     not null default false,

  -- quiz final (sortie)
  final_score            int,
  final_done             boolean     not null default false,
  passed                 boolean     not null default false,
  final_attempts         int         not null default 0,         -- nombre de tentatives au quiz final

  -- temps & dates
  started_at             timestamptz not null default now(),   -- date debut
  finished_at            timestamptz,                          -- date fin (quiz final passe)
  time_spent_seconds     int         not null default 0,       -- temps passe cumule
  attestation_emitted_at timestamptz,                          -- date d'emission attestation

  updated_at             timestamptz not null default now()
);

comment on table public.progress is 'Parcours et resultats du stagiaire (1:1 avec auth.users)';

-- ------------------------------------------------------------------
-- 3) PROVISIONNEMENT AUTOMATIQUE
--    A la creation d'un compte (auth.users), on cree automatiquement
--    sa ligne profiles + sa ligne progress.
--    Les champs identite sont lus depuis le user_metadata fourni
--    a la creation du compte (voir scripts/create-user.mjs).
-- ------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, prenom, nom, fonction, entreprise)
  values (
    new.id,
    new.raw_user_meta_data ->> 'prenom',
    new.raw_user_meta_data ->> 'nom',
    new.raw_user_meta_data ->> 'fonction',
    new.raw_user_meta_data ->> 'entreprise'
  )
  on conflict (id) do nothing;

  insert into public.progress (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------
-- 4) ROW LEVEL SECURITY
--    Chaque stagiaire ne voit et ne modifie QUE sa propre ligne.
--    (Le service_role utilise par le backend ignore le RLS.)
-- ------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.progress enable row level security;

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- progress
drop policy if exists "progress_select_own" on public.progress;
create policy "progress_select_own"
  on public.progress for select
  using (auth.uid() = user_id);

drop policy if exists "progress_update_own" on public.progress;
create policy "progress_update_own"
  on public.progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "progress_insert_own" on public.progress;
create policy "progress_insert_own"
  on public.progress for insert
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------------
-- 5) (Optionnel) Vue admin : suivi global des stagiaires.
--    Accessible uniquement via service_role (backend / SQL editor).
-- ------------------------------------------------------------------
create or replace view public.v_suivi_stagiaires as
select
  pr.id,
  pr.prenom,
  pr.nom,
  pr.entreprise,
  pr.fonction,
  pg.started_at              as date_debut,
  pg.finished_at             as date_fin,
  pg.time_spent_seconds,
  pg.positioning_score       as score_positionnement,
  pg.final_score             as score_quiz_final,
  pg.passed                  as reussi,
  pg.attestation_emitted_at  as date_attestation
from public.profiles pr
join public.progress pg on pg.user_id = pr.id;
