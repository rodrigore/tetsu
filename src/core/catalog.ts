import type { Unit } from './units'

export interface CatalogPlate {
  value: number
  unit: Unit
}

export const plateId = (p: CatalogPlate): string => `${p.value}${p.unit}`

export const CATALOG: CatalogPlate[] = [
  ...[45, 35, 30, 25, 20, 15, 10].map((value) => ({ value, unit: 'lb' as const })),
  ...[25, 20, 15, 10, 5, 2.5, 2, 1.5, 1, 0.5, 0.25].map((value) => ({ value, unit: 'kg' as const })),
]

/** Pairs owned by default: the sample gym (one pair per side). Everything else starts at 0 or 2. */
const DEFAULT_PAIRS: Record<string, number> = { '45lb': 4 }
const DEFAULT_ZERO = new Set(['30lb', '20lb', '25kg', '20kg', '15kg', '10kg', '5kg', '1.5kg', '1kg', '0.5kg', '0.25kg'])

export const defaultPairs = (id: string): number =>
  DEFAULT_PAIRS[id] ?? (DEFAULT_ZERO.has(id) ? 0 : 2)

export interface InventoryPlate extends CatalogPlate {
  id: string
  custom: boolean
}

/** Standard plates first, then the ones the user added (ids start with "c:"). Heaviest first. */
export function allPlates(custom: CatalogPlate[]): InventoryPlate[] {
  const std = CATALOG.map((p) => ({ ...p, id: plateId(p), custom: false }))
  const own = custom.map((p) => ({ ...p, id: `c:${plateId(p)}`, custom: true }))
  return [...std, ...own]
}
