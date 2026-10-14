// =====================================================================
//  Mode RECETTE (tests internes HYSES uniquement).
//
//  Permet de marquer une video comme vue sans la regarder, pour derouler
//  le parcours complet en test automatise.
//
//  Active UNIQUEMENT si :
//    - NEXT_PUBLIC_MODE_RECETTE=1 (variable absente sur Vercel), ET
//    - NODE_ENV !== 'production' (garde : refuse en build de production,
//      meme si la variable etait ajoutee par erreur).
//  Les deux valeurs sont figees au build : en production, la condition
//  vaut `false` et le code du mode recette est elimine du bundle.
// =====================================================================

export const MODE_RECETTE =
  process.env.NEXT_PUBLIC_MODE_RECETTE === '1' && process.env.NODE_ENV !== 'production';
