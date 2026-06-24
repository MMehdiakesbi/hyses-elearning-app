// Client Supabase cote SERVEUR (Server Components, Route Handlers).
// Utilise la convention getAll/setAll de @supabase/ssr (Next 15/16).
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Appele depuis un Server Component : ignore.
            // Le rafraichissement de session est gere par le middleware.
          }
        },
      },
    }
  );
}
