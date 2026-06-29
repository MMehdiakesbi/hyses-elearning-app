// Dictionnaire de traductions de l'INTERFACE (boutons, titres, messages).
// 3 langues pour l'instant : français (fr), anglais (en), espagnol (es).
// Pour ajouter une langue : copie le bloc "en" et traduis les valeurs.
//
// NOTE IMPORTANTE : ceci traduit l'interface, PAS le contenu pédagogique des
// modules ni les questions (contenu de sécurité = à traduire séparément, avec
// relecture humaine).
//
// Utilisation : const { t } = useI18n();  puis  t('nav_logout')
// Variables : t('course_lede', { done: 3, total: 9 })  -> remplace {done} et {total}

export const LANGS = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
];

export const DICT = {
  fr: {
    // Barre du haut
    tagline: 'SÉCURITÉ & PRÉVENTION',
    nav_home: '← Accueil',
    nav_logout: 'Déconnexion',

    // Profil
    welcome: 'Bienvenue',
    profile_title: 'Complétez votre profil',
    profile_lede: 'Ces informations figureront sur votre attestation. Vérifiez-les avant de commencer.',
    f_firstname: 'Prénom',
    f_lastname: 'Nom',
    f_role: 'Fonction',
    f_company: 'Entreprise',
    btn_continue: 'Continuer →',
    btn_saving: 'Enregistrement…',

    // Positionnement
    step1: 'Étape 1 · Avant la formation',
    pos_title: 'Test de positionnement',
    pos_lede: 'On évalue votre niveau de départ avant le parcours. Ce score est conservé dans votre dossier mais ne conditionne pas la validation.',
    pos_saved: 'Positionnement enregistré',
    pos_done_lede: "C'est votre niveau de départ. Place à la formation : suivez les modules, puis vous passerez le quiz final.",
    btn_to_modules: 'Accéder aux modules →',

    // Parcours
    step2: 'Étape 2 · Parcours de formation',
    modules_title: 'Modules',
    course_lede: 'Consultez et validez chaque module pour débloquer le quiz final. Progression : {done} / {total}',
    all_done_note: '✓ Tous les modules sont consultés.',
    consult_note: 'Consultez les {total} modules pour accéder au quiz final.',
    btn_see_result: 'Voir mon résultat',
    btn_take_final: 'Passer le quiz final →',

    // Quiz final
    step3: 'Étape 3 · Évaluation finale',
    final_title: 'Quiz final',
    review_note: 'Correction affichée — réponses verrouillées.',
    final_lede: "{n} questions, ordre mélangé. Réussite à partir de {threshold}/{total} (≥ 90 %). En dessous, l'attestation n'est pas générée.",

    // Score
    passed_eyebrow: 'Formation validée',
    failed_eyebrow: 'Seuil non atteint',
    congrats: 'Félicitations 🎉',
    not_yet: 'Pas encore',
    recap_pos: 'Positionnement',
    recap_final: 'Quiz final',
    recap_time: 'Temps passé',
    btn_review: 'Revoir mes réponses',
    btn_retry: 'Recommencer le quiz ({n} restante)',
    exhausted_note: 'Tentatives épuisées — contactez votre formateur.',
    btn_see_cert: 'Voir mon attestation →',

    // Attestation
    step4: 'Étape 4 · Attestation',
    cert_title: 'Votre attestation',
    btn_back: '← Retour',
  },

  en: {
    tagline: 'SAFETY & PREVENTION',
    nav_home: '← Home',
    nav_logout: 'Log out',

    welcome: 'Welcome',
    profile_title: 'Complete your profile',
    profile_lede: 'This information will appear on your certificate. Please check it before starting.',
    f_firstname: 'First name',
    f_lastname: 'Last name',
    f_role: 'Job title',
    f_company: 'Company',
    btn_continue: 'Continue →',
    btn_saving: 'Saving…',

    step1: 'Step 1 · Before the training',
    pos_title: 'Placement test',
    pos_lede: 'We assess your starting level before the course. This score is kept in your record but does not affect completion.',
    pos_saved: 'Placement saved',
    pos_done_lede: 'This is your starting level. Now the training: go through the modules, then take the final quiz.',
    btn_to_modules: 'Go to the modules →',

    step2: 'Step 2 · Training path',
    modules_title: 'Modules',
    course_lede: 'Review and validate each module to unlock the final quiz. Progress: {done} / {total}',
    all_done_note: '✓ All modules reviewed.',
    consult_note: 'Review the {total} modules to access the final quiz.',
    btn_see_result: 'See my result',
    btn_take_final: 'Take the final quiz →',

    step3: 'Step 3 · Final assessment',
    final_title: 'Final quiz',
    review_note: 'Answers shown — locked.',
    final_lede: '{n} questions, shuffled order. Pass from {threshold}/{total} (≥ 90%). Below that, the certificate is not generated.',

    passed_eyebrow: 'Training passed',
    failed_eyebrow: 'Threshold not reached',
    congrats: 'Congratulations 🎉',
    not_yet: 'Not yet',
    recap_pos: 'Placement',
    recap_final: 'Final quiz',
    recap_time: 'Time spent',
    btn_review: 'Review my answers',
    btn_retry: 'Retake the quiz ({n} left)',
    exhausted_note: 'No attempts left — please contact your trainer.',
    btn_see_cert: 'See my certificate →',

    step4: 'Step 4 · Certificate',
    cert_title: 'Your certificate',
    btn_back: '← Back',
  },

  es: {
    tagline: 'SEGURIDAD Y PREVENCIÓN',
    nav_home: '← Inicio',
    nav_logout: 'Cerrar sesión',

    welcome: 'Bienvenido',
    profile_title: 'Complete su perfil',
    profile_lede: 'Esta información aparecerá en su certificado. Verifíquela antes de comenzar.',
    f_firstname: 'Nombre',
    f_lastname: 'Apellido',
    f_role: 'Función',
    f_company: 'Empresa',
    btn_continue: 'Continuar →',
    btn_saving: 'Guardando…',

    step1: 'Etapa 1 · Antes de la formación',
    pos_title: 'Prueba de nivel',
    pos_lede: 'Evaluamos su nivel inicial antes del recorrido. Esta puntuación se guarda en su expediente pero no condiciona la validación.',
    pos_saved: 'Nivel registrado',
    pos_done_lede: 'Este es su nivel inicial. Ahora la formación: siga los módulos y luego realice el examen final.',
    btn_to_modules: 'Acceder a los módulos →',

    step2: 'Etapa 2 · Recorrido de formación',
    modules_title: 'Módulos',
    course_lede: 'Consulte y valide cada módulo para desbloquear el examen final. Progreso: {done} / {total}',
    all_done_note: '✓ Todos los módulos consultados.',
    consult_note: 'Consulte los {total} módulos para acceder al examen final.',
    btn_see_result: 'Ver mi resultado',
    btn_take_final: 'Realizar el examen final →',

    step3: 'Etapa 3 · Evaluación final',
    final_title: 'Examen final',
    review_note: 'Corrección mostrada — respuestas bloqueadas.',
    final_lede: '{n} preguntas, orden aleatorio. Se aprueba a partir de {threshold}/{total} (≥ 90 %). Por debajo, no se genera el certificado.',

    passed_eyebrow: 'Formación aprobada',
    failed_eyebrow: 'Umbral no alcanzado',
    congrats: '¡Felicidades! 🎉',
    not_yet: 'Todavía no',
    recap_pos: 'Nivel',
    recap_final: 'Examen final',
    recap_time: 'Tiempo dedicado',
    btn_review: 'Revisar mis respuestas',
    btn_retry: 'Repetir el examen ({n} restante)',
    exhausted_note: 'Sin intentos restantes — contacte a su formador.',
    btn_see_cert: 'Ver mi certificado →',

    step4: 'Etapa 4 · Certificado',
    cert_title: 'Su certificado',
    btn_back: '← Volver',
  },
};

export function getDict(lang) {
  return DICT[lang] || DICT.fr;
}