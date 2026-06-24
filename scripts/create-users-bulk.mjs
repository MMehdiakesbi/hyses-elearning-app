// =====================================================================
//  Creation de comptes stagiaires EN MASSE a partir du fichier Excel
//  "Modele_inscription_stagiaires.xlsx" rempli par l'entreprise.
//
//  Usage :
//    npm run create-users -- chemin/vers/Modele_inscription_stagiaires.xlsx
//  (par defaut : ./modeles/Modele_inscription_stagiaires.xlsx)
//
//  Colonnes attendues (feuille "Stagiaires", en-tetes en ligne 3) :
//    Prenom | Nom | Fonction | Societe | Email | Mot de passe (optionnel)
//
//  Resultat :
//    - cree un compte par ligne (email = identifiant)
//    - genere un mot de passe si la colonne est vide
//    - ecrit "identifiants_generes.csv" a cote du fichier Excel,
//      a transmettre a l'entreprise / aux stagiaires.
//
//  Necessite SUPABASE_SERVICE_ROLE_KEY dans .env.local.
// =====================================================================

import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';

function loadEnvLocal() {
  try {
    const txt = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
    for (const line of txt.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {}
}
loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Manque NEXT_PUBLIC_SUPABASE_URL et/ou SUPABASE_SERVICE_ROLE_KEY dans .env.local');
  process.exit(1);
}

const file = process.argv[2] || './modeles/Modele_inscription_stagiaires.xlsx';
const wb = XLSX.readFile(resolve(file));
const ws = wb.Sheets['Stagiaires'] || wb.Sheets[wb.SheetNames[0]];
// en-tetes en ligne 3 -> on lit a partir de la ligne 4
const rows = XLSX.utils.sheet_to_json(ws, { range: 2, defval: '' });

function genPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let p = '';
  for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p + '!';
}

const norm = (o, ...keys) => {
  for (const k of Object.keys(o)) {
    const kk = k.toLowerCase();
    if (keys.some((x) => kk.includes(x))) return String(o[k]).trim();
  }
  return '';
};

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const out = [['Prenom', 'Nom', 'Email', 'Mot de passe', 'Statut']];
let ok = 0, skip = 0, fail = 0;

for (const r of rows) {
  const prenom = norm(r, 'prenom', 'prénom');
  const nom = norm(r, 'nom');
  const fonction = norm(r, 'fonction', 'poste');
  const entreprise = norm(r, 'societe', 'société', 'entreprise');
  const email = norm(r, 'email', 'mail').toLowerCase();
  let password = norm(r, 'mot de passe', 'mot', 'password');

  if (!email || email.includes('exemple')) { skip++; continue; }
  if (!password) password = genPassword();

  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { prenom, nom, fonction, entreprise },
  });

  if (error) {
    fail++;
    out.push([prenom, nom, email, '', 'ERREUR : ' + error.message]);
    console.error('✗', email, '->', error.message);
  } else {
    ok++;
    out.push([prenom, nom, email, password, 'cree']);
    console.log('✓', email);
  }
}

const csv = out
  .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
  .join('\n');
const csvPath = join(dirname(resolve(file)), 'identifiants_generes.csv');
writeFileSync(csvPath, '\uFEFF' + csv, 'utf8'); // BOM pour Excel

console.log(`\nTermine : ${ok} cree(s), ${skip} ignore(s), ${fail} erreur(s).`);
console.log('Identifiants enregistres dans :', csvPath);
