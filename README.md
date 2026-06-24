# HYSES — Plateforme e-learning « Habilitation électrique B0 H0V »

Application Next.js 16 + Supabase. Parcours stagiaire : modules vidéo (anti-triche),
test de positionnement, quiz final (2 tentatives), attestation Word générée à partir
du modèle officiel HYSES.

## DÉMARRAGE (dans l'ordre)

### 1. Installer
```
npm install
```

### 2. Déposer les vidéos
Mettre les fichiers dans **public/videos/** avec EXACTEMENT ces noms :
- module1.mp4  (Module 1 - Présentation)
- module2.mp4  (Module 2 - Risques électriques)
- module3.mp4  (Module 3 - Effets du courant)
- module4.mp4  (Module 4 - Habilitations)
- module8.mp4  (Module 8 - Conduite en cas d'accident)
- module9.mp4  (Module 9 - Consignation)

Les modules 5, 6, 7 sont en YouTube intégré (rien à déposer).

### 3. Base de données Supabase
Les clés sont déjà dans **.env.local**.
Dans Supabase > SQL Editor, exécuter UNE FOIS pour ajouter le compteur de tentatives :
```sql
alter table public.progress
add column if not exists final_attempts int not null default 0;
```
(Pour une base neuve, exécuter tout supabase/schema.sql à la place.)

### 4. Lancer
```
npm run dev
```
Ouvrir http://localhost:3000

## OPTIONNEL (création de comptes en masse + email automatique)
Dans **.env.local**, compléter :
- SUPABASE_SERVICE_ROLE_KEY=sb_secret_...   (Supabase > Settings > API Keys)
- RESEND_API_KEY=...                         (pour l'envoi auto de l'attestation)

Créer un compte :
```
npm run create-user -- email@exemple.com "MotDePasse!" "Prénom" "NOM" "Fonction" "Société"
```
Créer plusieurs comptes (remplir modeles/Modele_inscription_stagiaires.xlsx) :
```
npm run create-users
```

## RÈGLES MÉTIER
- Quiz final : seuil 12/13 (>= 90 %), 2 tentatives maximum puis blocage.
- L'attestation en ligne couvre la théorie + le QCM. La mise en situation pratique
  reste en présentiel ; le titre d'habilitation est délivré par l'employeur.
