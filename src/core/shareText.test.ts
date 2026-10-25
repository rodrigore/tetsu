import { describe, expect, it } from 'vitest'
import { shareText, type ShareInput } from './shareText'

const input: ShareInput = {
  lang: 'es',
  unit: 'kg',
  liftName: 'SENTADILLA TRASERA',
  pct: 85,
  prKg: 140,
  targetKg: 119,
  totalKg: 119.2,
  barLabel: '20 KG',
  plates: [
    { value: 45, unit: 'lb' },
    { value: 45, unit: 'lb' },
    { value: 2.5, unit: 'kg' },
  ],
  sideKg: 49.6,
}

describe('shareText', () => {
  it('summarises the load in Spanish', () => {
    expect(shareText(input)).toBe(
      'SENTADILLA TRASERA · 85 % de 140 KG = 119 KG\nBarra 20 KG · por lado: 2×45 lb + 2,5 kg (49,6 KG)\nEn la barra: 119,2 KG',
    )
  })

  it('uses English wording and dots', () => {
    const t = shareText({ ...input, lang: 'en' })
    expect(t).toContain('of 140 KG')
    expect(t).toContain('per side: 2×45 lb + 2.5 kg')
    expect(t).toContain('On the bar: 119.2 KG')
  })

  it('says so when there are no plates', () => {
    expect(shareText({ ...input, plates: [], sideKg: 0 })).toContain('sin discos')
  })

  it('converts to the PR unit', () => {
    const t = shareText({ ...input, unit: 'lb', prKg: 100, targetKg: 100, totalKg: 100, sideKg: 40 })
    expect(t).toContain('220,5 LB')
  })
})
