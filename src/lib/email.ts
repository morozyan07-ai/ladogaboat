// Простая обёртка над отправкой email.
// Пока нет ключа провайдера — письма просто логируются (режим разработки).
// Чтобы включить реальную отправку, задайте в .env:
//   RESEND_API_KEY=...        (см. https://resend.com — бесплатный тариф, можно подключить
//                               после того как заведёте почту техподдержки, см. SUPPORT_EMAIL)
//   EMAIL_FROM=Ladoga Boat <noreply@ladogaboat.ru>
type SendEmailInput = {
  to: string
  subject: string
  text: string
  replyTo?: string
}

export async function sendEmail({ to, subject, text, replyTo }: SendEmailInput): Promise<{ ok: boolean }> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.log('[email:dev-mode] письмо не отправлено (нет RESEND_API_KEY), содержимое:', {
      to,
      subject,
      text,
      replyTo,
    })
    return { ok: true }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Ladoga Boat <noreply@ladogaboat.ru>',
        to: [to],
        subject,
        text,
        reply_to: replyTo,
      }),
    })
    return { ok: res.ok }
  } catch (err) {
    console.error('[email] ошибка отправки:', err)
    return { ok: false }
  }
}
