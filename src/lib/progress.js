// =====================================================================
//  Helpers de persistance (cote navigateur).
//  Toutes les fonctions prennent un client Supabase deja cree.
//  Le RLS garantit qu'un stagiaire ne touche que sa propre ligne.
// =====================================================================

/** Met a jour la ligne progress du stagiaire. */
export async function saveProgress(supabase, userId, patch) {
  const { error } = await supabase
    .from('progress')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (error) console.error('[saveProgress]', error.message);
  return !error;
}

/** Met a jour le profil (identite) du stagiaire. */
export async function saveProfile(supabase, userId, patch) {
  const { error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId);
  if (error) console.error('[saveProfile]', error.message);
  return !error;
}

/**
 * Ajoute un index de module a modules_done sans doublon.
 * (Lecture-modification-ecriture ; suffisant pour un usage mono-onglet.)
 */
export async function markModuleDone(supabase, userId, currentDone, moduleIndex) {
  const set = new Set(currentDone || []);
  set.add(moduleIndex);
  const next = [...set].sort((a, b) => a - b);
  const ok = await saveProgress(supabase, userId, { modules_done: next });
  return ok ? next : currentDone;
}
