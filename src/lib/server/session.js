// Identite de l'appelant : TOUJOURS le jeton de session verifie par Supabase
// (auth.getUser interroge le serveur d'authentification), jamais un user_id
// envoye par le navigateur.
import 'server-only';
import { createClient } from '@/lib/supabase/server';

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user || null;
}
