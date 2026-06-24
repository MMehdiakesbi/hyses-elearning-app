import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import FormationApp from '@/components/FormationApp';

// L'AUTORISATION se fait ICI (cote serveur), pas dans le middleware.
export default async function FormationPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/connexion');

  // Profil + progression (crees automatiquement par le trigger SQL).
  const [{ data: profile }, { data: progress }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('progress').select('*').eq('user_id', user.id).single(),
  ]);

  return (
    <FormationApp
      user={{ id: user.id, email: user.email }}
      profile={profile}
      progress={progress}
    />
  );
}
