// Простые валидаторы — замена zod для уменьшения bundle size

type FieldErrors = Record<string, string[]>

function err(errors: FieldErrors, field: string, msg: string) {
  errors[field] = errors[field] ? [...errors[field], msg] : [msg]
}

export function validateStr(v: unknown, field: string, errors: FieldErrors, minLen = 1, label = field) {
  if (typeof v !== 'string' || v.trim().length < minLen) {
    err(errors, field, minLen > 1 ? `${label} должно содержать минимум ${minLen} символа` : `Введите ${label}`)
  }
  return typeof v === 'string' ? v.trim() : ''
}

export function validateEmail(v: unknown, field: string, errors: FieldErrors): string {
  const s = typeof v === 'string' ? v.trim().toLowerCase() : ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) err(errors, field, 'Введите корректный email')
  return s
}

export function validateEnum<T extends string>(v: unknown, values: readonly T[], field: string, errors: FieldErrors): T {
  if (!values.includes(v as T)) err(errors, field, 'Недопустимое значение')
  return v as T
}

export function validateNumber(v: unknown, field: string, errors: FieldErrors, min?: number): number {
  const n = Number(v)
  if (isNaN(n)) { err(errors, field, 'Введите число'); return 0 }
  if (min !== undefined && n < min) { err(errors, field, `Минимум ${min}`); return n }
  return n
}

export function validateInt(v: unknown, field: string, errors: FieldErrors, min?: number): number {
  const n = Number(v)
  if (!Number.isInteger(n)) { err(errors, field, 'Введите целое число'); return 0 }
  if (min !== undefined && n < min) { err(errors, field, `Минимум ${min}`); return n }
  return n
}

export function validateRegex(v: unknown, field: string, errors: FieldErrors, pattern: RegExp, msg: string): string {
  const s = typeof v === 'string' ? v.trim() : ''
  if (!pattern.test(s)) err(errors, field, msg)
  return s
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0
}

export type { FieldErrors }
