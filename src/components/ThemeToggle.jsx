'use client';

import { useEffect, useState } from 'react';

// Bouton clair/sombre. Le choix est mémorisé dans le navigateur (localStorage)
// et appliqué sur <html data-theme="...">. Le thème est aussi appliqué très tôt
// par un petit script dans layout.jsx (pour éviter un clignotement au chargement).
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    let isDark = false;
    try {
      isDark = localStorage.getItem('hyses-theme') === 'dark';
    } catch {}
    setDark(isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    try { localStorage.setItem('hyses-theme', next ? 'dark' : 'light'); } catch {}
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  }

  return (
    <button
      type="button"
      className="theme-btn"
      onClick={toggle}
      aria-label={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={dark ? 'Mode clair' : 'Mode sombre'}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
