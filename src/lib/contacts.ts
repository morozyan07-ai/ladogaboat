// Контакты компании для шапки сайта и страницы поддержки.
// Пока используются плейсхолдеры — замените на реальные данные через .env,
// когда они будут готовы (см. .env.example).
export const CONTACTS = {
  telegram: process.env.NEXT_PUBLIC_CONTACT_TELEGRAM || 'https://t.me/ladogaboat',
  whatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || 'https://wa.me/79990000000',
  instagram: process.env.NEXT_PUBLIC_CONTACT_INSTAGRAM || 'https://instagram.com/ladogaboat',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@ladogaboat.ru',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@ladogaboat.ru',
} as const
