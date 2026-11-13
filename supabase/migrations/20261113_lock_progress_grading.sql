-- =====================================================================
--  20261113_lock_progress_grading.sql
--  Verrouillage des resultats d'examen : seul le serveur (service role)
--  ecrit les scores, la reussite, les tentatives et les dates d'emission.
--
--  A EXECUTER dans Supabase > SQL Editor, APRES le deploiement du code qui
--  passe par /api/exam/submit, /api/positioning/submit et /api/attestation
--  (sinon l'ancien code navigateur, qui ecrit final_score, echouerait).
--  Idempotent : peut etre rejoue. Retour arriere :
--  20261113_lock_progress_grading_rollback.sql
--
--  -------------------------------------------------------------------
--  DIAGNOSTIC A LANCER AVANT (lecture seule, copier/coller une par une)
--  -------------------------------------------------------------------
--  -- 1. Policies RLS actuelles sur progress
--  select policyname, cmd, roles, qual, with_check
--    from pg_policies where schemaname = 'public' and tablename = 'progress';
--
--  -- 2. Privileges de table (attendu avant : anon/authenticated ont tout)
--  select grantee, privilege_type
--    from information_schema.role_table_grants
--   where table_schema = 'public' and table_name = 'progress'
--     and grantee in ('anon', 'authenticated') order by grantee, privilege_type;
--
--  -- 3. Privileges par colonne
--  select grantee, column_name, privilege_type
--    from information_schema.column_privileges
--   where table_schema = 'public' and table_name = 'progress'
--     and grantee in ('anon', 'authenticated') order by grantee, column_name;
--
--  -- 4. RLS bien active
--  select relname, relrowsecurity from pg_class
--   where relname in ('progress', 'profiles') and relnamespace = 'public'::regnamespace;
--
--  -- 5. Comptes deja marques « reussi » AVANT le verrouillage : leur
--  --    resultat a ete ecrit par le navigateur et ne peut pas etre prouve.
--  select p.user_id, pr.prenom, pr.nom, pr.entreprise, p.final_score,
--         p.final_attempts, p.finished_at, p.attestation_emitted_at
--    from public.progress p join public.profiles pr on pr.id = p.user_id
--   where p.passed = true or p.final_done = true order by p.finished_at;
--
--  -------------------------------------------------------------------
--  CONTROLE A LANCER APRES
--  -------------------------------------------------------------------
--  -- a. Relancer les requetes 1 a 3. Attendu :
--  --    authenticated : SELECT sur la table ; UPDATE uniquement sur
--  --    modules_done, time_spent_seconds, updated_at ; rien d'autre.
--  --    anon : aucun privilege. Policies : progress_select_own et
--  --    progress_update_own seulement (plus de progress_insert_own).
--
--  -- b. exam_attempts : RLS active, aucun privilege anon/authenticated
--  select relrowsecurity from pg_class where oid = 'public.exam_attempts'::regclass;
--  select grantee, privilege_type from information_schema.role_table_grants
--   where table_schema = 'public' and table_name = 'exam_attempts'
--     and grantee in ('anon', 'authenticated');          -- attendu : 0 ligne
--
--  -- c. Essai reel avec les droits d'un stagiaire, SANS rien modifier
--  --    (transaction annulee). Remplacer <UUID> par l'id du compte de test.
--  begin;
--    set local role authenticated;
--    set local request.jwt.claims = '{"sub":"<UUID>","role":"authenticated"}';
--    update public.progress set modules_done = modules_done where user_id = '<UUID>';
--    -- attendu : UPDATE 1
--    update public.progress set passed = true where user_id = '<UUID>';
--    -- attendu : ERROR permission denied for table progress
--  rollback;
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1) progress : plus aucune ecriture navigateur sur les resultats.
--    REVOKE ALL (et pas seulement INSERT/UPDATE/DELETE) : retire aussi
--    TRUNCATE, REFERENCES et TRIGGER, accordes par defaut par Supabase.
--    Un REVOKE par colonne serait sans effet tant que le role garde
--    UPDATE sur toute la table : on retire tout, puis on rend le minimum.
-- ---------------------------------------------------------------------
revoke all on table public.progress from anon, authenticated;

-- Lecture de sa propre ligne (filtree par la policy progress_select_own).
grant select on table public.progress to authenticated;

-- Seules colonnes encore ecrites par le navigateur (src/lib/progress.js) :
-- avancement des modules et temps passe. Aucune colonne de resultat.
grant update (modules_done, time_spent_seconds, updated_at)
  on table public.progress to authenticated;

-- La ligne progress est creee par le trigger handle_new_user (security
-- definer, valeurs par defaut sures) : le navigateur ne cree ni ne
-- supprime sa ligne.
drop policy if exists "progress_insert_own" on public.progress;

alter table public.progress enable row level security;

drop policy if exists "progress_select_own" on public.progress;
create policy "progress_select_own"
  on public.progress for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "progress_update_own" on public.progress;
create policy "progress_update_own"
  on public.progress for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 2) exam_attempts : trace de chaque tentative (reponses envoyees, score
--    calcule par le serveur). Reservee au service role.
-- ---------------------------------------------------------------------
create table if not exists public.exam_attempts (
  id          bigint generated always as identity primary key,
  user_id     uuid        not null references auth.users (id) on delete cascade,
  kind        text        not null check (kind in ('final', 'positioning')),
  attempt_no  int         not null check (attempt_no >= 1),
  answers     jsonb       not null,
  score       int         not null check (score between 0 and 13),
  passed      boolean,
  created_at  timestamptz not null default now(),
  unique (user_id, kind, attempt_no)
);

comment on table public.exam_attempts is
  'Trace des tentatives (examen final, positionnement) ecrite par le serveur uniquement';

alter table public.exam_attempts enable row level security;
-- Aucune policy : anon/authenticated ne voient rien. Les privileges par
-- defaut de Supabase sur les nouvelles tables sont retires explicitement.
revoke all on table public.exam_attempts from anon, authenticated;

commit;
