/**
 * Константы статусов заказов
 */
export const ORDER_STATUSES = {
  DRAFT: 'draft',
  ACCEPTED: 'accepted',
  IN_PRINTING: 'in_printing',
  READY_FOR_PICKUP: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const ORDER_STATUS_NAMES = {
  draft: 'Черновик',
  accepted: 'Принят',
  in_printing: 'В печати',
  ready: 'Готов к выдаче',
  completed: 'Завершен',
  cancelled: 'Отменен',
} as const

export const ORDER_STATUS_COLORS = {
  draft: 'text-slate-400',
  accepted: 'text-amber-500',
  in_printing: 'text-blue-500',
  ready: 'text-emerald-500',
  completed: 'text-green-500',
  cancelled: 'text-rose-500',
} as const

export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES]
