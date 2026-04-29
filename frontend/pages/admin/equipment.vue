<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
      <h2 class="text-sm font-semibold text-slate-200">Оборудование</h2>
      <div v-if="pending" class="mt-2 text-sm text-slate-400">Загрузка оборудования…</div>
      <div v-else-if="error" class="mt-2 text-sm text-rose-400">
        Не удалось загрузить список оборудования.
      </div>
      <div v-else class="mt-4 overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="text-slate-400">
            <tr class="border-b border-slate-800/70">
              <th class="px-3 py-2">ID</th>
              <th class="px-3 py-2">Модель</th>
              <th class="px-3 py-2">Ставка / час</th>
              <th class="px-3 py-2">Статус</th>
              <th class="px-3 py-2">Последнее ТО</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="printer in printers ?? []"
              :key="printer.id"
              class="border-b border-slate-900/70 text-slate-200"
            >
              <td class="px-3 py-2">{{ printer.id }}</td>
              <td class="px-3 py-2 font-medium">{{ printer.model_name }}</td>
              <td class="px-3 py-2">{{ printer.hourly_rate }} ₽</td>
              <td class="px-3 py-2">{{ printer.is_active ? 'Активен' : 'Выключен' }}</td>
              <td class="px-3 py-2">{{ printer.last_maintenance ?? '—' }}</td>
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
const { data: printers, pending, error } = await useAsyncData('admin-printers', () =>
  adminApi.listPrinters(),
)
</script>
