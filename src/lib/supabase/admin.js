// Client Supabase SERVICE ROLE (ignore le RLS) — SERVEUR UNIQUEMENT.
// A n'utiliser que dans des Route Handlers, APRES avoir identifie
// l'utilisateur par sa session (auth.getUser), jamais par le corps de la requete.
// La cle est lue dans SUPABASE_SERVICE_ROLE_KEY (sans prefixe NEXT_PUBLIC_) :
// elle ne doit jamais etre affichee, loguee ni committee.
import 'server-only';
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Configuration serveur incomplete : SUPABASE_SERVICE_ROLE_KEY manquante');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
