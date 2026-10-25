/** The blocks of the main screen that can be moved or hidden. The "Ya cargué" button and the tabs are not here: they always show. */
export type BlockId = 'head' | 'pr' | 'hero' | 'bar' | 'chips' | 'stats' | 'pct'
export type LayoutId = 'simple' | 'complete' | 'onehand' | 'custom'
export type HeroSize = 'normal' | 'large' | 'huge'

export const BLOCKS: BlockId[] = ['head', 'pr', 'hero', 'bar', 'chips', 'stats', 'pct']
export const HERO_SCALE: Record<HeroSize, number> = { normal: 0.8, large: 1, huge: 1.25 }

export interface CustomLayout {
  order: BlockId[]
  hidden: BlockId[]
  size: HeroSize
}
export interface LayoutSetting {
  id: LayoutId
  custom: CustomLayout
}

export interface Resolved {
  order: BlockId[]
  hidden: BlockId[]
  size: HeroSize
}

const COMPLETE: BlockId[] = ['head', 'pr', 'hero', 'bar', 'chips', 'stats', 'pct']

export const PRESET_LAYOUTS: Record<Exclude<LayoutId, 'custom'>, Resolved> = {
  simple: { order: ['head', 'hero', 'bar', 'pct', 'pr', 'chips', 'stats'], hidden: ['pr', 'chips', 'stats'], size: 'large' },
  complete: { order: COMPLETE, hidden: [], size: 'large' },
  onehand: { order: ['hero', 'bar', 'chips', 'stats', 'pct', 'head', 'pr'], hidden: ['stats'], size: 'large' },
}

export const defaultCustom = (): CustomLayout => ({ order: [...COMPLETE], hidden: ['chips', 'stats'], size: 'large' })

/** A saved order may miss new blocks or repeat old ones; this always returns each block exactly once. */
export function cleanOrder(order: unknown): BlockId[] {
  const seen = new Set<BlockId>()
  const out: BlockId[] = []
  for (const b of Array.isArray(order) ? order : []) {
    if ((BLOCKS as string[]).includes(b) && !seen.has(b)) {
      seen.add(b)
      out.push(b)
    }
  }
  for (const b of COMPLETE) if (!seen.has(b)) out.push(b)
  return out
}

export function resolve(s: LayoutSetting): Resolved {
  if (s.id !== 'custom') return PRESET_LAYOUTS[s.id]
  const c = s.custom
  return { order: cleanOrder(c.order), hidden: c.hidden.filter((b) => BLOCKS.includes(b)), size: c.size in HERO_SCALE ? c.size : 'large' }
}

/** Where each visible block sits: a block's rank, and a flag for the ones to draw. */
export function placement(r: Resolved): Record<BlockId, { rank: number; show: boolean }> {
  const out = {} as Record<BlockId, { rank: number; show: boolean }>
  r.order.forEach((b, i) => (out[b] = { rank: i + 1, show: !r.hidden.includes(b) }))
  return out
}

/** Phones on their side use their own grid: the layout does not apply, the essentials always show. */
export function landscapePlacement(): Record<BlockId, { rank: number; show: boolean }> {
  return placement({ order: COMPLETE, hidden: ['stats'], size: 'large' })
}

export function move(order: BlockId[], id: BlockId, dir: -1 | 1): BlockId[] {
  const i = order.indexOf(id)
  const j = i + dir
  if (i < 0 || j < 0 || j >= order.length) return order
  const out = [...order]
  ;[out[i], out[j]] = [out[j]!, out[i]!]
  return out
}

export function toggle(hidden: BlockId[], id: BlockId): BlockId[] {
  return hidden.includes(id) ? hidden.filter((b) => b !== id) : [...hidden, id]
}

/** What an existing install looked like before layouts existed. */
export function fromLegacy(look: 'full' | 'minimal', oneHand: boolean): LayoutSetting {
  const base = oneHand ? PRESET_LAYOUTS.onehand : PRESET_LAYOUTS.complete
  const hidden: BlockId[] = look === 'full' ? [] : ['chips', 'stats']
  return { id: 'custom', custom: { order: [...base.order], hidden, size: 'large' } }
}
