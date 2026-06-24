// Client Supabase cote NAVIGATEUR (composants 'use client').
// Gere la session via cookies (lisibles par le serveur).
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
