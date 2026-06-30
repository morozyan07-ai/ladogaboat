// ЮKassa API-клиент
// Документация: https://yookassa.ru/developers/api

const SHOP_ID = process.env.YOOKASSA_SHOP_ID!
const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY!
const BASE = 'https://api.yookassa.ru/v3'

function authHeader() {
  return 'Basic ' + Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString('base64')
}

export interface YookassaPayment {
  id: string
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled'
  amount: { value: string; currency: string }
  confirmation?: { type: string; confirmation_url?: string }
  metadata?: Record<string, string>
}

/**
 * Создаёт платёж в ЮKassa и возвращает URL для перенаправления покупателя.
 * idempotenceKey = bookingId (безопасно повторять при ретрае).
 */
export async function createPayment(params: {
  amountRub: number
  description: string
  bookingId: string
  returnUrl: string
}): Promise<YookassaPayment> {
  const res = await fetch(`${BASE}/payments`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
      'Idempotence-Key': params.bookingId,
    },
    body: JSON.stringify({
      amount: { value: params.amountRub.toFixed(2), currency: 'RUB' },
      capture: true,
      description: params.description,
      metadata: { bookingId: params.bookingId },
      confirmation: {
        type: 'redirect',
        return_url: params.returnUrl,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`YooKassa createPayment: ${JSON.stringify(err)}`)
  }

  return res.json()
}

/** Получает актуальный статус платежа по его ID. */
export async function getPayment(paymentId: string): Promise<YookassaPayment> {
  const res = await fetch(`${BASE}/payments/${paymentId}`, {
    headers: { Authorization: authHeader() },
  })
  if (!res.ok) throw new Error('YooKassa getPayment: failed')
  return res.json()
}
