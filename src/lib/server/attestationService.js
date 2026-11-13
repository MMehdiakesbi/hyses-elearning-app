// =====================================================================
//  Emission de l'attestation (telechargement + email). SERVEUR UNIQUEMENT.
//  Le document est construit a partir de la base (profiles + progress),
//  uniquement si `passed` est vrai. Rien n'est lu dans la requete.
// =====================================================================

import 'server-only';
import { buildAttestationDocx, attestationDocxFilename } from './attestationDocx';

async function loadLearner(userId, repo) {
  const pg = await repo.getProgress(userId);
  if (!pg || pg.passed !== true) return null;
  const pr = (await repo.getProfile(userId)) || {};
  return {
    progress: pg,
    learner: {
      prenom: pr.prenom,
      nom: pr.nom,
      fonction: pr.fonction,
      entreprise: pr.entreprise,
      score: pg.final_score,
      date: pg.finished_at,
    },
  };
}

const FORBIDDEN = { status: 403, body: { error: 'attestation_non_disponible' } };

/** Telechargement : renvoie le fichier et pose la date d'emission si absente. */
export async function downloadAttestation({ userId, repo, now = new Date() }) {
  const data = await loadLearner(userId, repo);
  if (!data) return FORBIDDEN;
  const file = await buildAttestationDocx(data.learner);
  const at = now.toISOString();
  const claimed = await repo.claimEmission(userId, at);
  return {
    status: 200,
    file,
    filename: attestationDocxFilename(data.learner),
    emittedAt: claimed ? at : data.progress.attestation_emitted_at,
  };
}

/**
 * Email : envoie l'attestation a l'adresse du compte (jamais une adresse
 * fournie par le client). Un seul envoi par compte : la date d'emission est
 * posee AVANT l'envoi (compare-and-set) et retiree si l'envoi echoue.
 * `mailer` = null si l'email n'est pas configure.
 */
export async function emailAttestation({ userId, email, repo, mailer, now = new Date() }) {
  const data = await loadLearner(userId, repo);
  if (!data) return FORBIDDEN;
  if (!mailer) return { status: 200, body: { ok: false, skipped: true, reason: 'email_non_configure' } };

  const at = now.toISOString();
  if (!(await repo.claimEmission(userId, at))) {
    return { status: 200, body: { ok: false, skipped: true, reason: 'deja_emise' } };
  }
  try {
    const file = await buildAttestationDocx(data.learner);
    await mailer({
      to: email,
      prenom: data.learner.prenom,
      score: data.learner.score,
      filename: attestationDocxFilename(data.learner),
      content: file.toString('base64'),
    });
  } catch (e) {
    console.error('[attestation email]', e?.message || e);
    await repo.releaseEmission(userId, at);
    return { status: 502, body: { error: 'echec_envoi' } };
  }
  return { status: 200, body: { ok: true, emittedAt: at } };
}
