// sl-SI only groups from 5 digits up by default; force 1.481,88 € for amounts.
const eurFormatter = new Intl.NumberFormat('sl-SI', { style: 'currency', currency: 'EUR', useGrouping: 'always' })
const numberFormatter = new Intl.NumberFormat('sl-SI', { maximumFractionDigits: 2 })
const dateFormatter = new Intl.DateTimeFormat('sl-SI', { timeZone: 'UTC' })

export function formatEUR(value: number): string {
  return eurFormatter.format(value)
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

/** Formats an ISO `YYYY-MM-DD` string as a Slovenian date (15. 4. 2026). */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`))
}

/** Parses a user-typed amount; accepts `1481,88`, `1.481,88` and `1481.88`. */
export function parseAmount(value: string): number {
  let normalized = value.trim().replace(/[\s€]/g, '')
  // With a decimal comma present, dots can only be thousands separators.
  if (normalized.includes(',')) normalized = normalized.replace(/\./g, '').replace(',', '.')
  return normalized === '' ? Number.NaN : Number(normalized)
}

/** Amount as shown in the editable input: `1481,88`. */
export function toAmountInput(value: number): string {
  return value.toFixed(2).replace('.', ',')
}

/** Slovenian plural form: 1 → one, 2 → two, 3–4 → few, otherwise → other. */
export function plural(count: number, forms: { one: string; two: string; few: string; other: string }): string {
  const mod = count % 100
  if (mod === 1) return forms.one
  if (mod === 2) return forms.two
  if (mod === 3 || mod === 4) return forms.few
  return forms.other
}
