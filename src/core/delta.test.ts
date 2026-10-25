import { describe, expect, it } from 'vitest'
import { diffPlates } from './delta'

describe('diffPlates', () => {
  it('returns nothing when the sets are equal, in any order', () => {
    expect(diffPlates(['45lb', '10lb'], ['10lb', '45lb'])).toEqual({ remove: [], add: [] })
  })

  it('leaves untouched plates alone', () => {
    const d = diffPlates(['45lb', '45lb', '2.5kg'], ['45lb', '45lb', '35lb'])
    expect(d.remove).toEqual([{ id: '2.5kg', count: 1 }])
    expect(d.add).toEqual([{ id: '35lb', count: 1 }])
  })

  it('counts repeated plates', () => {
    const d = diffPlates(['45lb'], ['45lb', '45lb', '45lb'])
    expect(d.add).toEqual([{ id: '45lb', count: 2 }])
    expect(d.remove).toEqual([])
  })

  it('handles an empty bar on either side', () => {
    expect(diffPlates([], ['10lb']).add).toEqual([{ id: '10lb', count: 1 }])
    expect(diffPlates(['10lb'], []).remove).toEqual([{ id: '10lb', count: 1 }])
  })
})
