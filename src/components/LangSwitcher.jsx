'use client';

import { useEffect, useRef, useState } from 'react';

// Langues proposées. "code" = code Google Translate.
const LANGS = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', flag: '🇹🇳' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

// Pilote le menu Google (caché) pour traduire la page.
function applyGoogleLang(code, attempt = 0) {
  const combo = document.querySelector('.goog-te-combo');
  if (combo) {
    combo.value = code;
    combo.dispatchEvent(new Event('change'));
  } else if (attempt < 25) {
    // Le widget Google peut mettre 1-2 s à se charger : on réessaie.
    setTimeout(() => applyGoogleLang(code, attempt + 1), 150);
  }
}

export default function LangSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('fr');
  const ref = useRef(null);

  // Fermer au clic en dehors
  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  // Restaurer la langue mémorisée au chargement
  useEffect(() => {
    let saved = 'fr';
    try {
      saved = localStorage.getItem('hyses-lang') || 'fr';
    } catch {}
    if (saved !== 'fr') {
      setCurrent(saved);
      applyGoogleLang(saved);
    }
  }, []);

  function choose(code) {
    setCurrent(code);
    setOpen(false);
    try {
      localStorage.setItem('hyses-lang', code);
    } catch {}
    applyGoogleLang(code);
  }

  const cur = LANGS.find((l) => l.code === current) || LANGS[0];

  return (
    // notranslate : empêche Google de traduire les noms de langues du menu
    <div className={'lang-selector notranslate' + (open ? ' open' : '')} translate="no" ref={ref}>
      <button
        type="button"
        className="lang-btn"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-label="Choisir la langue"
      >
        <span className="lang-globe">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18" />
            <path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" />
          </svg>
        </span>
        <span>{cur.label}</span>
        <span className="lang-chevron">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      <div className="lang-menu">
        {LANGS.map((l) => (
          <div
            key={l.code}
            className={'lang-item' + (l.code === current ? ' active' : '')}
            onClick={() => choose(l.code)}
          >
            <span>{l.flag}</span> {l.label} <span className="dot" />
          </div>
        ))}
      </div>
    </div>
  );
}