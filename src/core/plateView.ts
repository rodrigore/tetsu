import { toKg, type Unit } from './units'

export interface PlateLook {
  w: number
  h: number
  radius: number
  fs: number
  bg: string
}

const OLYMPIC: Record<string, string> = {
  '25': '#FF4B4B', '20': '#4A90FF', '15': '#F2C230', '10': '#3DDC70', '5': '#EFEBE3',
  '2.5': '#FF4B4B', '2': '#4A90FF', '1.5': '#F2C230', '1': '#3DDC70', '0.5': '#EFEBE3', '0.25': '#FF4B4B',
}

/** Visual size grows with weight; lb plates are warm grey, kg plates take the accent or IWF colours. */
export function plateLook(
  value: number,
  unit: Unit,
  opts: { accent: string; olympic: boolean; light: boolean },
): PlateLook {
  const kg = toKg(value, unit)
  const ratio = Math.min(kg, 30) / 25
  const h = Math.round(34 + 116 * Math.pow(ratio, 0.55))
  const w = Math.round(10 + 14 * Math.pow(ratio, 0.4))
  const k = Math.min(kg / 20.41, 1)
  const lightness = Math.round(opts.light ? 30 + 34 * k : 52 + 40 * k)
  const bg =
    unit === 'lb'
      ? `hsl(40, 12%, ${lightness}%)`
      : opts.olympic && OLYMPIC[String(value)]
        ? OLYMPIC[String(value)]!
        : opts.accent
  return { w, h, radius: unit === 'lb' ? 3 : 6, fs: h >= 100 ? 13 : h >= 70 ? 12 : 10, bg }
}
