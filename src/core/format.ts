import type { Lang } from './i18n'

/** One decimal, comma in Spanish. */
export const fmt = (v: number, lang: Lang): string => {
  const r = String(Math.round(v * 10) / 10)
  return lang === 'es' ? r.replace('.', ',') : r
}
