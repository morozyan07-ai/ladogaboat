// Единица тарификации катера: HOUR (час) / TOUR (тур) / SUTKI (сутки, по умолчанию).
// Используется везде, где показывается цена — чтобы подпись "/час" или "/сутки"
// совпадала с тем, что владелец выбрал в редактировании катера.

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
