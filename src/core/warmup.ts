import { solve, type SolveInput, type SolveResult } from './solver'

export interface WarmupStep {
  /** null = the empty bar. */
  pct: number | null
  targetKg: number
  result: SolveResult
}

/**
 * Warm-up ladder towards a working weight: the empty bar, then each percentage of it.
 * Percentages are sorted and invalid ones dropped.
 */
export function warmupSteps(
  workKg: number,
  percents: number[],
  base: Omit<SolveInput, 'targetKg'>,
): WarmupStep[] {
  const pcts = [...new Set(percents.filter((p) => Number.isFinite(p) && p > 0 && p < 100))].sort((a, b) => a - b)
  const barOnly = base.barKg + 2 * (base.collarKg ?? 0)
  const steps: WarmupStep[] = [{ pct: null, targetKg: barOnly, result: solve({ ...base, targetKg: barOnly }) }]
  for (const pct of pcts) {
    const targetKg = (workKg * pct) / 100
    // Skip steps lighter than the bar: they would repeat the empty bar.
    if (targetKg <= barOnly + 0.05) continue
    steps.push({ pct, targetKg, result: solve({ ...base, targetKg }) })
  }
  return steps
}
