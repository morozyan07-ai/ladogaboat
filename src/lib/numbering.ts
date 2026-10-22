// Внутренняя нумерация для дашборда: судовладельцы "0001", катера "00001".
// Сами номера назначаются в БД (см. миграцию owner_boat_numbering) — здесь только форматирование.

export function formatOwnerNumber(n: number | null | undefined): string {
  if (n == null) return '—'
  return String(n).padStart(4, '0')
}

export function formatBoatNumber(n: number | null | undefined): string {
  if (n == null) return '—'
  return String(n).padStart(5, '0')
}
