<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
      <h2 class="text-lg font-bold text-slate-100">Платежи</h2>
      <div v-if="pending" class="mt-4 text-sm text-slate-400">Загрузка…</div>
      <div v-else-if="error" class="mt-4 text-sm text-rose-400">Не удалось загрузить платежи.</div>
      <div v-else class="mt-4 space-y-4">
        <div
          v-for="payment in payments"
          :key="payment.id"
          :class="
            payment.status === 'completed'
              ? 'rounded-lg border border-green-800/60 bg-green-950/20 p-4'
              : 'rounded-lg border border-slate-800/60 bg-slate-950/30 p-4'
          "
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="font-semibold text-slate-200">Платеж #{{ payment.id }}</p>
              <p class="text-sm text-slate-400">{{ formatDate(payment.created_at) }}</p>
            </div>
            <div class="text-right">
              <p
                :class="
                  payment.status === 'completed'
                    ? 'text-green-400'
                    : payment.status === 'pending'
                      ? 'text-yellow-400'
                      : 'text-red-400'
                "
              >
                {{ payment.statusLabel }}
              </p>
              <p class="font-bold text-slate-100">
                {{ formatCurrency(payment.amount) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'partner',
  middleware: 'auth-check',
})

const route = useRoute()
const router = useRouter()

const payments = ref([])

async function loadPayments() {
  // Загрузка платежей партнера (заглушка для будущей реализации)
}

onMounted(() => {
  loadPayments()
})

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
</script>
