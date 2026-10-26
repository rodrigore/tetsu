/** Seconds left until `endsAt` (ms epoch), never negative, rounded up like a countdown. */
export const remainingSec = (endsAt: number, now: number): number => Math.max(0, Math.ceil((endsAt - now) / 1000))

export const MIN_REST = 5
/** 59:59, the most the minute and second wheels can show. */
export const MAX_REST = 3599
export const REST_STEP = 15

export const clampRest = (s: number): number => Math.min(MAX_REST, Math.max(MIN_REST, Math.round(s)))

/** 75 → "1:15". */
export function clock(sec: number): string {
  const s = Math.max(0, Math.round(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** Fraction of the ring still full, 0..1. */
export const ringFraction = (remaining: number, total: number): number =>
  total <= 0 ? 0 : Math.min(1, Math.max(0, remaining / total))

/** Splits seconds into whole minutes and the seconds left over. */
export const splitRest = (sec: number): { m: number; s: number } => ({ m: Math.floor(sec / 60), s: sec % 60 })
