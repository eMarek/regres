interface Option<T extends string> {
  value: T
  label: string
}

interface Props<T extends string> {
  legend: string
  name: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}

// Native radios inside a fieldset: screen readers announce the group name,
// the selected option and "1 of 2", and arrow keys switch between options.
export function SegmentedControl<T extends string>({ legend, name, options, value, onChange }: Props<T>) {
  return (
    <fieldset className="segmented">
      <legend>{legend}</legend>
      <div className="segmented-options">
        {options.map((option) => (
          <label key={option.value} className="segmented-option">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
