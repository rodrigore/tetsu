export type Formula = 'epley' | 'brzycki'

export const MAX_REPS = 30

/** Reps are whole numbers from 1 to 30; anything else is not a usable set. */
export const validReps = (r: number): boolean => Number.isInteger(r) && r >= 1 && r <= MAX_REPS

/**
 * Estimated one-rep max from a set of `reps` at `weightKg`.
 * Epley: w·(1 + r/30). Brzycki: w·36/(37 − r). One rep is the weight itself.
 * Returns null for input that cannot be estimated.
 */
export function estimate1RM(weightKg: number, reps: number, formula: Formula): number | null {
  if (!Number.isFinite(weightKg) || weightKg <= 0 || !validReps(reps)) return null
  if (reps === 1) return weightKg
  return formula === 'epley' ? weightKg * (1 + reps / 30) : (weightKg * 36) / (37 - reps)
}

/** Rounds to one decimal in kg, the precision the app shows. */
export const roundPr = (kg: number): number => Math.round(kg * 10) / 10
