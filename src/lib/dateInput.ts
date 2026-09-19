// Conversion between the ISO dates used in state (`2026-04-15`) and the
// Slovenian format shown in date fields (`15. 04. 2026`).

export const DATE_PLACEHOLDER = 'dd. mm. yyyy'

export function formatDateInput(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  return match ? `${match[3]}. ${match[2]}. ${match[1]}` : ''
}

/**
 * Parses what a person types: `15. 4. 2026`, `15.04.2026`, `15/4/2026`,
 * `15-4-2026` or `15042026`. Returns an ISO date, or null if it isn't a real date.
 */
export function parseDateInput(text: string): string | null {
  const trimmed = text.trim()
  const match = /^(\d{2})(\d{2})(\d{4})$/.exec(trimmed) ?? /^(\d{1,2})\s*[./-]\s*(\d{1,2})\s*[./-]\s*(\d{4})\.?$/.exec(trimmed)
  if (!match) return null

  const [day, month, year] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const date = new Date(Date.UTC(year, month - 1, day))
  // Reject overflowing dates such as 31. 4. or 30. 2.
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null

  return `${match[3]}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
