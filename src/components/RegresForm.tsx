import { getAvailableYears, type RegresType } from '../data/regresAmounts'
import type { Method, ValidationError } from '../lib/calculateRegres'
import { formatEUR } from '../lib/format'
import { SegmentedControl } from './SegmentedControl'

export interface FormValues {
  type: RegresType
  year: number
  amount: string
  start: string
  end: string
  method: Method
}

interface Props {
  values: FormValues
  statutoryAmount: number
  isAmountOverridden: boolean
  errors: ValidationError[]
  onTypeChange: (type: RegresType) => void
  onYearChange: (year: number) => void
  onChange: (patch: Partial<FormValues>) => void
  onResetAmount: () => void
}

const TYPE_OPTIONS: { value: RegresType; label: string }[] = [
  { value: 'summer', label: 'Letni regres' },
  { value: 'winter', label: 'Zimski regres' },
]

const METHOD_OPTIONS: { value: Method; label: string; hint: string }[] = [
  {
    value: 'months-plus-days',
    label: 'Polni meseci + sorazmerni dnevi',
    hint: '1/12 za vsak polni mesec zaposlitve, nepopoln mesec sorazmerno po dnevih.',
  },
  {
    value: 'full-months',
    label: 'Samo polni meseci',
    hint: '1/12 za vsak polni mesec zaposlitve, nepopoln mesec se ne šteje (VDSS PDP 64/2022).',
  },
  {
    value: 'calendar-days',
    label: 'Koledarski dnevi',
    hint: 'Regres × dnevi zaposlitve / dnevi v letu.',
  },
]

const ERROR_MESSAGES: Record<ValidationError, string> = {
  'amount-invalid': 'Vnesite znesek regresa, večji od 0.',
  'start-missing': 'Vnesite začetek zaposlitve.',
  'end-missing': 'Vnesite zadnji dan zaposlitve.',
  'start-outside-year': 'Začetek zaposlitve mora biti v izbranem letu.',
  'end-outside-year': 'Zadnji dan zaposlitve mora biti v izbranem letu.',
  'end-before-start': 'Zadnji dan zaposlitve ne sme biti pred začetkom zaposlitve.',
}

export function RegresForm({
  values,
  statutoryAmount,
  isAmountOverridden,
  errors,
  onTypeChange,
  onYearChange,
  onChange,
  onResetAmount,
}: Props) {
  const firstError = (codes: ValidationError[]) => codes.find((code) => errors.includes(code))

  const amountError = firstError(['amount-invalid'])
  const startError = firstError(['start-missing', 'start-outside-year'])
  // Don't nag about the end date before the user has entered one.
  const endError = values.end === '' ? undefined : firstError(['end-missing', 'end-outside-year', 'end-before-start'])

  return (
    <form className="form" onSubmit={(event) => event.preventDefault()} noValidate>
      <SegmentedControl
        legend="Vrsta regresa"
        name="type"
        options={TYPE_OPTIONS}
        value={values.type}
        onChange={onTypeChange}
      />

      <div className="field-row">
        <div className="field">
          <label htmlFor="year">Leto</label>
          <div className="select-wrap">
            <select id="year" value={values.year} onChange={(event) => onYearChange(Number(event.target.value))}>
              {getAvailableYears(values.type).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="amount">Regres za celo leto (€)</label>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={values.amount}
            aria-invalid={amountError ? true : undefined}
            aria-describedby={amountError ? 'amount-hint amount-error' : 'amount-hint'}
            onChange={(event) => onChange({ amount: event.target.value })}
          />
        </div>
      </div>
      <p className="field-hint">
        <span id="amount-hint">
          Zakonski minimum za leto {values.year}: {formatEUR(statutoryAmount)}
        </span>
        {isAmountOverridden && (
          <>
            {' · '}
            <button type="button" className="link-button" onClick={onResetAmount}>
              Ponastavi na zakonski minimum
            </button>
          </>
        )}
      </p>
      {amountError && (
        <p id="amount-error" className="field-error">
          {ERROR_MESSAGES[amountError]}
        </p>
      )}

      <div className="field-row">
        <div className="field">
          <label htmlFor="start">Začetek zaposlitve</label>
          <input
            id="start"
            type="date"
            min={`${values.year}-01-01`}
            max={`${values.year}-12-31`}
            value={values.start}
            aria-invalid={startError ? true : undefined}
            aria-describedby={startError ? 'start-error' : undefined}
            onChange={(event) => onChange({ start: event.target.value })}
          />
        </div>

        <div className="field">
          <label htmlFor="end">Zadnji dan zaposlitve</label>
          <input
            id="end"
            type="date"
            min={values.start || `${values.year}-01-01`}
            max={`${values.year}-12-31`}
            value={values.end}
            aria-invalid={endError ? true : undefined}
            aria-describedby={endError ? 'end-error' : undefined}
            onChange={(event) => onChange({ end: event.target.value })}
          />
        </div>
      </div>
      {startError && (
        <p id="start-error" className="field-error">
          {ERROR_MESSAGES[startError]}
        </p>
      )}
      {endError && (
        <p id="end-error" className="field-error">
          {ERROR_MESSAGES[endError]}
        </p>
      )}

      {values.type === 'summer' ? (
        <fieldset className="methods">
          <legend>Način izračuna</legend>
          {METHOD_OPTIONS.map((option) => (
            <label key={option.value} className="method">
              <input
                type="radio"
                name="method"
                value={option.value}
                checked={values.method === option.value}
                // Name and description are split so the hint isn't read twice.
                aria-labelledby={`method-label-${option.value}`}
                aria-describedby={`method-hint-${option.value}`}
                onChange={() => onChange({ method: option.value })}
              />
              <span>
                <span id={`method-label-${option.value}`} className="method-label">
                  {option.label}
                </span>
                <span id={`method-hint-${option.value}`} className="method-hint">
                  {option.hint}
                </span>
              </span>
            </label>
          ))}
        </fieldset>
      ) : (
        <p className="method-note">
          <strong>Način izračuna:</strong> koledarski dnevi. Sorazmerni del zimskega regresa se obračuna po koledarskih
          dnevih zaposlitve (ZPZR).
        </p>
      )}
    </form>
  )
}
