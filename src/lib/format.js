// Utilitaires de formatage partages.

export function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

/** Date au format JJ/MM/AAAA. Accepte Date, string ISO, ou undefined (= now). */
export function frDate(input) {
  const d = input ? new Date(input) : new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Ajoute n annees a une date et la formate. */
export function frDatePlusYears(input, years) {
  const d = input ? new Date(input) : new Date();
  d.setFullYear(d.getFullYear() + years);
  return frDate(d);
}

/** Secondes -> "X h Y min" ou "Y min". */
export function humanDuration(seconds) {
  const total = Math.max(0, Math.round(seconds || 0));
  const h = Math.floor(total / 3600);
  const m = Math.max(1, Math.round((total % 3600) / 60));
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}
