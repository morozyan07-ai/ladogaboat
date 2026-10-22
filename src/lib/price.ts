// Единица тарификации катера: HOUR (час) / TOUR (тур, цена за человека) / SUTKI (сутки, по умолчанию).
// Используется везде, где показывается цена — чтобы подпись совпадала с тем,
// что владелец выбрал в редактировании катера.

export function priceUnitLabel(unit: string | null | undefined): string {
  switch (unit) {
    case 'HOUR':
      return 'час'
    case 'TOUR':
      return 'чел.'
    default:
      return 'день'
  }
}

export function isPerPersonUnit(unit: string | null | undefined): boolean {
  return unit === 'TOUR'
}
