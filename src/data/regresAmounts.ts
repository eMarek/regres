export type RegresType = 'summer' | 'winter'

// Statutory minimum amounts per year in EUR. To support a new year, add one
// line to each table.
const AMOUNTS: Record<RegresType, Record<number, number>> = {
  // Regres za letni dopust: by ZDR-1 (čl. 131) at least the gross minimum wage
  // (minimalna plača) valid for that year.
  summer: {
    2015: 790.73,
    2016: 790.73,
    2017: 804.96,
    2018: 842.79,
    2019: 886.63,
    2020: 940.58,
    2021: 1024.24,
    2022: 1074.43,
    2023: 1203.36,
    2024: 1253.9,
    2025: 1277.72,
    2026: 1481.88,
  },
  // Zimski regres: introduced by ZPZR for 2025 onward, half of the minimum wage.
  winter: {
    2025: 638.86,
    2026: 740.94,
  },
}

export function getAvailableYears(type: RegresType): number[] {
  return Object.keys(AMOUNTS[type])
    .map(Number)
    .sort((a, b) => b - a)
}

export function getRegresForYear(type: RegresType, year: number): number | undefined {
  return AMOUNTS[type][year]
}

export function getDefaultYear(type: RegresType, today: Date = new Date()): number {
  const current = today.getFullYear()
  return current in AMOUNTS[type] ? current : getAvailableYears(type)[0]
}
