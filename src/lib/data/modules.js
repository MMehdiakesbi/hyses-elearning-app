// =====================================================================
//  Les 9 modules du parcours (cahier des charges).
//
//  Contenu : resume structure tire du PowerPoint officiel HYSES
//  (154 diapositives, formation H0 B0 H0V - NF C 18-510).
//
//  Sources video : 6 films YouTube integres dans le PowerPoint,
//  rattaches ici a leur module. Un module peut avoir :
//   - `youtube` : identifiant de la video YouTube (+ `youtubeStart`
//                 optionnel : depart en secondes)
//   - `video`   : OU une URL de fichier .mp4/.webm auto-heberge
//  Si les deux sont null -> l'UI affiche un encart "video a venir".
// =====================================================================

// Videos auto-hebergees : bucket public Supabase Storage « videos »
// (le dossier public/videos n'est pas versionne, donc absent du deploiement).
const VIDEOS = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/videos`;

export const MODULES = [
  {
    day: 'Module 1 · Introduction',
    t: 'Présentation de la formation',
    youtube: null,
    youtubeStart: null,
    video: `${VIDEOS}/module1.mp4`,
    p: "Objectifs, déroulé et cadre de la formation H0 B0 H0V (7 heures) pour le personnel non électricien. Elle prépare à analyser le risque électrique, intégrer la prévention dans le travail et appliquer les instructions de l'employeur.",
    li: [
      "Objectifs : analyser le risque, intégrer la prévention, mettre en œuvre les mesures et instructions de l'employeur, connaître les dangers et la conduite à tenir en cas d'accident ou d'incendie",
      "Pourquoi l'habilitation : éviter les accidents dus à la méconnaissance des risques, à une défaillance du matériel ou à des conditions de travail dangereuses",
      "Pour qui : du donneur d'ordre à l'exécutant, chacun prend en compte la prévention à son niveau de responsabilité",
      "Cadre réglementaire : norme NF C 18-510 et décrets associés (2010-1118…)",
      "Facteurs aggravants : alcool, stupéfiants et certains médicaments altèrent le comportement ; l'employeur peut en réglementer la consommation",
      "Démarche de prévention : pilotée par le chef d'établissement, qui applique les 9 principes généraux de prévention (Code du travail)",
      "Partenaires de la prévention : CARSAT, CSE, médecine du travail, inspection du travail, INRS, OPPBTP, organismes de contrôle",
      "Le parcours en ligne couvre la théorie et le QCM ; la mise en situation pratique se fait en présentiel",
    ],
  },
  {
    day: 'Module 2 · Le risque',
    t: 'Les risques électriques',
    youtube: null,
    youtubeStart: null,
    video: `${VIDEOS}/module2.mp4`,
    p: "Pourquoi le risque électrique est si grave : statistiques, obligations réglementaires et différents types de contacts dangereux.",
    li: [
      "Statistiques (INRS) : les accidents du travail d'origine électrique sont rares mais souvent graves, voire mortels",
      "Secteurs les plus exposés : BTP, métallurgie, activités de service, commerces et industries de l'alimentation",
      "Code du travail : l'employeur définit et met en œuvre les mesures de prévention (art. R4544-4) et assure la sécurité des travailleurs (art. L4121-1)",
      "Code pénal : sanctions (amende, emprisonnement) en cas d'atteinte involontaire à l'intégrité ou à la vie (art. 222-19)",
      "Normalisation : CEI (mondial), CENELEC (européen), UTE / AFNOR (français)",
      "Contact direct : contact avec une partie active normalement sous tension (main-main, main-pied, phase-terre…)",
      "Contact indirect : contact avec une masse mise accidentellement sous tension par défaut d'isolement (ex. tension de pas)",
      "Sans contact : amorçage / arc électrique en haute tension — le choc peut survenir sans toucher la pièce",
      "Court-circuit : contact entre deux potentiels différents ; risque de flash pour les yeux et de projection de métal en fusion",
    ],
  },
  {
    day: 'Module 3 · Effets sur l’homme',
    t: 'Les effets du courant électrique',
    youtube: null,
    youtubeStart: null,
    video: `${VIDEOS}/module3.mp4`,
    p: "Notions de base (tension, intensité, résistance) et effets du courant électrique sur le corps humain.",
    li: [
      "Le courant naît d'une différence de potentiel (tension U) ; sans tension, pas de courant (similitude avec la chute d'eau)",
      "Loi d'Ohm : I = U / R (intensité, tension, résistance)",
      "Loi de Joule : l'énergie dissipée (W = R·I²·t) échauffe la résistance ; le corps humain étant une résistance, le courant peut le brûler",
      "Réseau basse tension courant : 400 V entre phases, 230 V entre phase et neutre",
      "Électrisation : passage du courant dans le corps, avec ou sans lésion apparente",
      "Électrocution : électrisation entraînant la mort",
      "Autres lésions : brûlures externes et internes, perforation interne (en HT), chute de hauteur provoquée par le choc",
      "La terre est conductrice et les chaussures ordinaires ne sont pas isolantes : le courant retourne au sol par le corps",
      "La gravité dépend de l'intensité, du temps de passage, du trajet du courant et de la physiologie",
    ],
  },
  {
    day: 'Module 4 · Habilitation',
    t: 'Les habilitations électriques',
    youtube: null,
    youtubeStart: null,
    video: `${VIDEOS}/module4.mp4`,
    p: "Définition de l'habilitation, symboles (B0 / H0 / H0V), titre d'habilitation et rôles des différents acteurs.",
    li: [
      "L'habilitation est la reconnaissance, par l'employeur, de la capacité d'une personne à accomplir des tâches en sécurité (NF C 18-510)",
      "Conditions d'attribution : type d'ouvrage, localisation, nature des opérations (ordre électrique ou non), domaine de tension",
      "Le titre d'habilitation est délivré et signé par l'employeur, remis contre reçu avec un carnet de prescriptions",
      "Suivi : l'habilitation est révisée dès que nécessaire et au moins une fois par an (mutation, changement de fonction, restriction d'aptitude…)",
      "Symbole — 1re lettre : domaine de tension (B = basse tension, H = haute tension)",
      "Symbole — 2e caractère : rôle (0 = non électricien, 1 = exécutant, 2 = chargé de travaux, R = intervention, S = élémentaire, C = consignation…)",
      "Lettre V = travaux au voisinage (ex. H0V = non électricien au voisinage en haute tension)",
      "B0 / H0 / H0V : opérations d'ordre NON électrique dans l'environnement d'ouvrages électriques — c'est le périmètre de cette formation",
      "Acteurs : l'employeur (autorité, formation, titre), le chargé de consignation (BC/HC), le chargé d'intervention (BR), l'exécutant et le surveillant de sécurité",
      "L'exécutant non électricien ne réalise jamais de tâche d'ordre électrique (ex. changer une prise, un disjoncteur)",
    ],
  },
  {
    day: 'Module 5 · Prévention',
    t: 'Les moyens de prévention',
    youtube: 'TmvvhgeKX7w', // Risque elec. & consignation NF C 18-510
    youtubeStart: null,
    video: null,
    p: "Organiser la prévention dans le travail et appliquer les protections contre les contacts indirects.",
    li: [
      "La démarche globale de prévention dépend du chef d'établissement, qui met en place une politique de prévention (9 principes généraux)",
      "Niveaux de prévention : risque évité, risque limité, risque résiduel — l'objectif est d'éviter le risque à la source",
      "Analyser le risque avant toute intervention et respecter les instructions de l'employeur",
      "L'instruction de sécurité : prescription orale ou écrite établie par l'employeur pour la prévention du risque électrique",
      "Le carnet de prescriptions, remis contre reçu, complète les instructions de sécurité",
      "Protection contre les contacts indirects : coupure automatique par dispositif différentiel (30 mA pour la protection des personnes)",
      "Séparation des circuits par transformateur d'isolement ; emploi de la TBTS (très basse tension de sécurité)",
      "Liaisons équipotentielles : interconnecter les masses d'un local pour éviter une différence de potentiel",
      "Milieux humides ou locaux exigus : différentiel haute sensibilité 30 mA et matériel adapté",
    ],
  },
  {
    day: 'Module 6 · Protections',
    t: 'Les EPC et EPI',
    youtube: 'nsiSkF5PpEE', // EPI / EPC
    youtubeStart: null,
    video: null,
    p: "Protéger collectivement la zone (EPC) et individuellement l'opérateur (EPI) face au risque électrique.",
    li: [
      "EPC (protection collective) : balisage de la zone (banderoles, barrières, filets), écrans et obstacles, protecteurs isolants sur conducteurs nus",
      "Supprimer une protection (porte ouverte, capot relevé) crée un risque : attention à la responsabilité de chacun",
      "Indices de protection IP (NF EN 60529) : 1er chiffre = protection contre les solides (0 à 6), 2e chiffre = contre les liquides (0 à 8)",
      "Lettre additionnelle (ex. IP XX B) : protection des personnes contre l'accès aux parties dangereuses (doigt, outil, fil)",
      "EPI : choisis par l'employeur après analyse du risque, en respectant les principes généraux de prévention",
      "Gants isolants + surgants (NF EN 60903) pour la protection des mains",
      "Casque + écran facial anti-UV contre l'arc électrique (NF EN 397 et NF EN 166)",
      "Chaussures isolantes (NF EN 50321) et tapis isolants (NF EN 61111)",
      "En cas de risques multiples (ex. électrique + chimique), les EPI doivent être compatibles entre eux",
      "Vérifier l'état et l'adaptation du matériel avant chaque usage",
    ],
  },
  {
    day: 'Module 7 · Zones & distances',
    t: 'Les distances de sécurité',
    youtube: 'NKV4NYJi8Rk', // Les zones et les distances
    youtubeStart: null,
    video: null,
    p: "Domaines de tension, distances réglementaires et zones d'environnement autour des pièces nues sous tension.",
    li: [
      "Domaines de tension : TBT, BT et HT, classés selon la plus grande tension nominale présente",
      "DLI (distance limite d'investigation) : fixée à 50 m d'une pièce nue sous tension, sauf limite physique",
      "DMA (distance minimale d'approche) : 0,30 m en basse tension",
      "Distance de tension en HT : t = 0,005 × Un (Un exprimée en kV)",
      "Zone 0 : zone d'investigation (entre la DLI et la limite de voisinage simple)",
      "Zone 1 : voisinage simple ; Zone 2 : voisinage renforcé HT ; Zone 4 : voisinage renforcé BT (jusqu'à la DMA de 0,30 m)",
      "L'accès aux zones de voisinage renforcé est soumis à autorisation de travail ou d'intervention",
      "Canalisations enterrées : tenir compte de l'incertitude de positionnement (0,40 à 1 m) ; DT / DICT obligatoires avant travaux",
      "Canalisations noyées ou encastrées : DLAP fixée à 0,50 m",
      "À proximité des réseaux : formation et AIPR (autorisation d'intervention à proximité des réseaux) requises",
      "Lignes aériennes nues : à l'approche des 50 cm, le personnel même habilité doit être surveillé",
    ],
  },
  {
    day: 'Module 8 · Urgence',
    t: "La conduite à tenir en cas d'accident",
    youtube: null,
    youtubeStart: null,
    video: `${VIDEOS}/module8.mp4`,
    p: "Réagir face à un accident corporel ou à un incendie d'origine électrique, dans le bon ordre.",
    li: [
      "Incendies — sources d'ignition : foudre, échauffements, électricité statique, surintensité, projections, étincelles",
      "Le triangle du feu : combustible + comburant + source de chaleur réunis simultanément",
      "En cas d'incendie : donner l'alarme, puis combattre le feu selon la consigne affichée et avec des moyens adaptés",
      "N'utiliser que des extincteurs autorisés sur courant électrique ; respecter la tension maximale indiquée",
      "Incendie au voisinage d'une ligne : faire mettre la ligne hors tension, ne pas approcher d'un foyer au pied d'un support HT",
      "Soins aux électrisés — sans s'exposer, identifier les risques persistants (écrasement, incendie, explosion, asphyxie)",
      "1) Supprimer le danger : couper ou faire couper la tension avant tout",
      "2) Ne jamais toucher une victime encore en contact avec la tension",
      "3) Alerter les secours avec des renseignements précis (lieu, nombre et état des victimes, cause)",
      "4) Porter assistance en suivant les consignes préétablies en attendant les secours",
    ],
  },
  {
    day: 'Module 9 · Consignation',
    t: 'Les notions de consignation',
    youtube: 'olR1TyOFiFI', // Habilitation électrique INRS (consignation)
    youtubeStart: null,
    video: null,
    p: "Consignation et déconsignation d'un ouvrage, certificat pour tiers et lecture des symboles normalisés.",
    li: [
      "La consignation protège les personnes et les ouvrages contre le maintien ou le retour intempestif de la tension",
      "Seul le chargé de consignation (BC / HC) peut réaliser la consignation",
      "1re opération : séparation de l'ouvrage de toute source de tension",
      "2e opération : condamnation des organes de séparation (verrouillage + signalisation)",
      "3e opération : identification de l'ouvrage sur le lieu de travail",
      "4e opération : vérification d'absence de tension (VAT)",
      "5e opération : mise à la terre et en court-circuit (MALT-CC)",
      "Le certificat pour tiers autorise l'accès aux ouvrages après suppression de la présence de pièces nues sous tension",
      "Symboles normalisés : disjoncteur, sectionneur, interrupteur, fusible, contacteur, transformateur, prises et conducteurs (phase, neutre, terre)",
      "Savoir lire ces symboles sur un schéma facilite l'identification des organes de séparation et de protection",
    ],
  },
];