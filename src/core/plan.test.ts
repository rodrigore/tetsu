import { describe, expect, it } from 'vitest'
import { allPlates, defaultPairs } from './catalog'
import { activeTemplate, clampPct, clampReps, nextSet, PLAN_TEMPLATES, planSteps } from './plan'

const plates = allPlates([]).map((p) => ({ id: p.id, value: p.value, unit: p.unit, pairs: defaultPairs(p.id) }))
const base = { barKg: 20, collarKg: 0, plates, mode: 'near' as const }

describe('plan', () => {
  it('has the four templates, the ramp matching the design', () => {
    expect(PLAN_TEMPLATES.map((t) => t.id)).toEqual(['ramp', '531', '5x5', 'empty'])
    expect(PLAN_TEMPLATES[0]!.sets).toEqual([{ pct: 60, reps: 5 }, { pct: 70, reps: 3 }, { pct: 80, reps: 2 }, { pct: 85, reps: 1 }])
    expect(PLAN_TEMPLATES[2]!.sets).toHaveLength(5)
  })
  it('lights a template only while the sets are untouched', () => {
    expect(activeTemplate(PLAN_TEMPLATES[0]!.sets)).toBe('ramp')
    expect(activeTemplate([...PLAN_TEMPLATES[0]!.sets, { pct: 90, reps: 1 }])).toBeNull()
    expect(activeTemplate([])).toBe('empty')
  })
  it('clamps percentage and reps', () => {
    expect(clampPct(5)).toBe(10)
    expect(clampPct(250)).toBe(110)
    expect(clampPct(72.46)).toBe(72.5)
    expect(clampReps(0)).toBe(1)
    expect(clampReps(99)).toBe(30)
    expect(clampReps(4.6)).toBe(5)
  })
  it('adds a set like the last one, or a light first set', () => {
    expect(nextSet([{ pct: 80, reps: 2 }])).toEqual({ pct: 80, reps: 2 })
    expect(nextSet([])).toEqual({ pct: 60, reps: 5 })
  })
  it('loads each set close to its percentage of the PR', () => {
    const steps = planSteps(140, PLAN_TEMPLATES[0]!.sets, base)
    expect(steps.map((s) => s.targetKg)).toEqual([84, 98, 112, 119])
    for (const s of steps) {
      expect(Math.abs(s.result.totalKg - s.targetKg)).toBeLessThan(2)
      expect(s.result.totalKg).toBeCloseTo(20 + 2 * s.result.loadedSideKg, 5)
    }
  })
  it('an empty plan has no steps', () => {
    expect(planSteps(140, [], base)).toEqual([])
  })
})
