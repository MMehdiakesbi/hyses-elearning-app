'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Identifiants incorrects. Verifiez votre email et votre mot de passe.'
          : error.message
      );
      setBusy(false);
      return;
    }
    router.push('/formation');
    router.refresh();
  }

  return (
    <div className="card" style={{ padding: 26, marginTop: 32, maxWidth: 480 }}>
      <div className="eyebrow">Connexion stagiaire</div>

      <form onSubmit={handleLogin}>
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="prenom.nom@entreprise.fr"
            required
          />
        </div>
        <div className="field">
          <label>Mot de passe</label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error && <div className="authmsg err">{error}</div>}

        <button className="btn gold" type="submit" style={{ marginTop: 22 }} disabled={busy}>
          {busy ? 'Connexion…' : 'Se connecter →'}
        </button>
      </form>

      <p className="note" style={{ marginTop: 14 }}>
        Votre compte est cree par HYSES apres mise en place de la convention de formation. Besoin
        d'un acces ? Contact.hyses@gmail.com
      </p>
    </div>
  );
}
