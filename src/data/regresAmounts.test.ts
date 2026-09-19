import { describe, expect, it } from 'vitest'
import { getAvailableYears, getDefaultYear, getRegresForYear } from './regresAmounts'

describe('regresAmounts', () => {
  it('returns the statutory summer regres for a year', () => {
    expect(getRegresForYear('summer', 2026)).toBe(1481.88)
    expect(getRegresForYear('summer', 2015)).toBe(790.73)
    expect(getRegresForYear('summer', 2014)).toBeUndefined()
  })

  it('has the winter regres only from 2025 onward', () => {
    expect(getAvailableYears('winter').at(-1)).toBe(2025)
    expect(getRegresForYear('winter', 2024)).toBeUndefined()
  })

  it('keeps the winter regres at half of the minimum wage', () => {
    for (const year of getAvailableYears('winter')) {
      const summer = getRegresForYear('summer', year)
      expect(summer).toBeDefined()
      expect(getRegresForYear('winter', year)).toBeCloseTo(summer! / 2, 2)
    }
  })

  it('lists years newest first', () => {
    const years = getAvailableYears('summer')
    expect(years).toEqual([...years].sort((a, b) => b - a))
  })

  it('defaults to the current year when it has data, else the newest year', () => {
    expect(getDefaultYear('summer', new Date(2025, 5, 1))).toBe(2025)
    expect(getDefaultYear('winter', new Date(2020, 5, 1))).toBe(getAvailableYears('winter')[0])
  })
})
