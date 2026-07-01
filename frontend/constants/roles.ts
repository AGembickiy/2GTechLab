/**
 * Константы ролей пользователей
 */
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CLIENT: 'client',
  PARTNER: 'partner',
} as const

export const ROLE_NAMES = {
  admin: 'Администратор',
  manager: 'Менеджер',
  client: 'Клиент',
  partner: 'Партнёр',
} as const

export const ROLE_PERMISSIONS = {
  admin: ['view_users', 'manage_users', 'view_orders', 'manage_orders', 'view_warehouse', 'manage_warehouse', 'view_finance', 'manage_finance', 'view_analytics', 'manage_system'],
  manager: ['view_orders', 'manage_orders', 'view_warehouse', 'manage_warehouse', 'view_printers', 'manage_printers', 'view_equipment'],
  client: ['view_orders', 'create_order', 'view_profile', 'upload_model', 'view_messages'],
  partner: ['view_orders', 'view_models', 'view_royalties', 'view_payments', 'manage_models'],
} as const

export type Role = typeof ROLES[keyof typeof ROLES]
