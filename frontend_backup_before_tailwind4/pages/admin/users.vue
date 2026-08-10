<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
      <h2 class="text-sm font-semibold text-slate-200">Пользователи</h2>
      <div v-if="pending" class="mt-2 text-sm text-slate-400">Загрузка пользователей…</div>
      <div v-else-if="error" class="mt-2 text-sm text-rose-400">
        Не удалось загрузить список пользователей.
      </div>
      <div v-else class="mt-4 overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="text-slate-400">
            <tr class="border-b border-slate-800/70">
              <th class="px-3 py-2">ID</th>
              <th class="px-3 py-2">Логин</th>
              <th class="px-3 py-2">Email</th>
              <th class="px-3 py-2">Роль</th>
              <th class="px-3 py-2">Статус</th>
              <th class="px-3 py-2">Дата регистрации</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in users ?? []"
              :key="user.id"
              class="border-b border-slate-900/70 text-slate-200"
            >
              <td class="px-3 py-2">{{ user.id }}</td>
              <td class="px-3 py-2 font-medium">{{ user.username }}</td>
              <td class="px-3 py-2">{{ user.email || '—' }}</td>
              <td class="px-3 py-2">{{ user.role }}</td>
              <td class="px-3 py-2">{{ user.is_active ? 'Активен' : 'Отключён' }}</td>
              <td class="px-3 py-2">{{ formatDate(user.date_joined) }}</td>
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
const { data: users, pending, error } = await useAsyncData('admin-users', () => adminApi.listUsers())

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('ru-RU')
}
</script>
