import { describe, expect, it } from 'vitest'
import { BLOCKS, cleanOrder, fromLegacy, landscapePlacement, move, placement, resolve, toggle } from './layout'

describe('layout', () => {
  it('cleanOrder returns every block once, dropping unknown and repeated ones', () => {
    const out = cleanOrder(['hero', 'nope', 'hero', 'bar'])
    expect([...out].sort()).toEqual([...BLOCKS].sort())
    expect(out.slice(0, 2)).toEqual(['hero', 'bar'])
  })

  it('moves a block up or down and stops at the ends', () => {
    expect(move(['head', 'pr', 'hero'] as never, 'pr', -1)).toEqual(['pr', 'head', 'hero'])
    expect(move(['head', 'pr'] as never, 'head', -1)).toEqual(['head', 'pr'])
    expect(move(['head', 'pr'] as never, 'pr', 1)).toEqual(['head', 'pr'])
  })

  it('toggles visibility', () => {
    expect(toggle([], 'pr')).toEqual(['pr'])
    expect(toggle(['pr'], 'pr')).toEqual([])
  })

  it('simple shows only the essentials; complete shows everything', () => {
    const s = placement(resolve({ id: 'simple', custom: { order: [], hidden: [], size: 'large' } }))
    expect(s.hero.show && s.bar.show && s.pct.show && s.head.show).toBe(true)
    expect(s.pr.show || s.chips.show || s.stats.show).toBe(false)
    const c = placement(resolve({ id: 'complete', custom: { order: [], hidden: [], size: 'large' } }))
    expect(BLOCKS.every((b) => c[b].show)).toBe(true)
  })

  it('one-hand puts the result first and the selectors last', () => {
    const p = placement(resolve({ id: 'onehand', custom: { order: [], hidden: [], size: 'large' } }))
    expect(p.hero.rank).toBe(1)
    expect(p.head.rank).toBeGreaterThan(p.pct.rank)
  })

  it('keeps the old look for existing installs', () => {
    const min = resolve(fromLegacy('minimal', false))
    expect(min.hidden).toEqual(['chips', 'stats'])
    const hand = resolve(fromLegacy('full', true))
    expect(hand.hidden).toEqual([])
    expect(hand.order[0]).toBe('hero')
  })

  it('ignores the layout on a phone on its side', () => {
    const p = landscapePlacement()
    expect(p.hero.show && p.bar.show && p.pct.show && p.head.show && p.pr.show).toBe(true)
    expect(p.stats.show).toBe(false)
  })
})
