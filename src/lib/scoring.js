// =====================================================================
//  Logique d'evaluation : melange, construction d'ordre, notation.
//  Fonctions pures (testables, reutilisables).
//
//  Format des reponses (`answers`) : objet { [indexQuestion]: number[] }
//  ou number[] contient les indices d'options choisies.
// =====================================================================

import { QUIZ, PASS_THRESHOLD, TOTAL_QUESTIONS } from './data/quiz';

/** Melange Fisher-Yates (copie, ne modifie pas l'original). */
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Construit l'ordre d'affichage du QCM.
 * @param {boolean} doShuffle - true pour le quiz final (melange Q + reponses).
 * @returns {Array<{qi:number, opts:number[]}>}
 *   qi   = index de la question dans QUIZ
 *   opts = ordre d'affichage des options (indices d'origine)
 */
export function buildOrder(doShuffle) {
  let questionOrder = QUIZ.map((_, i) => i);
  if (doShuffle) questionOrder = shuffle(questionOrder);

  return questionOrder.map((qi) => {
    let opts = QUIZ[qi].o.map((_, i) => i);
    if (doShuffle) opts = shuffle(opts);
    return { qi, opts };
  });
}

/** Compare deux listes d'indices sans tenir compte de l'ordre. */
function sameSet(a = [], b = []) {
  const sa = [...a].sort((x, y) => x - y).join(',');
  const sb = [...b].sort((x, y) => x - y).join(',');
  return sa === sb;
}

/** Une question est-elle correctement repondue ? */
export function isQuestionCorrect(qi, given) {
  return sameSet(given, QUIZ[qi].c);
}

/**
 * Calcule le score total (nombre de bonnes reponses).
 * @param {Object<number, number[]>} answers
 * @returns {number}
 */
export function gradeAnswers(answers) {
  let score = 0;
  QUIZ.forEach((_, qi) => {
    if (isQuestionCorrect(qi, answers[qi] || [])) score++;
  });
  return score;
}

/** Index de la premiere question sans reponse, ou -1 si tout est repondu. */
export function firstUnanswered(order, answers) {
  for (let pos = 0; pos < order.length; pos++) {
    const qi = order[pos].qi;
    if (!answers[qi] || answers[qi].length === 0) return pos;
  }
  return -1;
}

/** Reussite (>= seuil). */
export function isPass(score) {
  return score >= PASS_THRESHOLD;
}

/** Pourcentage arrondi. */
export function toPercent(score) {
  return Math.round((score / TOTAL_QUESTIONS) * 100);
}
