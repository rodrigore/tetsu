import type { Lang } from './i18n'

/** One decimal, comma in Spanish. */
export const fmt = (v: number, lang: Lang): string => {
  const r = String(Math.round(v * 10) / 10)
  return lang === 'es' ? r.replace('.', ',') : r
}

/** Plate and collar weights: up to two decimals, so 0.25 is not shown as 0.3. */
export const fmtW = (v: number, lang: Lang): string => {
  const r = String(Math.round(v * 100) / 100)
  return lang === 'es' ? r.replace('.', ',') : r
}
