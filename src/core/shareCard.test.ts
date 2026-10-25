import { describe, expect, it } from 'vitest'
import { allPlates, defaultPairs } from './catalog'
import {
  buildCardData, cardFileName, cardSize, colorway, defaultShare, formatDate, formatOf, renderCard, templatesFor,
  TEMPLATES, type BuildInput, type CardTemplate,
} from './shareCard'

const plates = allPlates([]).map((p) => ({ id: p.id, value: p.value, unit: p.unit, pairs: defaultPairs(p.id) }))
const input = (over: Partial<BuildInput> = {}): BuildInput => ({
  lang: 'es', unit: 'kg', side: 'both', olympic: true, liftName: 'SENTADILLA TRASERA', pct: 85, prKg: 140,
  barLabel: '20 KG', warm: [40, 60, 80], date: new Date(2026, 9, 25), url: 'rodrigore.github.io/tetsu',
  base: { barKg: 20, collarKg: 0, plates, mode: 'near' }, ...over,
})

describe('buildCardData', () => {
  it('derives target, loaded total and per-side load', () => {
    const c = buildCardData(input())
    expect(c.targetKg).toBeCloseTo(119, 5)
    expect(Math.abs(c.totalKg - 119)).toBeLessThan(1)
    expect(c.totalKg).toBeCloseTo(20 + 2 * c.sideKg, 1)
    expect(c.plates.length).toBeGreaterThan(0)
  })

  it('groups equal plates into chips', () => {
    const c = buildCardData(input())
    expect(c.chips.reduce((n, x) => n + x.count, 0)).toBe(c.plates.length)
  })

  it('lists the empty bar, the warm-up steps and the working set last', () => {
    const c = buildCardData(input())
    expect(c.sets[0]!.label).toBe('BARRA VACÍA')
    expect(c.sets[0]!.kg).toBe(20)
    expect(c.sets.at(-1)!.work).toBe(true)
    expect(c.sets.filter((s) => s.work)).toHaveLength(1)
    const kgs = c.sets.map((s) => s.kg)
    expect([...kgs].sort((a, b) => a - b)).toEqual(kgs)
  })

  it('builds the percentage table with the current percentage marked', () => {
    const c = buildCardData(input({ pct: 85 }))
    expect(c.table.map((r) => r.pct)).toEqual([60, 70, 80, 85, 90, 95, 100])
    expect(c.table.filter((r) => r.current).map((r) => r.pct)).toEqual([85])
    const c2 = buildCardData(input({ pct: 90 }))
    expect(c2.table.map((r) => r.pct)).toEqual([60, 70, 80, 90, 95, 100])
  })

  it('uses English labels', () => {
    const c = buildCardData(input({ lang: 'en' }))
    expect(c.sets[0]!.label).toBe('EMPTY BAR')
    expect(c.barText).toBe('Bar 20 kg')
  })
})

describe('helpers', () => {
  it('formats the date without dots', () => {
    expect(formatDate(new Date(2026, 9, 25), 'es')).toMatch(/^25 OCT\.? 2026$|^25 OCT 2026$/)
    expect(formatDate(new Date(2026, 9, 25), 'en')).toBe('25 OCT 2026')
  })

  it('names the file after the lift and the weight', () => {
    expect(cardFileName({ liftName: 'SENTADILLA TRASERA', totalKg: 119.2 })).toBe('tetsu-sentadilla-trasera-119kg.png')
    expect(cardFileName({ liftName: 'ARRANQUE (POWER)', totalKg: 60 })).toBe('tetsu-arranque-power-60kg.png')
    expect(cardFileName({ liftName: '***', totalKg: 60 })).toBe('tetsu-lift-60kg.png')
  })

  it('has story and square templates', () => {
    expect(templatesFor('story').length).toBeGreaterThanOrEqual(9)
    expect(templatesFor('square').map((t) => t.id)).toEqual(['compacta', 'linea'])
    expect(formatOf('compacta')).toBe('square')
    expect(cardSize('story')).toEqual({ w: 360, h: 640 })
    expect(cardSize('square')).toEqual({ w: 360, h: 360 })
  })

  it('keeps the photo template transparent and the compact one solid', () => {
    expect(colorway({ template: 'foto', tone: 'light', accent: '' }).bg).toBeNull()
    expect(colorway({ template: 'compacta', tone: 'dark', accent: '#4DA3FF' }).bg).toBe('#4DA3FF')
    expect(colorway({ template: 'serie', tone: 'light', accent: '#FF5A1F' }).accent).toBe('#D84300')
    expect(colorway({ template: 'serie', tone: 'dark', accent: '#FF5A1F' }).accent).toBe('#FF5A1F')
  })
})

/** A canvas stand-in that records what is drawn. */
function fakeCanvas() {
  const texts: string[] = []
  const noop = () => undefined
  const ctx = new Proxy({} as Record<string, unknown>, {
    get(t, k: string) {
      if (k === 'fillText') return (s: string) => texts.push(s)
      if (k === 'measureText') return (s: string) => ({ width: s.length * 8 })
      if (k === 'createLinearGradient') return () => ({ addColorStop: noop })
      return k in t ? t[k] : noop
    },
    set(t, k: string, v) {
      t[k] = v
      return true
    },
  })
  const canvas = { width: 0, height: 0, getContext: () => ctx } as unknown as HTMLCanvasElement
  return { canvas, texts }
}

describe('renderCard', () => {
  const c = buildCardData(input())

  it.each(TEMPLATES.map((t) => t.id))('draws the "%s" template', (template: CardTemplate) => {
    const { canvas, texts } = fakeCanvas()
    renderCard(canvas, c, { ...defaultShare(), template, accent: '#FF5A1F' }, 2)
    const { w, h } = cardSize(formatOf(template))
    expect({ w: canvas.width, h: canvas.height }).toEqual({ w: w * 2, h: h * 2 })
    expect(texts.join('')).toContain('119')
  })

  it('does not draw plates when they are switched off', () => {
    const on = fakeCanvas()
    const off = fakeCanvas()
    renderCard(on.canvas, c, { ...defaultShare(), accent: '#FF5A1F' }, 1)
    renderCard(off.canvas, c, { ...defaultShare(), accent: '#FF5A1F', plates: false }, 1)
    expect(on.texts.join('|')).toContain('45')
    expect(off.texts.length).toBeLessThan(on.texts.length)
  })

  it('hides the date and the link when asked', () => {
    const { canvas, texts } = fakeCanvas()
    renderCard(canvas, c, { ...defaultShare(), accent: '#FF5A1F', date: false, link: false }, 1)
    const all = texts.join('')
    expect(all).not.toContain('2026')
    expect(all).not.toContain('rodrigore')
  })
})
