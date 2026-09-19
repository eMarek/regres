import { describe, expect, it } from 'vitest'
import { calculateRegres, type Method, type RegresInput } from './calculateRegres'

const METHODS: Method[] = ['months-plus-days', 'full-months', 'calendar-days']

function input(overrides: Partial<RegresInput>): RegresInput {
  return {
    year: 2026,
    fullAmount: 1481.88,
    start: '2026-01-01',
    end: '2026-12-31',
    method: 'months-plus-days',
    ...overrides,
  }
}

function amount(overrides: Partial<RegresInput>): number {
  const outcome = calculateRegres(input(overrides))
  if (!outcome.ok) throw new Error(`Unexpected errors: ${outcome.errors.join(', ')}`)
  return outcome.result.amount
}

function errors(overrides: Partial<RegresInput>): string[] {
  const outcome = calculateRegres(input(overrides))
  return outcome.ok ? [] : outcome.errors
}

describe('calculateRegres', () => {
  it.each(METHODS)('pays the full amount for a whole year (%s)', (method) => {
    expect(amount({ method })).toBe(1481.88)
  })

  it('pays half for 1.1.–30.6. with the month-based methods', () => {
    expect(amount({ end: '2026-06-30', method: 'months-plus-days' })).toBe(740.94)
    expect(amount({ end: '2026-06-30', method: 'full-months' })).toBe(740.94)
  })

  it('handles a partial last month per method (1.1.–15.4.)', () => {
    expect(amount({ end: '2026-04-15', method: 'months-plus-days' })).toBe(432.22)
    expect(amount({ end: '2026-04-15', method: 'full-months' })).toBe(370.47)
    expect(amount({ end: '2026-04-15', method: 'calendar-days' })).toBe(426.29)
  })

  it('anchors months of employment to the start date', () => {
    const outcome = calculateRegres(input({ start: '2026-01-15', end: '2026-04-14' }))
    expect(outcome.ok && outcome.result.fullMonths).toBe(3)
    expect(outcome.ok && outcome.result.remainingDays).toBe(0)
    expect(outcome.ok && outcome.result.amount).toBe(370.47)
  })

  it('clamps a start on the 31st to shorter months without drifting', () => {
    const outcome = calculateRegres(input({ start: '2026-01-31', end: '2026-03-30' }))
    expect(outcome.ok && outcome.result.fullMonths).toBe(2)
    expect(outcome.ok && outcome.result.remainingDays).toBe(0)
  })

  it('reports the breakdown for a partial month', () => {
    const outcome = calculateRegres(input({ end: '2026-04-15' }))
    expect(outcome.ok && outcome.result).toMatchObject({
      fullMonths: 3,
      remainingDays: 15,
      daysInPartialMonth: 30,
      totalDays: 105,
      daysInYear: 365,
    })
  })

  it('uses 366 days in a leap year', () => {
    const outcome = calculateRegres(
      input({ year: 2024, fullAmount: 1253.9, start: '2024-01-01', end: '2024-02-29', method: 'calendar-days' }),
    )
    expect(outcome.ok && outcome.result.daysInYear).toBe(366)
    expect(outcome.ok && outcome.result.totalDays).toBe(60)
    expect(outcome.ok && outcome.result.amount).toBe(205.56)
  })

  it('handles a single day of employment', () => {
    expect(amount({ start: '2026-03-10', end: '2026-03-10', method: 'months-plus-days' })).toBe(3.98)
    expect(amount({ start: '2026-03-10', end: '2026-03-10', method: 'full-months' })).toBe(0)
    expect(amount({ start: '2026-03-10', end: '2026-03-10', method: 'calendar-days' })).toBe(4.06)
  })

  it('employee joining mid-year and staying to year end', () => {
    expect(amount({ start: '2026-07-01', method: 'full-months' })).toBe(740.94)
  })

  it('rejects invalid input', () => {
    expect(errors({ end: '' })).toEqual(['end-missing'])
    expect(errors({ start: '' })).toEqual(['start-missing'])
    expect(errors({ start: '2026-05-01', end: '2026-04-30' })).toEqual(['end-before-start'])
    expect(errors({ start: '2025-12-31' })).toEqual(['start-outside-year'])
    expect(errors({ end: '2027-01-01' })).toEqual(['end-outside-year'])
    expect(errors({ end: '2026-02-30' })).toEqual(['end-missing'])
    expect(errors({ fullAmount: 0 })).toEqual(['amount-invalid'])
    expect(errors({ fullAmount: Number.NaN })).toEqual(['amount-invalid'])
  })
})
