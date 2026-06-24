// =====================================================================
//  Banque de questions — QCM Habilitation electrique B0 H0V
//
//  Source : QUIZ_B0H0V_HYSES.pdf (13 questions).
//  Champ `c` = indices (base 0) des bonnes reponses (corrige verifie
//  case par case sur le PDF source). Q5, Q6, Q11 = choix multiples.
//
//  Le MEME QCM sert :
//   - au test de positionnement (ordre d'origine, non melange)
//   - au quiz final (ordre des questions ET des reponses melange)
// =====================================================================

export const TOTAL_QUESTIONS = 13;

// Seuil de reussite : >= 90 % sur 13 questions => 12/13 (92,3 %).
// 11/13 = 84,6 % (insuffisant). A reconfirmer avec le PDG.
export const PASS_THRESHOLD = 12;

export const QUIZ = [
  {
    q: "Le volt est l'unite de :",
    o: ['La tension', 'La resistance', 'Le Ohm', 'La puissance'],
    c: [0],
  },
  {
    q: 'Que represente le symbole \u03A9 ?',
    o: ['La tension', 'La resistance', "L'intensite", 'La puissance'],
    c: [1],
  },
  {
    q: 'Peut-il y avoir choc electrique sans contact ?',
    o: [
      'Oui mais a une distance suffisante',
      'Non, je peux subir un risque electromagnetique',
      'Peut-etre selon les conditions climatiques',
      'Je ne sais pas',
    ],
    c: [0],
  },
  {
    q: 'Pour la protection des personnes, la sensibilite du relais differentiel doit etre de :',
    o: ['30 mA', '300 mA', '500 mA', "Il n'y a pas d'amperage minimum"],
    c: [0],
  },
  {
    q: 'Que faites-vous face a un electrise dans un poste transformateur ?',
    o: [
      'Je le degage',
      "J'appelle les secours",
      'Je mets ou je fais mettre le circuit hors tension',
      'Je quitte rapidement les lieux',
    ],
    c: [0, 1, 2],
  },
  {
    q: 'En haute tension, qui peut entrer dans la zone 2 (voisinage renforce) ?',
    o: ['H0', 'B0', 'H0V', 'H1V'],
    c: [2, 3],
  },
  {
    q: "L'executant non electricien peut-il executer une tache d'ordre electrique ?",
    o: [
      "Oui mais avec l'aide d'un electricien habilite B1",
      "Non, sauf remplacement d'ampoule sous conditions",
      'Non, dans aucune circonstance',
      "Oui en cas d'extreme urgence",
    ],
    c: [1],
  },
  {
    q: 'Un non-electricien habilite a travailler en basse tension au voisinage a pour indice :',
    o: ['B0V', 'B2V', 'H1', 'H1B2V'],
    c: [0],
  },
  {
    q: 'Un ouvrier non habilite travaille dans une zone a risque, doit-il etre surveille ?',
    o: [
      'Oui sous conditions particulieres',
      'Non en aucun cas',
      "Cela depend de l'environnement",
      'Oui dans tous les cas',
    ],
    c: [3],
  },
  {
    q: "Qui delivre le titre d'habilitation electrique ?",
    o: [
      "Le charge d'exploitation electrique",
      'Le charge de travaux',
      "L'employeur ou chef d'etablissement avec delegation",
      'Le formateur',
    ],
    c: [2],
  },
  {
    q: 'En BT, qui peut entrer dans la zone de voisinage simple ?',
    o: ['B1V', 'B2', 'Seul et non habilite', 'B0V'],
    c: [0, 3],
  },
  {
    q: 'Pour une canalisation aerienne HT a conducteur nu, la DLI est de :',
    o: ['3 m', '5 m', '7 m', '50 m'],
    c: [3],
  },
  {
    q: "Quelle est la Distance Minimale d'Approche (DMA) pour une piece nue sous tension BT ?",
    o: ['0,10 m', '0,30 m', '2 m', '5 m'],
    c: [1],
  },
];
