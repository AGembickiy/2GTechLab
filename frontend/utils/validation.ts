/**
 * Утилиты валидации
 */

export interface ValidationResult {
  valid: boolean
  message: string
}

export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) return { valid: false, message: 'Email обязателен' }
  if (!emailRegex.test(email)) return { valid: false, message: 'Неверный формат email' }
  return { valid: true, message: '' }
}

export function validatePassword(password: string): ValidationResult {
  if (!password) return { valid: false, message: 'Пароль обязателен' }
  if (password.length < 8) return { valid: false, message: 'Пароль должен содержать минимум 8 символов' }
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Пароль должен содержать хотя бы одну заглавную букву' }
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Пароль должен содержать хотя бы одну строчную букву' }
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Пароль должен содержать хотя бы одну цифру' }
  return { valid: true, message: '' }
}

export function validatePhone(phone: string): ValidationResult {
  const phoneRegex = /^\+?7?(\d{10})$/
  if (!phone) return { valid: false, message: 'Номер телефона обязателен' }
  if (!phoneRegex.test(phone.replace(/\D/g, ''))) return { valid: false, message: 'Неверный формат номера телефона' }
  return { valid: true, message: '' }
}

export function validateRequired(value: any, fieldName: string = 'Поле'): ValidationResult {
  if (!value || value === '') return { valid: false, message: `${fieldName} обязательно для заполнения` }
  return { valid: true, message: '' }
}

export function validateMinLength(value: string, minLength: number, fieldName: string = 'Поле'): ValidationResult {
  if (!value) return { valid: false, message: `${fieldName} обязательно для заполнения` }
  if (value.length < minLength) return { valid: false, message: `${fieldName} должен содержать минимум ${minLength} символов` }
  return { valid: true, message: '' }
}

export function validateMaxLength(value: string, maxLength: number, fieldName: string = 'Поле'): ValidationResult {
  if (!value) return { valid: false, message: `${fieldName} обязательно для заполнения` }
  if (value.length > maxLength) return { valid: false, message: `${fieldName} не должен превышать ${maxLength} символов` }
  return { valid: true, message: '' }
}

export function validateNumberRange(value: number, min: number, max: number, fieldName: string = 'Поле'): ValidationResult {
  if (value < min) return { valid: false, message: `${fieldName} не может быть меньше ${min}` }
  if (value > max) return { valid: false, message: `${fieldName} не может быть больше ${max}` }
  return { valid: true, message: '' }
}
