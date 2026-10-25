import { toKg } from './units'
import type { PlateDef } from './solver'

/**
 * Loading the bar by hand: every tap puts one plate on each side. `stack` holds the plate
 * ids in the order they were added; a plate can be added up to the pairs you own.
 */
export function addPlate(stack: string[], def: PlateDef): string[] {
  const n = stack.filter((id) => id === def.id).length
  return n >= def.pairs ? stack : [...stack, def.id]
}

export const removeLast = (stack: string[]): string[] => stack.slice(0, -1)

export const countOf = (stack: string[], id: string): number => stack.filter((x) => x === id).length

/** Total on the bar for the stack, with collars. */
export function manualTotalKg(stack: string[], defs: PlateDef[], barKg: number, collarKg = 0): number {
  const side = stack.reduce((a, id) => {
    const d = defs.find((x) => x.id === id)
    return a + (d ? toKg(d.value, d.unit) : 0)
  }, 0)
  return barKg + 2 * collarKg + 2 * side
}
