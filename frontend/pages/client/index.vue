<template>
  <div class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-3">
      <div
        v-for="card in summaryCards"
        :key="card.label"
        class="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4"
      >
        <p class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ card.label }}</p>
        <p class="mt-2 text-2xl font-bold text-slate-100">{{ card.value }}</p>
      </div>
    </div>

    <div class="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-100">Мои заказы</h2>
        <UButton color="primary" @click="navigateTo('/order')">
          <template #icon><UIcon name="i-heroicons-plus" class="h-4 w-4" /></template>
          Новый заказ
        </UButton>
      </div>

      <div v-if="pending" class="mt-4 text-sm text-slate-400">Загрузка…</div>
      <div v-else-if="error" class="mt-4 text-sm text-rose-400">Не удалось загрузить заказы.</div>
      <div v-else-if="orders.length === 0" class="mt-4 text-sm text-slate-400">
        У вас пока нет заказов.
      </div>
      <div v-else class="mt-4 space-y-3">
        <div
          v-for="order in orders"
          :key="order.id"
          class="rounded-lg border border-slate-800/60 bg-slate-950/30 p-4"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="font-semibold text-slate-200">Заказ #{{ order.id }}</p>
              <p class="text-sm text-slate-400">
                Создан: {{ formatDate(order.created_at) }}
              </p>
            </div>
            <span
              :class="
                orderStatusColors[order.status]
                  ? `rounded-full px-3 py-1 text-xs font-semibold ${orderStatusColors[order.status]}`
                  : 'bg-gray-500/20 text-gray-300'
              "
            >
              {{ orderStatusLabels[order.status] || order.status }}
            </span>
          </div>
          <div class="mt-2 flex items-center justify-between text-sm">
            <div class="text-slate-300">
              {{ order.items?.length || 0 }} позиций
            </div>
            <div class="font-bold text-slate-100">
              {{ formatCurrency(order.total_price || 0) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ORDER_STATUS_LABELS, ORDER_STATUSES } from '@/constants/orderStatuses'
import { OrderService } from '@/services/orderService'

definePageMeta({
  layout: 'client',
  middleware: 'auth-check',
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const orderService = new OrderService()

const { data: orders, pending, error } = await useAsyncData('user-orders', () =>
  orderService.listOrders({ user: authStore.user?.id }),
)

const orderStatusColors: Record<string, string> = {
  [ORDER_STATUSES.DRAFT]: 'bg-gray-500/20 text-gray-300',
  [ORDER_STATUSES.ACCEPTED]: 'bg-blue-500/20 text-blue-300',
  [ORDER_STATUSES.IN_PRINTING]: 'bg-yellow-500/20 text-yellow-300',
  [ORDER_STATUSES.READY_FOR_PICKUP]: 'bg-green-500/20 text-green-300',
  [ORDER_STATUSES.COMPLETED]: 'bg-green-500/20 text-green-300',
  [ORDER_STATUSES.CANCELLED]: 'bg-red-500/20 text-red-300',
}

const summaryCards = computed(() => [
  { label: 'Всего заказов', value: String(orders.value?.length ?? 0) },
  {
    label: 'В обработке',
    value: String(orders.value?.filter((o: any) => o.status === ORDER_STATUSES.IN_PRINTING).length ?? 0),
  },
  {
    label: 'Готово к выдаче',
    value: String(orders.value?.filter((o: any) => o.status === ORDER_STATUSES.READY_FOR_PICKUP).length ?? 0),
  },
])

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
  }).format(amount)
}

function navigateTo(path: string) {
  router.push(path)
}
</script>
