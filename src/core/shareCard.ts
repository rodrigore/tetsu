import { fmt, fmtW } from './format'
import type { Lang } from './i18n'
import { paletteOf } from './palette'
import { plateLook } from './plateView'
import { solve, type SolveInput } from './solver'
import { fromKg, type Unit } from './units'
import { warmupSteps } from './warmup'

/* ───────────────────────── model ───────────────────────── */

export type CardFormat = 'story' | 'square'
export type CardTemplate =
  | 'serie' | 'sesion' | 'tabla' | 'foto' | 'numero' | 'frase' | 'porcentaje' | 'discos' | 'series'
  | 'compacta' | 'linea'
export type Tone = 'dark' | 'light'

export const TEMPLATES: { id: CardTemplate; format: CardFormat; name: { es: string; en: string } }[] = [
  { id: 'serie', format: 'story', name: { es: 'SERIE', en: 'SET' } },
  { id: 'sesion', format: 'story', name: { es: 'SESIÓN', en: 'SESSION' } },
  { id: 'tabla', format: 'story', name: { es: 'TABLA DE %', en: '% TABLE' } },
  { id: 'foto', format: 'story', name: { es: 'SOBRE TU FOTO', en: 'OVER A PHOTO' } },
  { id: 'numero', format: 'story', name: { es: 'SOLO EL NÚMERO', en: 'JUST THE NUMBER' } },
  { id: 'frase', format: 'story', name: { es: 'FRASE', en: 'SENTENCE' } },
  { id: 'porcentaje', format: 'story', name: { es: 'SOLO EL %', en: 'JUST THE %' } },
  { id: 'discos', format: 'story', name: { es: 'SOLO LOS DISCOS', en: 'JUST THE PLATES' } },
  { id: 'series', format: 'story', name: { es: 'SERIES SIMPLES', en: 'SIMPLE SETS' } },
  { id: 'compacta', format: 'square', name: { es: 'COMPACTA', en: 'COMPACT' } },
  { id: 'linea', format: 'square', name: { es: 'LÍNEA', en: 'LINE' } },
]

export const templatesFor = (f: CardFormat) => TEMPLATES.filter((t) => t.format === f)
export const formatOf = (t: CardTemplate): CardFormat => TEMPLATES.find((x) => x.id === t)!.format
export const cardSize = (f: CardFormat) => ({ w: 360, h: f === 'story' ? 640 : 360 })

export interface CardPlate {
  value: number
  unit: Unit
  custom: boolean
}
export interface CardSet {
  label: string
  kg: number
  sideKg: number
  work: boolean
}
export interface CardRow {
  pct: number
  kg: number
  sideKg: number
  current: boolean
}
export interface CardData {
  lang: Lang
  unit: Unit
  side: 'kg' | 'lb' | 'both'
  olympic: boolean
  liftName: string
  pct: number
  prKg: number
  targetKg: number
  totalKg: number
  sideKg: number
  barLabel: string
  barText: string
  plates: CardPlate[]
  chips: { label: string; unit: string; count: number }[]
  sets: CardSet[]
  table: CardRow[]
  date: string
  url: string
}

export interface CardStyle {
  template: CardTemplate
  /** Palette accent, "" follows the app. Resolved to the right shade per tone. */
  accent: string
  tone: Tone
  plates: boolean
  date: boolean
  link: boolean
}

export const defaultShare = (): CardStyle => ({
  template: 'serie',
  accent: '',
  tone: 'dark',
  plates: true,
  date: true,
  link: true,
})

/* ───────────────────────── data ───────────────────────── */

export interface BuildInput {
  lang: Lang
  unit: Unit
  side: 'kg' | 'lb' | 'both'
  olympic: boolean
  liftName: string
  pct: number
  prKg: number
  barLabel: string
  warm: number[]
  date: Date
  url: string
  /** Bar, collars, plates and rounding, as used by the main screen. */
  base: Omit<SolveInput, 'targetKg'>
}

const TABLE_PCTS = [60, 70, 80, 90, 95, 100]

export function formatDate(d: Date, lang: Lang): string {
  const parts = new Intl.DateTimeFormat(lang === 'es' ? 'es' : 'en', { day: 'numeric', month: 'short', year: 'numeric' })
    .formatToParts(d)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  return `${get('day')} ${get('month')} ${get('year')}`.replace(/\./g, '').toLocaleUpperCase(lang)
}

export function buildCardData(i: BuildInput): CardData {
  const targetKg = (i.prKg * i.pct) / 100
  const res = solve({ ...i.base, targetKg })
  const es = i.lang === 'es'

  const chips: CardData['chips'] = []
  for (const p of res.perSide) {
    const label = fmtW(p.value, i.lang)
    const unit = p.unit.toUpperCase()
    const c = chips.find((x) => x.label === label && x.unit === unit)
    if (c) c.count++
    else chips.push({ label, unit, count: 1 })
  }

  const warm = warmupSteps(targetKg, i.warm, i.base)
  const sets: CardSet[] = [
    ...warm.map((s) => ({
      label: s.pct === null ? (es ? 'BARRA VACÍA' : 'EMPTY BAR') : `${fmt(s.pct, i.lang)}%`,
      kg: s.result.totalKg,
      sideKg: s.result.loadedSideKg,
      work: false,
    })),
    { label: `${fmt(i.pct, i.lang)}%`, kg: res.totalKg, sideKg: res.loadedSideKg, work: true },
  ]

  const pcts = [...new Set([...TABLE_PCTS, i.pct])].filter((p) => p > 0 && p <= 100).sort((a, b) => a - b)
  const table = pcts.map((p) => {
    const r = solve({ ...i.base, targetKg: (i.prKg * p) / 100 })
    return { pct: p, kg: r.totalKg, sideKg: r.loadedSideKg, current: p === i.pct }
  })

  return {
    lang: i.lang,
    unit: i.unit,
    side: i.side,
    olympic: i.olympic,
    liftName: i.liftName,
    pct: i.pct,
    prKg: i.prKg,
    targetKg,
    totalKg: res.totalKg,
    sideKg: res.loadedSideKg,
    barLabel: i.barLabel,
    barText: `${es ? 'Barra' : 'Bar'} ${i.barLabel.toLowerCase()}`,
    plates: res.perSide.map((p) => ({ value: p.value, unit: p.unit, custom: p.id.startsWith('c:') })),
    chips,
    sets,
    table,
    date: formatDate(i.date, i.lang),
    url: i.url,
  }
}

/** File name for a saved card, e.g. "tetsu-sentadilla-trasera-119kg.png". */
export function cardFileName(c: Pick<CardData, 'liftName' | 'totalKg'>): string {
  const slug = c.liftName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `tetsu-${slug || 'lift'}-${Math.round(c.totalKg)}kg.png`
}

/* ───────────────────────── colours ───────────────────────── */

export interface Colorway {
  /** null = transparent (photo overlay). */
  bg: string | null
  fg: string
  muted: string
  line: string
  bar: string
  accent: string
  /** Text that sits on the accent (logo mark, solid-colour card). */
  onAccent: string
  lightPlates: boolean
  /** Draw all plates in one ink instead of their own colours. */
  mono: boolean
}

export function colorway(s: Pick<CardStyle, 'template' | 'tone' | 'accent'>): Colorway {
  const pal = paletteOf(s.accent || '#FF5A1F')
  const light = s.tone === 'light'
  if (s.template === 'foto') {
    return { bg: null, fg: '#FFFFFF', muted: '#E8E4DB', line: 'rgba(255,255,255,.45)', bar: 'rgba(255,255,255,.6)', accent: pal.accent, onAccent: '#0B0B0C', lightPlates: false, mono: false }
  }
  if (s.template === 'compacta' && !light) {
    return { bg: pal.accent, fg: '#0B0B0C', muted: '#0B0B0C', line: '#0B0B0C', bar: '#0B0B0C', accent: '#0B0B0C', onAccent: pal.accent, lightPlates: false, mono: true }
  }
  if (light) {
    return { bg: '#F2EEE6', fg: '#141413', muted: '#5C574D', line: '#CFC8BA', bar: '#9C9689', accent: pal.accentLight, onAccent: '#F2EEE6', lightPlates: true, mono: false }
  }
  return { bg: '#0B0B0C', fg: '#F4F1EA', muted: '#A7A39A', line: '#2A2A2E', bar: '#3A3A40', accent: pal.accent, onAccent: '#0B0B0C', lightPlates: false, mono: false }
}

/* ───────────────────────── drawing ───────────────────────── */

type Ctx = CanvasRenderingContext2D
const FONT = '"Barlow Condensed", "Arial Narrow", sans-serif'
const W = 360
const PAD = 28
const URL_TEXT = 'rodrigore.github.io/tetsu'

interface TextOpts {
  size: number
  weight?: number
  color: string
  align?: 'left' | 'right' | 'center'
  /** Letter spacing in em. */
  ls?: number
}

const setFont = (ctx: Ctx, size: number, weight = 700) => {
  ctx.font = `${weight} ${size}px ${FONT}`
}

function measure(ctx: Ctx, s: string, size: number, weight = 700, ls = 0): number {
  setFont(ctx, size, weight)
  const w = ctx.measureText(s).width
  return ls ? w + ls * size * Math.max(s.length - 1, 0) : w
}

/** Draws text with its baseline at y. Returns the drawn width. */
function text(ctx: Ctx, s: string, x: number, y: number, o: TextOpts): number {
  const weight = o.weight ?? 700
  const ls = o.ls ?? 0
  const w = measure(ctx, s, o.size, weight, ls)
  const x0 = o.align === 'right' ? x - w : o.align === 'center' ? x - w / 2 : x
  setFont(ctx, o.size, weight)
  ctx.fillStyle = o.color
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  if (!ls) {
    ctx.fillText(s, x0, y)
  } else {
    let cx = x0
    for (const ch of s) {
      ctx.fillText(ch, cx, y)
      cx += ctx.measureText(ch).width + ls * o.size
    }
  }
  return w
}

/** Largest size (≤ size) at which the string fits in maxW. */
function fit(ctx: Ctx, s: string, maxW: number, size: number, weight = 700, ls = 0): number {
  let z = size
  while (z > 8 && measure(ctx, s, z, weight, ls) > maxW) z -= 2
  return z
}

interface Run {
  t: string
  size: number
  color: string
  weight?: number
  gap?: number
}
function runs(ctx: Ctx, parts: Run[], x: number, y: number, align: 'left' | 'right' = 'left'): void {
  const widths = parts.map((p) => measure(ctx, p.t, p.size, p.weight ?? 700) + (p.gap ?? 0))
  let cx = align === 'right' ? x - widths.reduce((a, b) => a + b, 0) : x
  parts.forEach((p, i) => {
    text(ctx, p.t, cx, y, { size: p.size, weight: p.weight ?? 700, color: p.color })
    cx += widths[i]!
  })
}

function rrect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number): void {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

const hline = (ctx: Ctx, y: number, color: string, x1 = PAD, x2 = W - PAD) => {
  ctx.fillStyle = color
  ctx.fillRect(x1, y, x2 - x1, 1)
}

const labels = (lang: Lang) =>
  lang === 'es'
    ? {
        side: 'POR LADO', of: 'DE', pr: 'RÉCORD PERSONAL', sets: 'SERIES', max: 'MÁXIMO', ofPr: 'DEL PR', bar: 'BARRA',
        mySets: 'MIS SERIES', myPct: 'MIS PORCENTAJES', session: 'CALENTAMIENTO + SERIE DE TRABAJO', empty: 'vacía',
      }
    : {
        side: 'PER SIDE', of: 'OF', pr: 'PERSONAL RECORD', sets: 'SETS', max: 'TOP', ofPr: 'OF PR', bar: 'BAR',
        mySets: 'MY SETS', myPct: 'MY PERCENTAGES', session: 'WARM-UP + WORKING SET', empty: 'empty',
      }

const num = (c: CardData, kg: number) => fmt(fromKg(kg, c.unit), c.lang)
const otherUnit = (u: Unit): Unit => (u === 'kg' ? 'lb' : 'kg')
const U = (u: Unit) => u.toUpperCase()

interface Env {
  ctx: Ctx
  c: CardData
  s: CardStyle
  k: Colorway
  H: number
}

function header(e: Env, y = 28): void {
  const { ctx, c, s, k } = e
  rrect(ctx, PAD, y, 22, 22, 5)
  ctx.fillStyle = k.accent
  ctx.fill()
  ctx.fillStyle = k.bg ?? k.onAccent
  if (s.template === 'foto') ctx.fillStyle = k.onAccent
  rrect(ctx, PAD + 8, y + 4, 6, 14, 1)
  ctx.fill()
  text(ctx, 'TETSU', PAD + 30, y + 17, { size: 18, color: k.fg, ls: 0.22 })
  if (s.date) text(ctx, c.date, W - PAD, y + 16, { size: 14, weight: 600, color: k.muted, align: 'right', ls: 0.12 })
}

function footer(e: Env, left: string | null = null): void {
  const { ctx, c, s, k, H } = e
  const y = H - PAD - 2
  text(ctx, left ?? c.barText, PAD, y, { size: 14, weight: 600, color: k.muted })
  if (s.link) text(ctx, c.url, W - PAD, y, { size: 14, weight: 600, color: k.muted, align: 'right' })
}

const sideRuns = (e: Env, big: number, small: number, color = e.k.fg): Run[] => {
  const { c, k } = e
  const units: Unit[] = c.side === 'both' ? [c.unit, otherUnit(c.unit)] : [c.side]
  const out: Run[] = []
  units.forEach((u, i) => {
    if (i) out.push({ t: '/', size: big * 0.68, color: k.muted, gap: 8 })
    out.push({ t: fmt(fromKg(c.sideKg, u), c.lang), size: big, color, gap: 5 })
    out.push({ t: U(u), size: small, color: k.accent, gap: i === 0 && units.length > 1 ? 8 : 0 })
  })
  return out
}

/** The bar with its plates, side view. Returns the width used. */
function plateStrip(e: Env, x: number, cy: number, scale: number, opts: { labels?: boolean; barFrom?: number; barTo?: number; barH?: number } = {}): void {
  const { ctx, c, s, k } = e
  const barH = opts.barH ?? Math.max(4, 10 * scale)
  ctx.fillStyle = k.bar
  ctx.fillRect(opts.barFrom ?? 0, cy - barH / 2, (opts.barTo ?? W) - (opts.barFrom ?? 0), barH)
  const gap = Math.max(1.5, 3 * scale)
  let cx = x
  const cw = Math.max(5, 12 * scale)
  rrect(ctx, cx, cy - 28 * scale, cw, 56 * scale, 2)
  ctx.fillStyle = k.mono ? k.fg : '#8A8578'
  ctx.fill()
  cx += cw + gap
  for (const p of c.plates) {
    const look = plateLook(p.value, p.unit, { accent: k.accent, olympic: c.olympic && !p.custom, light: k.lightPlates })
    const w = look.w * scale
    const h = look.h * scale
    rrect(ctx, cx, cy - h / 2, w, h, Math.min(look.radius * scale, 4))
    ctx.fillStyle = k.mono ? (p.unit === 'lb' ? k.fg : '#F4F1EA') : look.bg
    ctx.fill()
    if (opts.labels && w >= 17) {
      ctx.save()
      ctx.fillStyle = k.mono ? '#F4F1EA' : '#111111'
      setFont(ctx, look.fs, 700)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(fmtW(p.value, c.lang), cx + w / 2, cy)
      ctx.restore()
    }
    cx += w + gap
  }
  void s
}

function chipRow(e: Env, y: number): number {
  const { ctx, c, k } = e
  let cx = PAD
  let cy = y
  for (const ch of c.chips) {
    const a = `${ch.label} ${ch.unit}`
    const b = `×${ch.count}`
    const wa = measure(ctx, a, 14, 600, 0.04)
    const wb = measure(ctx, b, 14, 600, 0.04)
    const w = wa + wb + 4 + 20
    if (cx + w > W - PAD) {
      cx = PAD
      cy += 34
    }
    rrect(ctx, cx + 0.5, cy + 0.5, w - 1, 27, 14)
    ctx.strokeStyle = k.line
    ctx.lineWidth = 1
    ctx.stroke()
    text(ctx, a, cx + 10, cy + 19, { size: 14, weight: 600, color: k.fg, ls: 0.04 })
    text(ctx, b, cx + 10 + wa + 4, cy + 19, { size: 14, weight: 600, color: k.accent, ls: 0.04 })
    cx += w + 6
  }
  return cy + 28
}

function bigNumber(e: Env, s: string, x: number, baseline: number, size: number, maxW: number, color = e.k.fg): { w: number; size: number } {
  const z = fit(e.ctx, s, maxW, size)
  const w = text(e.ctx, s, x, baseline, { size: z, color })
  return { w, size: z }
}

/* ── templates ── */

function tSerie(e: Env): void {
  const { ctx, c, k } = e
  const L = labels(c.lang)
  const dy = e.s.plates ? 0 : 56
  header(e)
  text(ctx, c.liftName, PAD, 116 + dy, { size: 16, weight: 600, color: k.muted, ls: 0.14 })
  text(ctx, `${fmt(c.pct, c.lang)}% ${L.of} ${num(c, c.prKg)} ${U(c.unit)}`, PAD, 140 + dy, { size: 18, color: k.accent, ls: 0.1 })
  const total = num(c, c.totalKg)
  const n = bigNumber(e, total, PAD, 262 + dy, 156, 196)
  const kx = PAD + n.w + 14
  text(ctx, U(c.unit), kx, 232 + dy, { size: 42, color: k.accent })
  text(ctx, `${fmt(fromKg(c.totalKg, otherUnit(c.unit)), c.lang)} ${U(otherUnit(c.unit))}`, kx, 258 + dy, { size: 20, weight: 600, color: k.muted, ls: 0.04 })
  hline(ctx, 290 + dy, k.line)
  text(ctx, L.side, PAD, 316 + dy, { size: 14, weight: 600, color: k.muted, ls: 0.14 })
  runs(ctx, sideRuns(e, 44, 24), PAD, 360 + dy)
  if (e.s.plates) {
    plateStrip(e, 44, 448, 0.96, { labels: true })
    chipRow(e, 526)
  }
  footer(e)
}

function tSesion(e: Env): void {
  const { ctx, c, k } = e
  const L = labels(c.lang)
  header(e)
  const z = fit(ctx, c.liftName, 304, 36, 700, 0.02)
  text(ctx, c.liftName, PAD, 112, { size: z, color: k.fg, ls: 0.02 })
  text(ctx, L.session, PAD, 138, { size: 15, color: k.accent, ls: 0.08 })
  hline(ctx, 158, k.line)
  const cols: [string, string, string][] = [
    [L.sets, String(c.sets.length), ''],
    [L.max, num(c, c.totalKg), U(c.unit)],
    [L.ofPr, fmt(c.pct, c.lang), '%'],
  ]
  cols.forEach(([lab, val, unit], i) => {
    const x = PAD + i * 105.3
    text(ctx, lab, x, 182, { size: 13, weight: 600, color: k.muted, ls: 0.14 })
    runs(ctx, [{ t: val, size: 40, color: k.fg, gap: 3 }, { t: unit, size: 20, color: k.accent }], x, 222)
  })
  const sets = c.sets.slice(-7)
  const rh = Math.min(68, 350 / sets.length)
  const top = 244
  const max = Math.max(...sets.map((x) => x.kg), 1)
  sets.forEach((st, i) => {
    const y = top + i * rh
    const hi = st.work
    hline(ctx, y, k.line)
    text(ctx, st.label, PAD, y + rh / 2 + 5, { size: st.label.length > 5 ? 12 : 15, weight: 600, color: hi ? k.accent : k.muted, ls: 0.1 })
    runs(ctx, [{ t: num(c, st.kg), size: rh >= 50 ? 30 : 24, color: hi ? k.accent : k.fg, gap: 3 }, { t: U(c.unit), size: 15, color: hi ? k.accent : k.muted }], 102, y + rh / 2 + 4)
    const tw = 142
    ctx.fillStyle = k.line
    rrect(ctx, 102, y + rh - 14, tw, 6, 3)
    ctx.fill()
    ctx.fillStyle = hi ? k.accent : k.muted
    rrect(ctx, 102, y + rh - 14, Math.max(6, (tw * st.kg) / max), 6, 3)
    ctx.fill()
    const sideUnit = c.side === 'both' ? c.unit : c.side
    text(ctx, st.sideKg > 0 ? `${fmt(fromKg(st.sideKg, sideUnit), c.lang)} ${U(sideUnit)}` : '—', W - PAD, y + rh / 2 - 2, { size: 16, weight: 600, color: k.fg, align: 'right', ls: 0.04 })
    text(ctx, L.side, W - PAD, y + rh / 2 + 14, { size: 12, weight: 600, color: k.muted, align: 'right', ls: 0.1 })
  })
  hline(ctx, top + sets.length * rh, k.line)
  footer(e)
}

function tTabla(e: Env): void {
  const { ctx, c, k } = e
  const L = labels(c.lang)
  header(e)
  const head = `${L.pr} · ${c.liftName}`
  text(ctx, head, PAD, 98, { size: fit(ctx, head, 304, 15, 600, 0.06), weight: 600, color: k.muted, ls: 0.06 })
  const n = bigNumber(e, num(c, c.prKg), PAD, 204, 120, 190)
  text(ctx, U(c.unit), PAD + n.w + 12, 178, { size: 36, color: k.accent })
  text(ctx, `${fmt(fromKg(c.prKg, otherUnit(c.unit)), c.lang)} ${U(otherUnit(c.unit))}`, PAD + n.w + 12, 202, { size: 18, weight: 600, color: k.muted, ls: 0.04 })
  text(ctx, L.myPct, PAD, 254, { size: 22, color: k.fg, ls: 0.1 })
  const rows = c.table.slice(0, 8)
  const rh = Math.min(38, 272 / (rows.length + 0.75))
  const right = [PAD + 56 + 82.7, PAD + 56 + 165.3, W - PAD]
  const hy = 268
  ;['%', 'KG', 'LB', L.side].forEach((h, i) => {
    if (i === 0) text(ctx, h, PAD, hy + 18, { size: 12, weight: 600, color: k.muted, ls: 0.14 })
    else text(ctx, h, right[i - 1]!, hy + 18, { size: 12, weight: 600, color: k.muted, ls: 0.14, align: 'right' })
  })
  const sideUnit = c.side === 'both' ? c.unit : c.side
  rows.forEach((r, i) => {
    const y = hy + 26 + i * rh
    const col = r.current ? k.accent : k.fg
    hline(ctx, y, k.line)
    text(ctx, `${fmt(r.pct, c.lang)}%`, PAD, y + rh / 2 + 6, { size: 17, weight: 600, color: r.current ? k.accent : k.muted, ls: 0.08 })
    text(ctx, fmt(r.kg, c.lang), right[0]!, y + rh / 2 + 7, { size: 20, weight: 600, color: col, align: 'right', ls: 0.03 })
    text(ctx, fmt(fromKg(r.kg, 'lb'), c.lang), right[1]!, y + rh / 2 + 7, { size: 20, weight: 600, color: col, align: 'right', ls: 0.03 })
    text(ctx, fmt(fromKg(r.sideKg, sideUnit), c.lang), right[2]!, y + rh / 2 + 7, { size: 20, weight: 600, color: col, align: 'right', ls: 0.03 })
  })
  hline(ctx, hy + 26 + rows.length * rh, k.line)
  footer(e)
}

function tFoto(e: Env): void {
  const { ctx, c, s, k, H } = e
  const L = labels(c.lang)
  const g = ctx.createLinearGradient(0, H - 330, 0, H)
  g.addColorStop(0, 'rgba(0,0,0,0)')
  g.addColorStop(1, 'rgba(0,0,0,.7)')
  ctx.fillStyle = g
  ctx.fillRect(0, H - 330, W, 330)
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,.55)'
  ctx.shadowBlur = 8
  ctx.shadowOffsetY = 1
  header(e)
  text(ctx, c.liftName, PAD, 348, { size: 16, weight: 600, color: k.muted, ls: 0.14 })
  const n = bigNumber(e, num(c, c.totalKg), PAD, 436, 112, 200)
  text(ctx, U(c.unit), PAD + n.w + 10, 436, { size: 34, color: k.accent })
  if (s.plates) plateStrip(e, PAD, 494, 0.5, { barFrom: 0, barTo: W, barH: 5 })
  hline(ctx, 536, k.line)
  const sideUnit = c.side === 'both' ? c.unit : c.side
  const cols: [string, string, string][] = [
    [L.ofPr, fmt(c.pct, c.lang), '%'],
    [L.side, fmt(fromKg(c.sideKg, sideUnit), c.lang), U(sideUnit)],
    [L.bar, c.barLabel.split(' ')[0] ?? '', U(c.unit)],
  ]
  cols.forEach(([lab, val, unit], i) => {
    const x = PAD + i * 105.3
    text(ctx, lab, x, 562, { size: 13, weight: 600, color: k.muted, ls: 0.14 })
    runs(ctx, [{ t: val, size: 30, color: k.fg, gap: 3 }, { t: unit, size: 16, color: k.accent }], x, 596)
  })
  ctx.restore()
}

function tNumero(e: Env): void {
  const { ctx, c, k, H } = e
  text(ctx, c.liftName, PAD, 46, { size: 16, weight: 600, color: k.muted, ls: 0.2 })
  const total = num(c, c.totalKg)
  const z = fit(ctx, total, 304, 230)
  text(ctx, total, W / 2, 356, { size: z, color: k.fg, align: 'center' })
  text(ctx, U(c.unit), W / 2, 420, { size: 44, color: k.accent, align: 'center', ls: 0.08 })
  text(ctx, 'TETSU', PAD, H - PAD, { size: 15, color: k.fg, ls: 0.22 })
  if (e.s.date) text(ctx, c.date, W - PAD, H - PAD, { size: 15, weight: 600, color: k.muted, align: 'right', ls: 0.12 })
}

function tFrase(e: Env): void {
  const { ctx, c, k, H } = e
  const es = c.lang === 'es'
  text(ctx, 'TETSU', PAD, 52, { size: 16, color: k.fg, ls: 0.22 })
  const w = `${num(c, c.totalKg)} ${U(c.unit)}`
  const p = `${fmt(c.pct, c.lang)}%`
  const toks: { t: string; a: boolean }[] = es
    ? [{ t: 'Hoy levanté ', a: false }, { t: w, a: true }, { t: ' al ', a: false }, { t: p, a: true }, { t: ' de mi récord.', a: false }]
    : [{ t: 'Today I lifted ', a: false }, { t: w, a: true }, { t: ' at ', a: false }, { t: p, a: true }, { t: ' of my PR.', a: false }]
  const words: { t: string; a: boolean }[] = []
  for (const tk of toks) for (const part of tk.t.split(/(?<= )/)) if (part) words.push({ t: part, a: tk.a })
  let size = 74
  let lines: { t: string; a: boolean }[][] = []
  for (; size >= 40; size -= 4) {
    lines = [[]]
    let lw = 0
    for (const wd of words) {
      const ww = measure(ctx, wd.t, size)
      if (lw + measure(ctx, wd.t.trimEnd(), size) > 304 && lines[lines.length - 1]!.length) {
        lines.push([])
        lw = 0
      }
      lines[lines.length - 1]!.push(wd)
      lw += ww
    }
    if (lines.length * size * 0.95 <= 330) break
  }
  const lh = size * 0.95
  const block = 30 + lines.length * lh
  let y = (H - block) / 2 + 20
  text(ctx, c.liftName, PAD, y, { size: 16, weight: 600, color: k.muted, ls: 0.14 })
  y += 14
  for (const ln of lines) {
    y += lh
    runs(ctx, ln.map((wd) => ({ t: wd.t, size, color: wd.a ? k.accent : k.fg })), PAD, y - size * 0.18)
  }
  if (e.s.date) text(ctx, c.date, PAD, H - PAD - 2, { size: 14, weight: 600, color: k.muted, ls: 0.12 })
  text(ctx, `PR ${num(c, c.prKg)} ${U(c.unit)}`, W - PAD, H - PAD - 2, { size: 14, weight: 600, color: k.muted, align: 'right', ls: 0.12 })
}

function tPorcentaje(e: Env): void {
  const { ctx, c, k, H } = e
  const L = labels(c.lang)
  text(ctx, c.liftName, PAD, 46, { size: 16, weight: 600, color: k.muted, ls: 0.2 })
  const p = fmt(c.pct, c.lang)
  const n = bigNumber(e, p, PAD, 360, 210, 210)
  text(ctx, '%', PAD + n.w + 6, 360 - n.size * 0.7 + 66, { size: 96, color: k.accent })
  text(ctx, `${L.of} ${num(c, c.prKg)} ${U(c.unit)}`, PAD, 414, { size: 28, color: k.muted, ls: 0.1 })
  runs(ctx, [{ t: '= ', size: 28, color: k.fg }, { t: `${num(c, c.totalKg)} ${U(c.unit)}`, size: 28, color: k.accent }], PAD, 454)
  text(ctx, 'TETSU', PAD, H - PAD, { size: 15, color: k.fg, ls: 0.22 })
  if (e.s.date) text(ctx, c.date, W - PAD, H - PAD, { size: 15, weight: 600, color: k.muted, align: 'right', ls: 0.12 })
}

function tDiscos(e: Env): void {
  const { ctx, c, k, H } = e
  text(ctx, c.liftName, PAD, 46, { size: 16, weight: 600, color: k.muted, ls: 0.2 })
  const cx = W / 2
  ctx.fillStyle = k.bar
  ctx.fillRect(cx - 4, 80, 8, 470)
  let y = 150
  rrect(ctx, cx - 28, y, 56, 12, 2)
  ctx.fillStyle = k.mono ? k.fg : '#8A8578'
  ctx.fill()
  y += 12 + 5
  for (const p of c.plates) {
    const look = plateLook(p.value, p.unit, { accent: k.accent, olympic: c.olympic && !p.custom, light: k.lightPlates })
    const w = look.h * 1.8
    const h = look.w * 1.4
    rrect(ctx, cx - w / 2, y, w, h, 4)
    ctx.fillStyle = look.bg
    ctx.fill()
    y += h + 5
  }
  const total = num(c, c.totalKg)
  runs(ctx, [{ t: total, size: 64, color: k.fg, gap: 6 }, { t: U(c.unit), size: 28, color: k.accent }], PAD, H - PAD)
  text(ctx, 'TETSU', W - PAD, H - PAD, { size: 15, color: k.fg, align: 'right', ls: 0.22 })
}

function tSeries(e: Env): void {
  const { ctx, c, k, H } = e
  const L = labels(c.lang)
  text(ctx, c.liftName, PAD, 52, { size: 16, weight: 600, color: k.muted, ls: 0.2 })
  text(ctx, L.mySets, PAD, 94, { size: 40, color: k.fg, ls: 0.04 })
  const sets = c.sets.slice(-7)
  const rh = Math.min(78, 400 / sets.length)
  const top = (H - sets.length * rh) / 2 + 10
  sets.forEach((st, i) => {
    const y = top + i * rh
    const col = st.work ? k.accent : k.fg
    hline(ctx, y, k.line)
    text(ctx, st.label, PAD, y + rh / 2 + 7, { size: 20, weight: 600, color: st.work ? k.accent : k.muted, ls: 0.14 })
    runs(ctx, [{ t: num(c, st.kg), size: 56, color: col, gap: 6 }, { t: U(c.unit), size: 22, color: st.work ? k.accent : k.muted }], W - PAD, y + rh / 2 + 20, 'right')
  })
  hline(ctx, top + sets.length * rh, k.line)
  text(ctx, 'TETSU', PAD, H - PAD, { size: 15, color: k.fg, ls: 0.22 })
  if (e.s.date) text(ctx, c.date, W - PAD, H - PAD, { size: 15, weight: 600, color: k.muted, align: 'right', ls: 0.12 })
}

function tCompacta(e: Env): void {
  const { ctx, c, s, k } = e
  const L = labels(c.lang)
  const P = 24
  rrect(ctx, P, 24, 20, 20, 5)
  ctx.fillStyle = k.accent
  ctx.fill()
  ctx.fillStyle = k.onAccent
  rrect(ctx, P + 7, 28, 5, 12, 1)
  ctx.fill()
  text(ctx, 'TETSU', P + 28, 40, { size: 17, color: k.fg, ls: 0.22 })
  if (s.date) text(ctx, c.date, W - P, 39, { size: 14, color: k.muted, align: 'right', ls: 0.12 })
  const head = `${c.liftName} · ${fmt(c.pct, c.lang)}% ${L.of} ${num(c, c.prKg)} ${U(c.unit)}`
  text(ctx, head, P, 134, { size: fit(ctx, head, 312, 17, 700, 0.06), color: k.fg, ls: 0.06 })
  const n = bigNumber(e, num(c, c.totalKg), P, 232, 128, 200)
  text(ctx, U(c.unit), P + n.w + 12, 200, { size: 38, color: k.fg })
  text(ctx, `${fmt(fromKg(c.totalKg, otherUnit(c.unit)), c.lang)} ${U(otherUnit(c.unit))}`, P + n.w + 12, 226, { size: 18, color: k.fg, ls: 0.04 })
  const sideUnit = c.side === 'both' ? c.unit : c.side
  text(ctx, L.side, W - P, 296, { size: 13, color: k.fg, align: 'right', ls: 0.14 })
  runs(ctx, [{ t: fmt(fromKg(c.sideKg, sideUnit), c.lang), size: 30, color: k.fg, gap: 5 }, { t: U(sideUnit), size: 30, color: k.fg }], W - P, 326, 'right')
  if (s.plates) plateStrip(e, P, 312, 0.42, { barFrom: P, barTo: 170, barH: 4 })
}

function tLinea(e: Env): void {
  const { ctx, c, s, k, H } = e
  const L = labels(c.lang)
  text(ctx, 'TETSU', PAD, 46, { size: 16, color: k.fg, ls: 0.22 })
  ctx.beginPath()
  ctx.arc(W - PAD - 5, 40, 5, 0, Math.PI * 2)
  ctx.fillStyle = k.accent
  ctx.fill()
  text(ctx, c.liftName, PAD, 178, { size: 16, weight: 600, color: k.muted, ls: 0.14 })
  const n = bigNumber(e, num(c, c.totalKg), PAD, 262, 104, 220)
  text(ctx, U(c.unit), PAD + n.w + 10, 262, { size: 40, color: k.accent })
  hline(ctx, H - 52, k.line)
  text(ctx, `${fmt(c.pct, c.lang)}% ${L.of} ${num(c, c.prKg)} ${U(c.unit)}`, PAD, H - 26, { size: 14, weight: 600, color: k.muted, ls: 0.12 })
  if (s.date) text(ctx, c.date, W - PAD, H - 26, { size: 14, weight: 600, color: k.muted, align: 'right', ls: 0.12 })
}

const DRAW: Record<CardTemplate, (e: Env) => void> = {
  serie: tSerie, sesion: tSesion, tabla: tTabla, foto: tFoto, numero: tNumero, frase: tFrase,
  porcentaje: tPorcentaje, discos: tDiscos, series: tSeries, compacta: tCompacta, linea: tLinea,
}

/** Draws one card at `scale` device pixels per design pixel. Sizes the canvas. */
export function renderCard(canvas: HTMLCanvasElement, c: CardData, s: CardStyle, scale: number): void {
  const { w, h } = cardSize(formatOf(s.template))
  canvas.width = Math.round(w * scale)
  canvas.height = Math.round(h * scale)
  const ctx = canvas.getContext('2d')!
  ctx.setTransform(scale, 0, 0, scale, 0, 0)
  ctx.clearRect(0, 0, w, h)
  const k = colorway(s)
  if (k.bg) {
    ctx.fillStyle = k.bg
    ctx.fillRect(0, 0, w, h)
  }
  const style = { ...s, plates: s.plates }
  DRAW[s.template]({ ctx, c: { ...c, url: c.url || URL_TEXT }, s: style, k, H: h })
}

/** Makes sure the card font is ready before drawing, or the canvas falls back to a system font. */
export async function loadCardFonts(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return
  await Promise.all([600, 700].map((w) => document.fonts.load(`${w} 20px "Barlow Condensed"`)))
}

export function cardBlob(c: CardData, s: CardStyle, scale = 3): Promise<Blob> {
  const canvas = document.createElement('canvas')
  renderCard(canvas, c, s, scale)
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'),
  )
}
