import { useRef, useState } from 'react'
import { DATE_PLACEHOLDER, formatDateInput, parseDateInput } from '../lib/dateInput'
import { useMediaQuery } from '../lib/useMediaQuery'

interface Props {
  id: string
  label: string
  /** ISO `YYYY-MM-DD`, or '' when empty. */
  value: string
  min: string
  max: string
  error?: string
  onChange: (iso: string) => void
}

const FORMAT_ERROR = `Vnesite datum v obliki ${DATE_PLACEHOLDER}, na primer 15. 04. 2026.`

// A native <input type="date"> is drawn by the browser: its arrow and its date
// format (taken from the device language, not the page) can't be styled. So the
// field is drawn here, always as "dd. mm. yyyy", and the native input is kept
// only for its date picker.
export function DateField(props: Props) {
  // Touch devices have no way to type into a date input anyway; they get the
  // native picker on tap. Everything else gets a text field plus a picker button.
  const isTouch = useMediaQuery('(pointer: coarse)')
  return isTouch ? <TouchDateField {...props} /> : <TypedDateField {...props} />
}

function TouchDateField({ id, label, value, min, max, error, onChange }: Props) {
  const errorId = `${id}-error`

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="date-field date-field-touch">
        <span className="date-display" aria-hidden="true">
          {value ? formatDateInput(value) : <span className="date-placeholder">{DATE_PLACEHOLDER}</span>}
        </span>
        {/* Invisible but real: a tap opens the native picker, and screen
            readers get a native, labelled date control. */}
        <input
          id={id}
          type="date"
          className="date-native-overlay"
          min={min}
          max={max}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  )
}

function TypedDateField({ id, label, value, min, max, error, onChange }: Props) {
  const [text, setText] = useState(() => formatDateInput(value))
  const [lastValue, setLastValue] = useState(value)
  const [isFocused, setIsFocused] = useState(false)
  const pickerRef = useRef<HTMLInputElement>(null)

  // The value also changes from outside (year switch, native picker). Follow
  // it, unless the text already means the same date (e.g. "15.4.2026").
  if (value !== lastValue) {
    setLastValue(value)
    if ((parseDateInput(text) ?? '') !== value) setText(formatDateInput(value))
  }

  const isUnparsable = text.trim() !== '' && parseDateInput(text) === null
  // While a date is half-typed it is neither a format error nor "missing".
  const isTyping = isFocused && isUnparsable
  const shownError = isTyping ? undefined : isUnparsable ? FORMAT_ERROR : error

  const formatId = `${id}-format`
  const errorId = `${id}-error`

  const openPicker = () => {
    const picker = pickerRef.current
    if (!picker) return
    try {
      picker.showPicker()
    } catch {
      // Older browsers: fall back to the keyboard.
      document.getElementById(id)?.focus()
    }
  }

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="date-field">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder={DATE_PLACEHOLDER}
          value={text}
          aria-invalid={shownError ? true : undefined}
          aria-describedby={shownError ? `${formatId} ${errorId}` : formatId}
          onChange={(event) => {
            setText(event.target.value)
            onChange(parseDateInput(event.target.value) ?? '')
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false)
            // Tidy "15.4.2026" into "15. 04. 2026".
            const iso = parseDateInput(text)
            if (iso) setText(formatDateInput(iso))
          }}
        />
        <button type="button" className="date-picker-button" aria-label={`Odpri koledar: ${label}`} onClick={openPicker} />
        {/* Only a host for the native calendar popup; never focused or read. */}
        <input
          ref={pickerRef}
          type="date"
          className="date-native-hidden"
          tabIndex={-1}
          aria-hidden="true"
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      <span id={formatId} className="sr-only">
        Oblika: dan, mesec, leto. Na primer 15. 04. 2026.
      </span>
      {shownError && (
        <p id={errorId} className="field-error">
          {shownError}
        </p>
      )}
    </div>
  )
}
