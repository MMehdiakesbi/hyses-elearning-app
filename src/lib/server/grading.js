// =====================================================================
//  Correction du QCM cote serveur (examen final + positionnement).
//  Fonctions pures, sans acces a la base. SERVEUR UNIQUEMENT.
//
//  Format des reponses recu du navigateur :
//    { "<indexQuestion>": [indexOption, ...], ... }
//  ou les indices sont ceux de QUIZ (src/lib/data/quiz.js), donc
//  independants de l'ordre melange affiche a l'ecran.
// =====================================================================

import 'server-only';
import { QUIZ, PASS_THRESHOLD } from '../data/quiz';
import { EXAM_KEY } from './examKey';

// Garde-fou : la cle et les questions publiques doivent rester alignees.
if (EXAM_KEY.length !== QUIZ.length) {
  throw new Error('EXAM_KEY et QUIZ n\'ont pas le meme nombre de questions');
}
QUIZ.forEach((q, i) => {
  const key = EXAM_KEY[i];
  if (!key.length || key.some((oi) => !Number.isInteger(oi) || oi < 0 || oi >= q.o.length)) {
    throw new Error(`EXAM_KEY[${i}] invalide`);
  }
  if (Boolean(q.multi) !== key.length > 1) {
    throw new Error(`QUIZ[${i}].multi ne correspond pas a EXAM_KEY[${i}]`);
  }
});

/**
 * Valide la forme des reponses. Exige une reponse pour chacune des
 * questions (comme le navigateur avant envoi), sans doublon ni indice
 * inconnu ; une seule option pour une question a reponse unique.
 * @returns {{ ok: true, answers: Object<number, number[]> } | { ok: false, error: string }}
 */
export function parseAnswers(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, error: 'reponses_invalides' };
  }
  const keys = Object.keys(raw);
  const isKnown = (k) => /^(0|[1-9]\d*)$/.test(k) && Number(k) < QUIZ.length;
  if (!keys.every(isKnown)) return { ok: false, error: 'question_inconnue' };
  if (keys.length !== QUIZ.length) return { ok: false, error: 'reponses_incompletes' };

  const answers = {};
  for (const k of keys) {
    const qi = Number(k);
    const v = raw[k];
    if (!Array.isArray(v) || v.length === 0) return { ok: false, error: 'reponses_incompletes' };
    if (v.some((oi) => !Number.isInteger(oi) || oi < 0 || oi >= QUIZ[qi].o.length)) {
      return { ok: false, error: 'option_inconnue' };
    }
    if (new Set(v).size !== v.length) return { ok: false, error: 'option_en_double' };
    if (!QUIZ[qi].multi && v.length !== 1) return { ok: false, error: 'reponse_unique_attendue' };
    answers[qi] = [...v].sort((a, b) => a - b);
  }
  return { ok: true, answers };
}

function sameSet(a, b) {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

/** Score = nombre de questions exactement correctes (reponses deja validees). */
export function gradeAnswers(answers) {
  return EXAM_KEY.reduce((n, key, qi) => n + (sameSet(answers[qi], key) ? 1 : 0), 0);
}

export function isPass(score) {
  return score >= PASS_THRESHOLD;
}

/**
 * Corrige attendu par le mode correction de l'ecran (comportement actuel :
 * toutes les bonnes reponses, apres chaque tentative de l'examen final).
 */
export function correctionForReview() {
  return Object.fromEntries(EXAM_KEY.map((key, qi) => [qi, [...key]]));
}
