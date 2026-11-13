// =====================================================================
//  Logique d'affichage du QCM : melange, construction d'ordre.
//  Fonctions pures. La NOTATION se fait cote serveur uniquement
//  (src/lib/server/grading.js) : la cle n'est pas envoyee au navigateur.
//
//  Format des reponses (`answers`) : objet { [indexQuestion]: number[] }
//  ou number[] contient les indices d'options choisies.
// =====================================================================

import { QUIZ, TOTAL_QUESTIONS } from './data/quiz';

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

/** Index de la premiere question sans reponse, ou -1 si tout est repondu. */
export function firstUnanswered(order, answers) {
  for (let pos = 0; pos < order.length; pos++) {
    const qi = order[pos].qi;
    if (!answers[qi] || answers[qi].length === 0) return pos;
  }
  return -1;
}

/** Pourcentage arrondi. */
export function toPercent(score) {
  return Math.round((score / TOTAL_QUESTIONS) * 100);
}
