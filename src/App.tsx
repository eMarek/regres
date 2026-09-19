import { useState } from 'react'
import './App.css'
import { type FormValues, RegresForm } from './components/RegresForm'
import { ResultCard } from './components/ResultCard'
import { ThemeToggle } from './components/ThemeToggle'
import { getDefaultYear, getRegresForYear, type RegresType } from './data/regresAmounts'
import { calculateRegres, type Method } from './lib/calculateRegres'
import { parseAmount, toAmountInput } from './lib/format'
import { useTheme } from './lib/useTheme'

const SUBTITLES: Record<RegresType, string> = {
  summer: 'Regres za letni dopust za zaposlene, ki pri delodajalcu niso delali celo koledarsko leto.',
  winter: 'Zimski regres za zaposlene, ki pri delodajalcu niso delali celo koledarsko leto.',
}

const LEGAL_NOTES: Record<RegresType, string> = {
  summer:
    'Zneski so bruto. Najnižji regres za letni dopust je po ZDR-1 enak minimalni plači; delavec ima pravico do ' +
    'sorazmernega dela regresa, če ima pravico le do sorazmernega dela letnega dopusta (1/12 za vsak mesec zaposlitve).',
  winter:
    'Zimski regres velja od leta 2025 (ZPZR) in znaša najmanj polovico minimalne plače. Delavcu, ki ni bil zaposlen ' +
    'celo leto, pripada sorazmerni del glede na koledarske dneve zaposlitve pri delodajalcu.',
}

function initialValues(type: RegresType, year: number, method: Method = 'months-plus-days'): FormValues {
  return {
    type,
    year,
    amount: toAmountInput(getRegresForYear(type, year) ?? 0),
    start: `${year}-01-01`,
    end: '',
    method,
  }
}

function App() {
  const [theme, setTheme] = useTheme()
  const [values, setValues] = useState<FormValues>(() => initialValues('summer', getDefaultYear('summer')))

  const statutoryAmount = getRegresForYear(values.type, values.year) ?? 0
  const fullAmount = parseAmount(values.amount)
  // ZPZR defines no month rule, so the winter regres always goes by calendar days.
  const method = values.type === 'winter' ? 'calendar-days' : values.method
  const outcome = calculateRegres({ ...values, method, fullAmount })

  const handleTypeChange = (type: RegresType) =>
    setValues((current) => {
      // Keep the entered dates when the year exists for the other type too;
      // only the statutory amount changes.
      if (getRegresForYear(type, current.year) === undefined) {
        return initialValues(type, getDefaultYear(type), current.method)
      }
      return { ...current, type, amount: toAmountInput(getRegresForYear(type, current.year) ?? 0) }
    })

  return (
    <main className="app">
      <header className="app-header">
        <h1>Izračun sorazmernega dela regresa</h1>
        <p>{SUBTITLES[values.type]}</p>
        <ThemeToggle theme={theme} onChange={setTheme} />
      </header>

      <div className="card">
        <RegresForm
          values={values}
          statutoryAmount={statutoryAmount}
          isAmountOverridden={fullAmount !== statutoryAmount}
          errors={outcome.ok ? [] : outcome.errors}
          onTypeChange={handleTypeChange}
          // A new year means a new statutory amount and dates inside that year.
          onYearChange={(year) => setValues((current) => initialValues(current.type, year, current.method))}
          onChange={(patch) => setValues((current) => ({ ...current, ...patch }))}
          onResetAmount={() => setValues((current) => ({ ...current, amount: toAmountInput(statutoryAmount) }))}
        />
        <ResultCard
          type={values.type}
          result={outcome.ok ? outcome.result : null}
          fullAmount={fullAmount}
          start={values.start}
          end={values.end}
          method={method}
        />
      </div>

      <footer className="app-footer">
        <p>{LEGAL_NOTES[values.type]}</p>
        <p>Izračun je informativen in ne predstavlja pravnega nasveta.</p>
      </footer>
    </main>
  )
}

export default App
