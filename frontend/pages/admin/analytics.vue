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
      <h2 class="text-sm font-semibold text-slate-200">Топ материалов по заказам</h2>
      <div v-if="pending" class="mt-3 text-sm text-slate-400">Загрузка…</div>
      <div v-else-if="error" class="mt-3 text-sm text-rose-400">Не удалось загрузить аналитику.</div>
      <ul v-else class="mt-3 space-y-2 text-sm text-slate-300">
        <li
          v-for="material in analytics?.popular_materials ?? []"
          :key="material.material__name ?? 'unknown'"
          class="flex items-center justify-between rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2"
        >
          <span>{{ material.material__name ?? 'Без материала' }}</span>
          <span class="font-semibold text-slate-100">{{ material.count }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const adminApi = useAdminApi()
const { data: analytics, pending, error } = await useAsyncData('admin-analytics', () =>
  adminApi.getAnalytics(),
)

const summaryCards = computed(() => [
  { label: 'Всего заказов', value: String(analytics.value?.orders_count ?? 0) },
  { label: 'Выручка', value: `${Number(analytics.value?.total_revenue ?? 0).toFixed(2)} ₽` },
  { label: 'Средний чек', value: `${Number(analytics.value?.avg_check ?? 0).toFixed(2)} ₽` },
])
</script>
