<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
      <h2 class="text-sm font-semibold text-slate-200">Заказы</h2>
      <div v-if="pending" class="mt-2 text-sm text-slate-400">Загрузка заказов…</div>
      <div v-else-if="error" class="mt-2 text-sm text-rose-400">Не удалось загрузить список заказов.</div>
      <div v-else class="mt-4 overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="text-slate-400">
            <tr class="border-b border-slate-800/70">
              <th class="px-3 py-2">ID</th>
              <th class="px-3 py-2">Статус</th>
              <th class="px-3 py-2">Материал</th>
              <th class="px-3 py-2">Принтер</th>
              <th class="px-3 py-2">Время, мин</th>
              <th class="px-3 py-2">Цена</th>
              <th class="px-3 py-2">Создан</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in orders ?? []"
              :key="order.id"
              class="border-b border-slate-900/70 text-slate-200"
            >
              <td class="px-3 py-2 font-medium">{{ order.id }}</td>
              <td class="px-3 py-2">{{ order.status }}</td>
              <td class="px-3 py-2">{{ order.material_details?.name ?? '—' }}</td>
              <td class="px-3 py-2">{{ order.printer_details?.model_name ?? '—' }}</td>
              <td class="px-3 py-2">{{ order.estimated_time ?? '—' }}</td>
              <td class="px-3 py-2">{{ order.final_price ? `${order.final_price} ₽` : '—' }}</td>
              <td class="px-3 py-2">{{ formatDate(order.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const adminApi = useAdminApi()
const { data: orders, pending, error } = await useAsyncData('admin-orders', () => adminApi.listOrders())

function formatDate(value: string): string {
  return new Date(value).toLocaleString('ru-RU')
}
</script>
