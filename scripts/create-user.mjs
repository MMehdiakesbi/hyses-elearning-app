// =====================================================================
//  Creation d'un compte stagiaire (cote admin).
//
//  Usage :
//    node scripts/create-user.mjs <email> <motdepasse> "<Prenom>" "<NOM>" "<Fonction>" "<Entreprise>"
//
//  Exemple :
//    node scripts/create-user.mjs koussaila@akiem.com Passw0rd! Koussaila HAMLAT Ingenieur AKIEM
//
//  Necessite dans .env.local :
//    NEXT_PUBLIC_SUPABASE_URL
//    SUPABASE_SERVICE_ROLE_KEY   (cle secrete / service_role — NE PAS exposer)
//
//  Le trigger SQL cree automatiquement les lignes profiles + progress,
//  en reprenant prenom/nom/fonction/entreprise depuis le user_metadata.
// =====================================================================

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Mini-chargeur de .env.local (evite une dependance supplementaire).
function loadEnvLocal() {
  try {
    const txt = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
    for (const line of txt.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  } catch {
    // pas de .env.local : on compte sur l'environnement
  }
}
loadEnvLocal();

const [, , email, password, prenom, nom, fonction, entreprise] = process.argv;

if (!email || !password) {
  console.error(
    'Usage : node scripts/create-user.mjs <email> <motdepasse> "<Prenom>" "<NOM>" "<Fonction>" "<Entreprise>"'
  );
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Variables manquantes : NEXT_PUBLIC_SUPABASE_URL et/ou SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true, // compte actif immediatement (B2B)
  user_metadata: {
    prenom: prenom || '',
    nom: nom || '',
    fonction: fonction || '',
    entreprise: entreprise || '',
  },
});

if (error) {
  console.error('Erreur :', error.message);
  process.exit(1);
}

console.log('Compte cree :', data.user.email, '(id', data.user.id + ')');
console.log('Identite :', [prenom, nom, fonction, entreprise].filter(Boolean).join(' · '));
