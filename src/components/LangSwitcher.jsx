'use client';

import { useEffect, useRef, useState } from 'react';

// Langues du menu (code = code Google Translate).
const LANGS = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ar', label: 'العربية', flag: '🇹🇳' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'zh-CN', label: '中文', flag: '🇨🇳' },
];

// Pose le cookie de Google Traduction (méthode fiable). /fr/<cible>.
function setGoogTrans(target) {
  const host = window.location.hostname;
  const base = host.replace(/^www\./, '');
  const isFr = target === 'fr';
  const val = isFr ? '' : '/fr/' + target;
  const expire = isFr ? '; expires=Thu, 01 Jan 1970 00:00:00 GMT' : '';
  // On pose (ou supprime) le cookie sur plusieurs portées pour être sûr.
  document.cookie = 'googtrans=' + val + '; path=/' + expire;
  document.cookie = 'googtrans=' + val + '; path=/; domain=' + host + expire;
  document.cookie = 'googtrans=' + val + '; path=/; domain=.' + base + expire;
}

export default function LangSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('fr');
  const ref = useRef(null);

  // Restaurer la langue mémorisée (juste l'étiquette ; la page est déjà traduite par le cookie)
  useEffect(() => {
    let saved = 'fr';
    try {
      saved = localStorage.getItem('hyses-lang') || 'fr';
    } catch {}
    setCurrent(saved);
    if (saved !== 'fr') setGoogTrans(saved); // garde le cookie cohérent
  }, []);

  // Fermer au clic extérieur
  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  function choose(code) {
    setOpen(false);
    try {
      localStorage.setItem('hyses-lang', code);
    } catch {}
    setGoogTrans(code);
    // Recharge : Google applique la traduction proprement au chargement.
    window.location.reload();
  }

  const cur = LANGS.find((l) => l.code === current) || LANGS[0];

  return (
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