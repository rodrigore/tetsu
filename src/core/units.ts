export type Unit = 'kg' | 'lb'

export const KG_PER_LB = 0.45359237

export const toKg = (value: number, unit: Unit): number =>
  unit === 'kg' ? value : value * KG_PER_LB

export const fromKg = (kg: number, unit: Unit): number =>
  unit === 'kg' ? kg : kg / KG_PER_LB

/** Parses user input, accepting both "62.5" and "62,5". Returns null if invalid. */
export const parseNumber = (raw: string): number | null => {
  const n = Number(raw.trim().replace(',', '.'))
  return raw.trim() !== '' && Number.isFinite(n) && n >= 0 ? n : null
}
