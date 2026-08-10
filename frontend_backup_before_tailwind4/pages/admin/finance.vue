<template>
  <div class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="card in financeCards"
        :key="card.label"
        class="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4"
      >
        <p class="text-xs uppercase tracking-wide text-slate-500">{{ card.label }}</p>
        <p class="mt-2 text-2xl font-bold text-slate-100">{{ card.value }}</p>
      </article>
    </div>
    <div class="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
      <h2 class="text-sm font-semibold text-slate-200">Статус загрузки данных</h2>
      <p v-if="pending" class="mt-2 text-sm text-slate-400">Обновляем финансовую сводку…</p>
      <p v-else-if="error" class="mt-2 text-sm text-rose-400">
        Не удалось получить финансовые показатели.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const adminApi = useAdminApi()
const { data: finance, pending, error } = await useAsyncData('admin-finance', () => adminApi.getFinance())

const financeCards = computed(() => [
  { label: 'Выручка', value: `${Number(finance.value?.total_revenue ?? 0).toFixed(2)} ₽` },
  { label: 'Средний чек', value: `${Number(finance.value?.avg_check ?? 0).toFixed(2)} ₽` },
  { label: 'Выполненные заказы', value: String(finance.value?.completed_orders_count ?? 0) },
  { label: 'Заказы в работе', value: String(finance.value?.in_progress_orders_count ?? 0) },
  {
    label: 'Пайплайн заказов',
    value: `${Number(finance.value?.estimated_pipeline_value ?? 0).toFixed(2)} ₽`,
  },
])
</script>
