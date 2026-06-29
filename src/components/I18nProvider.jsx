'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getDict } from '@/lib/i18n';

// Fournit la langue courante + la fonction de traduction t() à toute l'app.
// La langue est mémorisée dans le navigateur (localStorage 'hyses-lang').
const I18nCtx = createContext({ lang: 'fr', t: (k) => k, setLang: () => {} });

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState('fr'); // 'fr' au 1er rendu (évite un décalage serveur/client)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hyses-lang');
      if (saved && saved !== lang) setLangState(saved);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setLang(l) {
    setLangState(l);
    try { localStorage.setItem('hyses-lang', l); } catch {}
  }

  const dict = getDict(lang);
  function t(key, vars) {
    let s = dict[key];
    if (s == null) s = key;
    if (vars) {
      for (const k in vars) s = s.split('{' + k + '}').join(String(vars[k]));
    }
    return s;
  }

  return <I18nCtx.Provider value={{ lang, t, setLang }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  return useContext(I18nCtx);
}
