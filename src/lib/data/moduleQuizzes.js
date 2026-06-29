// Mini-quiz de fin de module.
// Un tableau par module (index 0 = Module 1 ... index 8 = Module 9).
// Chaque question : { q: "énoncé", choices: [...], correct: indexDeLaBonneRéponse }
// (correct commence à 0 : 0 = 1re réponse, 1 = 2e, etc.)
// Pour modifier une question, change simplement le texte ou l'index "correct".

export const MODULE_QUIZZES = [
  // ---------- Module 1 · Présentation ----------
  [
    {
      q: 'Quel est un objectif de la formation ?',
      choices: ['Réparer les installations électriques', 'Analyser le risque et intégrer la prévention', 'Devenir électricien'],
      correct: 1,
    },
    {
      q: 'Quels éléments aggravent le risque ?',
      choices: ['Alcool, stupéfiants, certains médicaments', 'Le port des EPI', 'La signalisation de sécurité'],
      correct: 0,
    },
    {
      q: 'Qui pilote la démarche de prévention dans l’établissement ?',
      choices: ['L’exécutant', 'Le chef d’établissement', 'Le client'],
      correct: 1,
    },
    {
      q: 'L’habilitation concerne…',
      choices: ['Seulement les électriciens', 'Du donneur d’ordre à l’exécutant', 'Uniquement le chef d’établissement'],
      correct: 1,
    },
  ],

  // ---------- Module 2 · Risques électriques ----------
  [
    {
      q: 'Les accidents du travail d’origine électrique sont…',
      choices: ['Fréquents et bénins', 'Rares mais souvent graves voire mortels', 'Inexistants aujourd’hui'],
      correct: 1,
    },
    {
      q: 'Un contact indirect, c’est…',
      choices: ['Toucher directement un fil dénudé', 'Toucher une masse mise accidentellement sous tension par un défaut', 'Une simple coupure de courant'],
      correct: 1,
    },
    {
      q: 'Qui doit définir et mettre en œuvre les mesures de prévention ?',
      choices: ['L’employeur', 'Le stagiaire', 'Le fournisseur d’électricité'],
      correct: 0,
    },
    {
      q: 'Quel secteur est parmi les plus exposés au risque électrique ?',
      choices: ['La banque', 'Le BTP et la métallurgie', 'L’informatique de bureau'],
      correct: 1,
    },
  ],

  // ---------- Module 3 · Effets du courant ----------
  [
    {
      q: 'Sans tension (différence de potentiel)…',
      choices: ['Le courant est maximal', 'Il n’y a pas de courant', 'Le danger augmente'],
      correct: 1,
    },
    {
      q: 'La loi d’Ohm s’écrit…',
      choices: ['I = U / R', 'U = R + I', 'P = U × t'],
      correct: 0,
    },
    {
      q: 'La gravité d’un choc électrique dépend de…',
      choices: ['La couleur du câble', 'L’intensité, le temps de passage, le trajet et la physiologie', 'L’heure de la journée'],
      correct: 1,
    },
    {
      q: 'Face au courant, le corps humain se comporte comme…',
      choices: ['Un isolant parfait', 'Une résistance qui peut chauffer et brûler', 'Une pile électrique'],
      correct: 1,
    },
  ],

  // ---------- Module 4 · Habilitations ----------
  [
    {
      q: 'Qui délivre et signe le titre d’habilitation ?',
      choices: ['Le formateur', 'L’employeur', 'La DRIEETS'],
      correct: 1,
    },
    {
      q: 'À quelle fréquence minimale l’habilitation est-elle révisée ?',
      choices: ['Tous les 5 ans', 'Au moins une fois par an', 'Jamais'],
      correct: 1,
    },
    {
      q: 'Un titulaire B0 / H0 / H0V réalise…',
      choices: ['Des opérations d’ordre NON électrique', 'Des réparations électriques', 'La consignation des ouvrages'],
      correct: 0,
    },
    {
      q: 'L’exécutant non électricien peut-il changer une prise ou un disjoncteur ?',
      choices: ['Oui, sans restriction', 'Non, jamais (tâche d’ordre électrique)', 'Seulement le matin'],
      correct: 1,
    },
  ],

  // ---------- Module 5 · Moyens de prévention ----------
  [
    {
      q: 'L’objectif premier de la prévention est…',
      choices: ['De limiter les dégâts après coup', 'D’éviter le risque à la source', 'D’assurer les biens'],
      correct: 1,
    },
    {
      q: 'Une instruction de sécurité peut être…',
      choices: ['Orale ou écrite, établie par l’employeur', 'Toujours uniquement orale', 'Facultative'],
      correct: 0,
    },
    {
      q: 'Que signifie TBTS ?',
      choices: ['Très basse tension de sécurité', 'Tension barrée temporaire', 'Test de basse tension'],
      correct: 0,
    },
    {
      q: 'Les liaisons équipotentielles servent à…',
      choices: ['Augmenter la tension', 'Interconnecter les masses pour éviter une différence de potentiel', 'Couper l’alimentation'],
      correct: 1,
    },
  ],

  // ---------- Module 6 · EPC / EPI ----------
  [
    {
      q: 'Qui choisit les EPI ?',
      choices: ['L’employeur, après analyse du risque', 'Le stagiaire', 'Le client'],
      correct: 0,
    },
    {
      q: 'Avant chaque usage d’un EPI, il faut…',
      choices: ['Le ranger', 'Vérifier son état et son adaptation', 'Ne rien faire'],
      correct: 1,
    },
    {
      q: 'Contre l’arc électrique, on utilise…',
      choices: ['Des gants en coton', 'Un casque + un écran facial anti-UV', 'Des lunettes de soleil'],
      correct: 1,
    },
    {
      q: 'La lettre additionnelle d’un indice IP (ex. « B ») protège…',
      choices: ['Contre la pluie', 'Contre l’accès aux parties dangereuses (doigt, outil, fil)', 'Contre le bruit'],
      correct: 1,
    },
  ],

  // ---------- Module 7 · Distances de sécurité ----------
  [
    {
      q: 'La DMA (distance minimale d’approche) en basse tension est de…',
      choices: ['3 m', '0,30 m', '50 m'],
      correct: 1,
    },
    {
      q: 'La DLI (distance limite d’investigation) est fixée à…',
      choices: ['50 m d’une pièce nue sous tension', '1 m', '10 cm'],
      correct: 0,
    },
    {
      q: 'L’accès aux zones de voisinage renforcé nécessite…',
      choices: ['Rien de particulier', 'Une autorisation de travail ou d’intervention', 'Un casque seulement'],
      correct: 1,
    },
    {
      q: 'Avant des travaux près de canalisations enterrées, il faut…',
      choices: ['DT / DICT obligatoires', 'Rien', 'Juste prévenir un collègue'],
      correct: 0,
    },
  ],

  // ---------- Module 8 · Conduite en cas d'accident ----------
  [
    {
      q: 'En cas d’incendie, la première chose à faire est…',
      choices: ['Filmer la scène', 'Donner l’alarme', 'Quitter les lieux sans rien dire'],
      correct: 1,
    },
    {
      q: 'Sur un feu d’origine électrique, on utilise…',
      choices: ['De l’eau', 'Uniquement des extincteurs autorisés (respecter la tension max)', 'N’importe quel moyen'],
      correct: 1,
    },
    {
      q: 'Avant de porter secours à un électrisé, il faut…',
      choices: ['Le toucher immédiatement', 'Ne pas s’exposer et identifier les risques persistants', 'Crier pour alerter'],
      correct: 1,
    },
    {
      q: 'Une source d’ignition d’incendie peut être…',
      choices: ['La foudre, un échauffement, une surintensité', 'Le froid', 'Le silence'],
      correct: 0,
    },
  ],

  // ---------- Module 9 · Consignation ----------
  [
    {
      q: 'La 1re opération de consignation est…',
      choices: ['La vérification d’absence de tension', 'La séparation de l’ouvrage de toute source de tension', 'Le nettoyage'],
      correct: 1,
    },
    {
      q: 'Que signifie VAT ?',
      choices: ['Vérification d’absence de tension', 'Validation automatique', 'Vérification après travaux'],
      correct: 0,
    },
    {
      q: 'Le certificat pour tiers autorise…',
      choices: ['L’accès aux ouvrages après suppression des pièces nues sous tension', 'À tout faire sans condition', 'Rien de particulier'],
      correct: 0,
    },
    {
      q: 'Quel est l’ordre correct ?',
      choices: ['VAT puis séparation', 'Séparation → identification → vérification d’absence de tension', 'Identification en premier'],
      correct: 1,
    },
  ],
];