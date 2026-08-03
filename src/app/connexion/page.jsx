import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Logo from '@/components/Logo';
import LoginForm from '@/components/LoginForm';

export default async function ConnexionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect('/formation');

  return (
    <>
      <header className="bar">
        <div className="bar-in">
          <Link className="logo" href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            <Logo />
            <div>
              HYSES<small>SÉCURITÉ &amp; PRÉVENTION</small>
            </div>
          </Link>
          <div className="bar-spacer" />
        </div>
      </header>

      <section className="screen">
        <div className="wrap" style={{ paddingTop: 30 }}>
          <div className="eyebrow">Espace stagiaire</div>
          <h1 style={{ fontSize: 40, marginTop: 8 }}>Connexion</h1>
          <p className="lede">Connectez-vous avec les identifiants fournis par HYSES pour accéder à votre formation.</p>
          <LoginForm />
        </div>
      </section>
    </>
  );
}
