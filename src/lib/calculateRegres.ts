export type Method = 'months-plus-days' | 'full-months' | 'calendar-days'

export interface RegresInput {
  year: number
  /** Regres for the full year, in EUR. */
  fullAmount: number
  /** First day of employment, ISO `YYYY-MM-DD`. */
  start: string
  /** Last day of employment (inclusive), ISO `YYYY-MM-DD`. */
  end: string
  method: Method
}

export interface RegresResult {
  amount: number
  fraction: number
  fullMonths: number
  remainingDays: number
  daysInPartialMonth: number
  totalDays: number
  daysInYear: number
}

export type ValidationError =
  | 'amount-invalid'
  | 'start-missing'
  | 'end-missing'
  | 'start-outside-year'
  | 'end-outside-year'
  | 'end-before-start'

export type RegresOutcome =
  | { ok: true; result: RegresResult }
  | { ok: false; errors: ValidationError[] }

const MS_PER_DAY = 86_400_000

// All date math runs on UTC midnights so DST changes can never shift a day.
function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const date = new Date(Date.UTC(year, month - 1, day))
  // Reject overflowing dates such as 2026-02-30.
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null
  }
  return date
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY)
}

function diffDays(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY)
}

// Always computed from the original start so a start on the 31st clamps to the
// last day of shorter months without drifting (31.1. → 28.2. → 31.3.).
function addMonths(start: Date, months: number): Date {
  const year = start.getUTCFullYear()
  const month = start.getUTCMonth() + months
  const lastDayOfTarget = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  return new Date(Date.UTC(year, month, Math.min(start.getUTCDate(), lastDayOfTarget)))
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function roundToCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function calculateRegres(input: RegresInput): RegresOutcome {
  const errors: ValidationError[] = []
  const start = parseISODate(input.start)
  const end = parseISODate(input.end)

  if (!Number.isFinite(input.fullAmount) || input.fullAmount <= 0) errors.push('amount-invalid')
  if (!start) errors.push('start-missing')
  if (!end) errors.push('end-missing')
  if (start && start.getUTCFullYear() !== input.year) errors.push('start-outside-year')
  if (end && end.getUTCFullYear() !== input.year) errors.push('end-outside-year')
  if (start && end && end < start) errors.push('end-before-start')
  if (errors.length > 0 || !start || !end) return { ok: false, errors }

  // A month of employment runs from the start date, not from the 1st of a
  // calendar month: 15.1.–14.2. is one full month.
  const dayAfterEnd = addDays(end, 1)
  let fullMonths = 0
  while (addMonths(start, fullMonths + 1) <= dayAfterEnd) fullMonths++

  const partialMonthStart = addMonths(start, fullMonths)
  const remainingDays = diffDays(partialMonthStart, dayAfterEnd)
  const daysInPartialMonth = diffDays(partialMonthStart, addMonths(start, fullMonths + 1))
  const totalDays = diffDays(start, dayAfterEnd)
  const daysInYear = isLeapYear(input.year) ? 366 : 365

  let fraction: number
  switch (input.method) {
    case 'months-plus-days':
      fraction = (fullMonths + remainingDays / daysInPartialMonth) / 12
      break
    case 'full-months':
      fraction = fullMonths / 12
      break
    case 'calendar-days':
      fraction = totalDays / daysInYear
      break
  }
  fraction = Math.min(fraction, 1)

  return {
    ok: true,
    result: {
      amount: roundToCents(input.fullAmount * fraction),
      fraction,
      fullMonths,
      remainingDays,
      daysInPartialMonth,
      totalDays,
      daysInYear,
    },
  }
}
