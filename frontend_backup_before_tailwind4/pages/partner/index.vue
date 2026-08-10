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
        <h2 class="text-lg font-bold text-slate-100">Мои модели</h2>
        <AppButton color="primary" @click="navigateTo('/partner/models')">
          <template #icon><UIcon name="i-heroicons-plus" class="h-4 w-4" /></template>
          Добавить модель
        </AppButton>
      </div>

      <div v-if="pending" class="mt-4 text-sm text-slate-400">Загрузка…</div>
      <div v-else-if="error" class="mt-4 text-sm text-rose-400">Не удалось загрузить модели.</div>
      <div v-else-if="models.length === 0" class="mt-4 text-sm text-slate-400">
        У вас пока нет моделей.
      </div>
      <div v-else class="mt-4 grid gap-4 sm:grid-cols-2">
        <div
          v-for="model in models"
          :key="model.id"
          class="rounded-lg border border-slate-800/60 bg-slate-950/30 p-4"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800/50">
              <UIcon name="i-heroicons-cube" class="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <p class="font-semibold text-slate-200">{{ model.name }}</p>
              <p class="text-xs text-slate-400">{{ formatSize(model.size) }}</p>
            </div>
          </div>
          <div class="mt-3 flex items-center justify-between text-sm">
            <div class="text-slate-300">
              {{ model.downloads }} загрузок
            </div>
            <div class="font-bold text-slate-100">
              {{ formatCurrency(model.royalty) }}
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

const summaryCards = computed(() => [
  { label: 'Всего моделей', value: '0' },
  { label: 'Загрузок', value: '0' },
  { label: 'Доход', value: '0 ₽' },
])

function formatSize(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
