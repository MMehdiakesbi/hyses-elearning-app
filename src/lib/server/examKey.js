// =====================================================================
//  CLE DE CORRECTION du QCM B0 H0V (examen final + test de positionnement).
//
//  SERVEUR UNIQUEMENT : la ligne `import 'server-only'` fait echouer le
//  build si un composant client importe ce fichier, meme indirectement.
//
//  EXAM_KEY[i] = indices (base 0) des bonnes reponses de QUIZ[i]
//  (src/lib/data/quiz.js). Corrige verifie case par case sur le PDF source
//  QUIZ_B0H0V_HYSES.pdf. Q5, Q6, Q11 = choix multiples.
// =====================================================================

import 'server-only';

export const EXAM_KEY = [
  [0], //  Q1  Le volt est l'unite de
  [1], //  Q2  Symbole Ω
  [0], //  Q3  Choc electrique sans contact
  [0], //  Q4  Sensibilite du differentiel
  [0, 1, 2], //  Q5  Electrise dans un poste transformateur
  [2, 3], //  Q6  Zone 2 HT
  [1], //  Q7  Tache d'ordre electrique
  [0], //  Q8  Indice BT au voisinage
  [3], //  Q9  Ouvrier non habilite surveille
  [2], // Q10  Qui delivre le titre
  [0, 3], // Q11  Zone de voisinage simple BT
  [3], // Q12  DLI canalisation HT
  [1], // Q13  DMA piece nue BT
];
