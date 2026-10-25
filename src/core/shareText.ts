import { fmtW, fmt } from './format'
import type { Lang } from './i18n'
import type { Unit } from './units'
import { fromKg } from './units'

export interface ShareInput {
  lang: Lang
  unit: Unit
  liftName: string
  pct: number
  prKg: number
  targetKg: number
  totalKg: number
  barLabel: string
  /** Heaviest first, one entry per plate on one side: label + unit, e.g. "45 lb". */
  plates: { value: number; unit: Unit }[]
  sideKg: number
}

/** Plain-text summary of the current load, for WhatsApp and friends. */
export function shareText(i: ShareInput): string {
  const es = i.lang === 'es'
  const U = i.unit.toUpperCase()
  const w = (kg: number) => `${fmt(fromKg(kg, i.unit), i.lang)} ${U}`
  const groups: { text: string; n: number }[] = []
  for (const p of i.plates) {
    const text = `${fmtW(p.value, i.lang)} ${p.unit.toLowerCase()}`
    const g = groups.find((x) => x.text === text)
    if (g) g.n++
    else groups.push({ text, n: 1 })
  }
  const plates = groups.length ? groups.map((g) => (g.n > 1 ? `${g.n}×${g.text}` : g.text)).join(' + ') : es ? 'sin discos' : 'no plates'
  const l1 = `${i.liftName} · ${fmt(i.pct, i.lang)} % ${es ? 'de' : 'of'} ${w(i.prKg)} = ${w(i.targetKg)}`
  const l2 = `${es ? 'Barra' : 'Bar'} ${i.barLabel} · ${es ? 'por lado' : 'per side'}: ${plates} (${w(i.sideKg)})`
  const l3 = `${es ? 'En la barra' : 'On the bar'}: ${w(i.totalKg)}`
  return [l1, l2, l3].join('\n')
}
