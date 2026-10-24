import { computed } from 'vue'
import { useApp } from '../stores/app'
import { allPlates, defaultPairs } from './catalog'
import { fmt } from './format'
import { messages } from './i18n'
import { paletteOf } from './palette'
import { plateLook } from './plateView'
import { solve, type PlateDef } from './solver'
import { fromKg, toKg } from './units'

export interface UsedPlate {
  def: PlateDef
  value: number
  unit: 'kg' | 'lb'
  label: string
}

/** Everything the main screen shows, derived from the store. */
export function useLoad(isLight: () => boolean) {
  const app = useApp()

  const plates = computed<PlateDef[]>(() => allPlates(app.s.customPlates).map((p) => ({
    id: p.id,
    value: p.value,
    unit: p.unit,
    pairs: app.s.inventory[p.id] ?? defaultPairs(p.id),
  })))

  const targetKg = computed(() => (app.lift.kg * app.s.pct) / 100)
  const barKg = computed(() => toKg(app.bar.value, app.bar.unit))

  const result = computed(() =>
    solve({
      targetKg: targetKg.value,
      barKg: barKg.value,
      collarKg: app.s.collarKg,
      plates: plates.value,
      mode: app.s.round,
    }),
  )

  const t = computed(() => messages(app.s.lang))
  const f = (v: number) => fmt(v, app.s.lang)
  const U = computed(() => app.s.unit.toUpperCase())

  const used = computed<UsedPlate[]>(() =>
    result.value.perSide.map((p) => ({
      def: p,
      value: p.value,
      unit: p.unit,
      label: fmt(p.value, app.s.lang),
    })),
  )

  const looks = computed(() =>
    used.value.map((p) =>
      plateLook(p.value, p.unit, { accent: paletteOf(app.s.accent)[isLight() ? 'accentLight' : 'accent'], olympic: app.s.olympic && !p.def.id.startsWith('c:'), light: isLight() }),
    ),
  )

  const chips = computed(() => {
    const groups: { id: string; label: string; unit: string; count: number }[] = []
    for (const p of used.value) {
      const g = groups.find((x) => x.id === p.def.id)
      if (g) g.count++
      else groups.push({ id: p.def.id, label: p.label, unit: p.unit.toUpperCase(), count: 1 })
    }
    return groups
  })

  const sideUnit = computed(() => (app.s.side === 'both' ? app.s.unit : app.s.side))
  const otherUnit = computed(() => (sideUnit.value === 'kg' ? 'lb' : 'kg'))

  const diff = computed(() => fromKg(result.value.diffKg, app.s.unit))
  const exact = computed(() => Math.abs(diff.value) < 0.05)
  const diffText = computed(() =>
    exact.value ? t.value.exact : `${diff.value > 0 ? '+' : '−'}${f(Math.abs(diff.value))}`,
  )

  const hero = computed(() => {
    const kind = app.s.hero
    const side = kind === 'side'
    const text = side
      ? f(fromKg(result.value.loadedSideKg, sideUnit.value))
      : f(fromKg(kind === 'target' ? targetKg.value : result.value.totalKg, app.s.unit))
    const unit = (side ? sideUnit.value : app.s.unit).toUpperCase()
    const other = side && app.s.side === 'both' ? f(fromKg(result.value.loadedSideKg, otherUnit.value)) : ''
    const label = side ? t.value.loadPerSide : kind === 'target' ? t.value.target : t.value.onBar
    const diffLine =
      exact.value || !app.s.showDiff ? '' : `${t.value.offBy} ${diffText.value} ${U.value}`
    const targetLine = `${t.value.target} ${f(fromKg(targetKg.value, app.s.unit))} ${U.value}`
    const minLine =
      kind === 'target' ? diffLine : targetLine + (diffLine ? ` · ${diffLine}` : '')
    return { side, text, unit, other, otherUnit: otherUnit.value.toUpperCase(), label, minLine }
  })

  return { t, f, U, result, used, looks, chips, hero, targetKg, diffText, exact }
}
