'use client';

import { useI18n } from '@/components/I18nProvider';
import { LANGS } from '@/lib/i18n';

// Menu déroulant de langue (FR / EN / ES). Le choix est mémorisé.
export default function LanguageSelector() {
  const { lang, setLang } = useI18n();
  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      aria-label="Langue / Language"
      style={{
        marginRight: 8,
        height: 38,
        borderRadius: 999,
        border: '1px solid var(--line)',
        background: 'transparent',
        color: 'inherit',
        padding: '0 10px',
        fontFamily: "'Space Mono', monospace",
        fontSize: 13,
        cursor: 'pointer',
      }}
    >
      {LANGS.map((l) => (
        <option key={l.code} value={l.code} style={{ color: '#16181a' }}>
          {l.label}
        </option>
      ))}
    </select>
  );
}