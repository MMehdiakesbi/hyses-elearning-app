// =====================================================================
//  Soumission de l'examen final et du test de positionnement.
//  SERVEUR UNIQUEMENT. Le serveur est la seule autorite sur le score,
//  la reussite, le compteur de tentatives et les dates : du corps de la
//  requete, seules les reponses cochees (`answers`) sont lues.
//  Chaque fonction renvoie { status, body } (independant de Next.js,
//  donc testable avec un `repo` factice).
// =====================================================================

import 'server-only';
import { MODULES } from '../data/modules';
import { EXAM_MAX_ATTEMPTS } from '../data/quiz';
import { parseAnswers, gradeAnswers, isPass, correctionForReview } from './grading';

const resultOf = (pg) => ({
  score: pg.final_score,
  passed: Boolean(pg.passed),
  attempts: pg.final_attempts || 0,
  finishedAt: pg.finished_at,
});

// La trace ne doit pas bloquer la correction (ex. table exam_attempts pas
// encore creee) : l'echec est journalise sans le contenu des reponses.
async function logAttemptSafely(repo, row) {
  try {
    await repo.logAttempt(row);
  } catch (e) {
    console.error('[exam_attempts] trace non enregistree :', e?.code || e?.message || e);
  }
}

export async function submitFinalExam({ userId, body, repo, now = new Date() }) {
  const parsed = parseAnswers(body?.answers);
  if (!parsed.ok) return { status: 400, body: { error: parsed.error } };

  const pg = await repo.getProgress(userId);
  if (!pg) return { status: 404, body: { error: 'progression_introuvable' } };
  if (pg.passed) return { status: 409, body: { error: 'examen_deja_reussi', result: resultOf(pg) } };
  const attempts = pg.final_attempts || 0;
  if (attempts >= EXAM_MAX_ATTEMPTS) {
    return { status: 403, body: { error: 'tentatives_epuisees', result: resultOf(pg) } };
  }
  const done = new Set(pg.modules_done || []);
  if (!MODULES.every((_, i) => done.has(i))) {
    return { status: 403, body: { error: 'modules_incomplets' } };
  }

  const score = gradeAnswers(parsed.answers);
  const passed = isPass(score);
  const attempt = attempts + 1;
  const at = now.toISOString();
  const written = await repo.recordFinalAttempt(userId, attempts, {
    final_score: score,
    final_done: true,
    passed,
    final_attempts: attempt,
    finished_at: at,
    updated_at: at,
  });
  if (!written) return { status: 409, body: { error: 'tentative_concurrente' } };

  await logAttemptSafely(repo, {
    user_id: userId,
    kind: 'final',
    attempt_no: attempt,
    answers: parsed.answers,
    score,
    passed,
    created_at: at,
  });

  // Ce dont l'ecran de score et le mode correction ont besoin, rien de plus.
  return {
    status: 200,
    body: { score, passed, attempts: attempt, finishedAt: at, correction: correctionForReview() },
  };
}

export async function submitPositioning({ userId, body, repo, now = new Date() }) {
  const parsed = parseAnswers(body?.answers);
  if (!parsed.ok) return { status: 400, body: { error: parsed.error } };

  const pg = await repo.getProgress(userId);
  if (!pg) return { status: 404, body: { error: 'progression_introuvable' } };
  if (pg.positioning_done) {
    return { status: 409, body: { error: 'positionnement_deja_fait', score: pg.positioning_score } };
  }

  const score = gradeAnswers(parsed.answers);
  const at = now.toISOString();
  const written = await repo.recordPositioning(userId, {
    positioning_score: score,
    positioning_done: true,
    updated_at: at,
  });
  if (!written) {
    const fresh = await repo.getProgress(userId);
    return { status: 409, body: { error: 'positionnement_deja_fait', score: fresh?.positioning_score ?? null } };
  }

  await logAttemptSafely(repo, {
    user_id: userId,
    kind: 'positioning',
    attempt_no: 1,
    answers: parsed.answers,
    score,
    passed: null,
    created_at: at,
  });

  return { status: 200, body: { score } };
}
