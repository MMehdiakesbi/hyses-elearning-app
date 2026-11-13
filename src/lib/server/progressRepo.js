// =====================================================================
//  Acces aux donnees de progression avec le client SERVICE ROLE.
//  SERVEUR UNIQUEMENT. Les ecritures sensibles sont conditionnelles
//  (« compare-and-set ») : elles n'aboutissent que si la ligne n'a pas
//  change depuis la lecture, ce qui empeche deux envois simultanes de
//  compter une tentative en trop ou d'envoyer deux emails.
// =====================================================================

import 'server-only';

const PROGRESS_COLUMNS =
  'user_id, modules_done, positioning_done, positioning_score, final_score, final_done, passed, final_attempts, finished_at, attestation_emitted_at';

export function createProgressRepo(admin) {
  return {
    async getProgress(userId) {
      const { data, error } = await admin
        .from('progress')
        .select(PROGRESS_COLUMNS)
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },

    async getProfile(userId) {
      const { data, error } = await admin
        .from('profiles')
        .select('prenom, nom, fonction, entreprise')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },

    /** Ecrit le resultat d'une tentative si le compteur vaut toujours `expectedAttempts`. */
    async recordFinalAttempt(userId, expectedAttempts, patch) {
      const { data, error } = await admin
        .from('progress')
        .update(patch)
        .eq('user_id', userId)
        .eq('final_attempts', expectedAttempts)
        .eq('passed', false)
        .select('user_id');
      if (error) throw error;
      return data.length === 1;
    },

    /** Ecrit le score de positionnement s'il n'a pas deja ete enregistre. */
    async recordPositioning(userId, patch) {
      const { data, error } = await admin
        .from('progress')
        .update(patch)
        .eq('user_id', userId)
        .eq('positioning_done', false)
        .select('user_id');
      if (error) throw error;
      return data.length === 1;
    },

    /** Trace de chaque tentative (table reservee au service role). */
    async logAttempt(row) {
      const { error } = await admin.from('exam_attempts').insert(row);
      if (error) throw error;
    },

    /** Pose attestation_emitted_at s'il est vide. true = cet appel l'a pose. */
    async claimEmission(userId, at) {
      const { data, error } = await admin
        .from('progress')
        .update({ attestation_emitted_at: at })
        .eq('user_id', userId)
        .is('attestation_emitted_at', null)
        .select('user_id');
      if (error) throw error;
      return data.length === 1;
    },

    /** Annule une emission posee par claimEmission (envoi echoue). */
    async releaseEmission(userId, at) {
      const { error } = await admin
        .from('progress')
        .update({ attestation_emitted_at: null })
        .eq('user_id', userId)
        .eq('attestation_emitted_at', at);
      if (error) throw error;
    },
  };
}
