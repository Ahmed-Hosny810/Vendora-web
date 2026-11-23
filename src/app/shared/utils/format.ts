// Formatting shared by the app pages. Numbers always use Latin digits (like receipts).

/** 1234.5 → "1,234.50" */
export function formatMoney(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** 1234 → "1,234"; 2.5 → "2.5" */
export function formatQty(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 3 });
}

function locale(lang: string): string {
  return lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB';
}

/** "21 Nov 2026" */
export function formatDate(date: Date, lang: string): string {
  return date.toLocaleDateString(locale(lang), { day: 'numeric', month: 'short', year: 'numeric' });
}

/** "21 Nov, 13:48" */
export function formatDateTime(date: Date, lang: string): string {
  const d = date.toLocaleDateString(locale(lang), { day: 'numeric', month: 'short' });
  const t = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${d}, ${t}`;
}

/** "SH" for "Salma Hassan" */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts.at(-1)![0] : '')).toUpperCase();
}

/** "23 Nov" (no year), for chart labels. */
export function formatDayMonth(date: Date, lang: string): string {
  return date.toLocaleDateString(locale(lang), { day: 'numeric', month: 'short' });
}

/** "Sat" (Arabic: "السبت"), for chart labels. */
export function formatWeekday(date: Date, lang: string): string {
  return date.toLocaleDateString(locale(lang), { weekday: 'short' });
}

/** 48230 → "48.2k"; 1250000 → "1.3M"; 900 → "900". For chart axes. */
export function formatCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${+(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${+(value / 1_000).toFixed(1)}k`;
  return `${Math.round(value)}`;
}
