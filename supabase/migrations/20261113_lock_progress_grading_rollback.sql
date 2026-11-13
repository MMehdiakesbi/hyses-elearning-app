-- =====================================================================
--  RETOUR ARRIERE de 20261113_lock_progress_grading.sql
--  Remet les privileges par defaut de Supabase sur public.progress et la
--  policy d'insertion d'origine (supabase/schema.sql).
--
--  ATTENTION : apres ce retour arriere, un stagiaire connecte peut de
--  nouveau ecrire final_score / passed lui-meme. A n'utiliser que pour
--  revenir a l'ancien code (deploiement precedent sur Vercel).
--
--  La table exam_attempts est CONSERVEE (trace des tentatives). Pour la
--  supprimer, decommenter la derniere instruction en connaissance de cause.
-- =====================================================================

begin;

grant all on table public.progress to anon, authenticated;

drop policy if exists "progress_insert_own" on public.progress;
create policy "progress_insert_own"
  on public.progress for insert
  with check (auth.uid() = user_id);

-- Policies select/update d'origine (sans restriction de role).
drop policy if exists "progress_select_own" on public.progress;
create policy "progress_select_own"
  on public.progress for select
  using (auth.uid() = user_id);

drop policy if exists "progress_update_own" on public.progress;
create policy "progress_update_own"
  on public.progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- drop table if exists public.exam_attempts;

commit;
