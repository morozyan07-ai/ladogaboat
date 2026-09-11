// CloudPayments API-клиент
// Документация: https://developers.cloudpayments.ru/

const PUBLIC_ID = process.env.CLOUDPAYMENTS_PUBLIC_ID!
const API_SECRET = process.env.CLOUDPAYMENTS_API_SECRET!
const BASE = 'https://api.cloudpayments.ru'

function authHeader() {
  return 'Basic ' + Buffer.from(`${PUBLIC_ID}:${API_SECRET}`).toString('base64')
}

export interface CloudPaymentsOrder {
  Id: string
  Number: string | null
  Url: string
}

interface CloudPaymentsResponse<T> {
  Model: T
  Success: boolean
  Message: string | null
}

/**
 * Создаёт платёжную ссылку (Orders API) и возвращает URL для перенаправления покупателя.
 * InvoiceId = bookingId — используется для сопоставления бронирования в вебхуке Pay/Fail.
 * В отличие от ЮKassa, Orders API не поддерживает переиспользование/поллинг существующего
 * платежа по id — при повторной оплате создаётся новая ссылка.
 */
export async function createPayment(params: {
  amountRub: number
  description: string
  bookingId: string
  email?: string
  successUrl: string
  failUrl: string
}): Promise<CloudPaymentsOrder> {
  const res = await fetch(`${BASE}/orders/create`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Amount: params.amountRub,
      Currency: 'RUB',
      Description: params.description,
      InvoiceId: params.bookingId,
      Email: params.email,
      RequireConfirmation: false,
      SendEmail: false,
      SuccessRedirectUrl: params.successUrl,
      FailRedirectUrl: params.failUrl,
    }),
  })

  const data = (await res.json().catch(() => null)) as CloudPaymentsResponse<CloudPaymentsOrder> | null
  if (!res.ok || !data?.Success) {
    throw new Error(`CloudPayments createPayment: ${JSON.stringify(data ?? {})}`)
  }

  return data.Model
}

/**
 * Проверяет подпись вебхука CloudPayments (заголовок Content-HMAC, HMAC-SHA256 от тела запроса
 * на секретном ключе API, base64). rawBody — исходное необработанное тело запроса.
 */
export async function verifyWebhookSignature(rawBody: string, signature: string | null): Promise<boolean> {
  if (!signature) return false
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(API_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody))
  const expected = Buffer.from(mac).toString('base64')

  // Сравнение за постоянное время
  if (expected.length !== signature.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i)
  return diff === 0
}
