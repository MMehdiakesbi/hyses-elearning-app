// Rafraichit la session Supabase a chaque requete (cookies a jour).
//
// IMPORTANT (securite Next.js) : le middleware NE sert PAS a autoriser
// l'acces. L'autorisation reelle se fait dans chaque page serveur via
// supabase.auth.getUser() (voir src/app/formation/page.jsx).
// Cf. avis de securite Next.js sur le contournement du middleware.
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Rafraichit le token si necessaire (ne pas supprimer cet appel).
  await supabase.auth.getUser();

  return supabaseResponse;
}
