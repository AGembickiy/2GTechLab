/**
 * Утилиты форматирования данных
 */

export function formatCurrency(amount: number, currency: string = '₽'): string {
  return `${amount.toFixed(2)} ${currency}`
}

export function formatDate(dateString: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(date)
}

export function formatDateTime(dateString: string | Date): string {
  return formatDate(dateString, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return ''
  
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/\D/g, '')
  
  // Format as +7 (XXX) XXX-XX-XX
  if (cleaned.length === 11 && cleaned.startsWith('7')) {
    return `+7 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 9)}-${cleaned.substring(9, 11)}`
  }
  if (cleaned.length === 10) {
    return `+7 (${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 8)}-${cleaned.substring(8, 10)}`
  }
  
  return phone
}

export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + suffix
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
