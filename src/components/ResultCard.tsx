import { useEffect, useState } from 'react'
import type { RegresType } from '../data/regresAmounts'
import type { Method, RegresResult } from '../lib/calculateRegres'
import { formatDate, formatEUR, formatNumber, plural } from '../lib/format'

interface Props {
  type: RegresType
  result: RegresResult | null
  fullAmount: number
  start: string
  end: string
  method: Method
}

const TITLES: Record<RegresType, string> = {
  summer: 'Sorazmerni del letnega regresa',
  winter: 'Sorazmerni del zimskega regresa',
}

function monthsText(count: number): string {
  const noun = plural(count, {
    one: 'polni mesec',
    two: 'polna meseca',
    few: 'polni meseci',
    other: 'polnih mesecev',
  })
  return `${count} ${noun}`
}

function daysText(count: number): string {
  return `${count} ${plural(count, { one: 'dan', two: 'dneva', few: 'dni', other: 'dni' })}`
}

function breakdown(result: RegresResult, method: Method): { period: string; share: string } {
  switch (method) {
    case 'months-plus-days': {
      const months = result.fullMonths + result.remainingDays / result.daysInPartialMonth
      const period =
        result.remainingDays > 0
          ? `${monthsText(result.fullMonths)} + ${result.remainingDays}/${result.daysInPartialMonth} dni`
          : monthsText(result.fullMonths)
      return { period, share: `${formatNumber(months)}/12` }
    }
    case 'full-months': {
      const ignored = result.remainingDays > 0 ? ` (${daysText(result.remainingDays)} se ne šteje)` : ''
      return { period: `${monthsText(result.fullMonths)}${ignored}`, share: `${result.fullMonths}/12` }
    }
    case 'calendar-days':
      return { period: daysText(result.totalDays), share: `${result.totalDays}/${result.daysInYear}` }
  }
}

// Screen readers get the result from a live region. It is debounced so typing
// an amount doesn't trigger an announcement on every keystroke.
function useDebounced(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])
  return debounced
}

export function ResultCard({ type, result, fullAmount, start, end, method }: Props) {
  const title = TITLES[type]
  const details = result ? breakdown(result, method) : null
  const announcement = useDebounced(
    result && details ? `${title}: ${formatEUR(result.amount)}. Trajanje zaposlitve: ${details.period}.` : '',
    700,
  )

  return (
    <section className={result ? 'result' : 'result result-empty'} aria-labelledby="result-title">
      <h2 id="result-title" className="result-label">
        {title}
      </h2>
      <p role="status" className="sr-only">
        {announcement}
      </p>

      {result && details ? (
        <>
          <p className="result-amount">{formatEUR(result.amount)}</p>
          <dl className="result-details">
            <div>
              <dt>Obdobje</dt>
              <dd>
                {formatDate(start)} – {formatDate(end)}
              </dd>
            </div>
            <div>
              <dt>Trajanje</dt>
              <dd>{details.period}</dd>
            </div>
            <div>
              <dt>Izračun</dt>
              <dd>
                {details.share} × {formatEUR(fullAmount)} = {formatEUR(result.amount)}
              </dd>
            </div>
          </dl>
        </>
      ) : (
        <p>
          {end === ''
            ? 'Vnesite zadnji dan zaposlitve za izračun sorazmernega dela regresa.'
            : 'Popravite označene podatke za izračun sorazmernega dela regresa.'}
        </p>
      )}
    </section>
  )
}
