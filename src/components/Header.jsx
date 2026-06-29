'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Logo from '@/components/Logo';

export default function Header({ prenom, nom, fonction, entreprise, progress = 0 }) {
  const router = useRouter();

  async function logout() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    router.push('/');
    router.refresh();
  }

  const goHome = (e) => {
    e.preventDefault();
    logout(); // revenir à l'accueil = se déconnecter
  };

  const hasIdentity = prenom || nom;

  return (
    <header className="bar">
      <div className="bar-in">
        <a href="/" className="logo" onClick={goHome} style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
          <Logo />
          <div>
            HYSES<small>SÉCURITÉ &amp; PRÉVENTION</small>
          </div>
        </a>
        <div className="bar-spacer" />
        {hasIdentity && (
          <div className="who">
            <b>
              {prenom} {(nom || '').toUpperCase()}
            </b>
            {[fonction, entreprise].filter(Boolean).join(' · ')}
          </div>
        )}
        <a href="/" className="logout" onClick={goHome} style={{ marginRight: 8, textDecoration: 'none' }}>
          ← Accueil
        </a>
        <button className="logout" onClick={logout}>
          Déconnexion
        </button>
      </div>
      <div className="rail">
        <i style={{ width: `${progress}%` }} />
      </div>
    </header>
  );
}