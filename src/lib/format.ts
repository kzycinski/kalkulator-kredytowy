const PLN = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  maximumFractionDigits: 2,
})

const PERCENT = new Intl.NumberFormat('pl-PL', {
  style: 'percent',
  maximumFractionDigits: 3,
  minimumFractionDigits: 2,
})

export function formatPLN(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return '—'
  const num = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(num)) return '—'
  return PLN.format(num)
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return PERCENT.format(value)
}

export function formatMonths(months: number): string {
  if (months <= 0) return '0 mies.'
  const years = Math.floor(months / 12)
  const rem = months % 12
  if (years === 0) return `${months} mies.`
  if (rem === 0) return `${years} lat`
  return `${years} lat ${rem} mies.`
}

export function pluralRat(n: number): string {
  if (n === 1) return 'rata'
  const lastTwo = n % 100
  const last = n % 10
  if (lastTwo >= 12 && lastTwo <= 14) return 'rat'
  if (last >= 2 && last <= 4) return 'raty'
  return 'rat'
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('pl-PL')
}
