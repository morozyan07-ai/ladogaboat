// Цена катера складывается из двух независимых настроек:
// - priceUnit: HOUR (час) / TOUR (тур) / SUTKI (сутки, по умолчанию) — единица времени.
// - priceBasis: BOAT (за весь катер целиком, по умолчанию) / PERSON (за человека,
//   умножается на число людей в брони) — чтобы можно было задать "час с человека"
//   или "тур за лодку целиком".

export function priceUnitLabel(unit: string | null | undefined): string {
  switch (unit) {
    case 'HOUR':
      return 'час'
    case 'TOUR':
      return 'тур'
    default:
      return 'день'
  }
}

export function isPerPersonBasis(basis: string | null | undefined): boolean {
  return basis === 'PERSON'
}

// Подпись цены, которая показывается в каталоге/на странице катера.
// Для цены "за человека" показываем "чел." независимо от единицы времени —
// единица уточняется отдельно в самой форме бронирования.
export function priceSuffix(unit: string | null | undefined, basis: string | null | undefined): string {
  return isPerPersonBasis(basis) ? 'чел.' : priceUnitLabel(unit)
}
