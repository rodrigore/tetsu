export interface PlateChange {
  id: string
  count: number
}

const tally = (ids: string[]) => {
  const m = new Map<string, number>()
  for (const id of ids) m.set(id, (m.get(id) ?? 0) + 1)
  return m
}

/**
 * What to take off and put on, per side, to go from one set of plates to another.
 * Plates that stay are left alone, so a small step reads as a small change.
 */
export function diffPlates(from: string[], to: string[]): { remove: PlateChange[]; add: PlateChange[] } {
  const a = tally(from)
  const b = tally(to)
  const remove: PlateChange[] = []
  const add: PlateChange[] = []
  for (const id of new Set([...a.keys(), ...b.keys()])) {
    const d = (b.get(id) ?? 0) - (a.get(id) ?? 0)
    if (d < 0) remove.push({ id, count: -d })
    else if (d > 0) add.push({ id, count: d })
  }
  return { remove, add }
}
