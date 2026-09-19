import { describe, expect, it } from 'vitest'
import { formatDateInput, parseDateInput } from './dateInput'

describe('formatDateInput', () => {
  it('formats an ISO date as dd. mm. yyyy', () => {
    expect(formatDateInput('2026-01-01')).toBe('01. 01. 2026')
    expect(formatDateInput('2026-12-31')).toBe('31. 12. 2026')
  })

  it('returns an empty string for an empty or malformed value', () => {
    expect(formatDateInput('')).toBe('')
    expect(formatDateInput('15. 4. 2026')).toBe('')
  })
})

describe('parseDateInput', () => {
  it.each([
    ['15. 04. 2026', '2026-04-15'],
    ['15. 4. 2026', '2026-04-15'],
    ['15.4.2026', '2026-04-15'],
    ['15.04.2026.', '2026-04-15'],
    ['  1. 1. 2026  ', '2026-01-01'],
    ['15/4/2026', '2026-04-15'],
    ['15-04-2026', '2026-04-15'],
    ['15042026', '2026-04-15'],
    ['29. 2. 2024', '2024-02-29'],
  ])('parses %j', (text, iso) => {
    expect(parseDateInput(text)).toBe(iso)
  })

  it.each(['', '15', '15. 4.', '15. 4. 26', '31. 4. 2026', '29. 2. 2026', '0. 1. 2026', '1. 13. 2026', 'abc', '2026-04-15'])(
    'rejects %j',
    (text) => {
      expect(parseDateInput(text)).toBeNull()
    },
  )

  it('round-trips with formatDateInput', () => {
    expect(parseDateInput(formatDateInput('2026-04-15'))).toBe('2026-04-15')
  })
})
