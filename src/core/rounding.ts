import { solve, type RoundMode, type SolveInput, type SolveResult } from './solver'

export interface RoundOption {
  mode: RoundMode
  result: SolveResult
}

/**
 * The loads you could pick when the plates do not reach the target exactly:
 * the closest one, the one just under and the one just over. Options that land on the
 * same weight are merged (the closest wins the name). Empty when the target is exact,
 * lighter than the bar or beyond the plates.
 */
export function roundOptions(input: Omit<SolveInput, 'mode'>): RoundOption[] {
  const run = (mode: RoundMode) => ({ mode, result: solve({ ...input, mode }) })
  const near = run('near')
  if (near.result.unreachable || near.result.belowBar || Math.abs(near.result.diffKg) < 0.05) return []
  const out: RoundOption[] = []
  for (const o of [run('down'), near, run('up')]) {
    if (o.result.unreachable) continue
    const dup = out.findIndex((x) => Math.abs(x.result.totalKg - o.result.totalKg) < 0.001)
    if (dup < 0) out.push(o)
    else if (o.mode === 'near') out[dup] = o
  }
  return out.length > 1 ? out : []
}
