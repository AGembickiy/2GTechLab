<template>
  <div class="space-y-6">
    <!-- Уведомления -->
    <div v-if="notification.message" class="fixed right-6 top-6 z-50 max-w-sm">
      <AppAlert
        :variant="notification.variant"
        :title="notification.title"
        :message="notification.message"
        :closable="true"
        @close="clearNotification"
      />
    </div>
    <!-- Статус аутентификации -->
    <div class="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
      <h2 class="text-lg font-semibold text-slate-100">Проверка доступа</h2>
      <div class="mt-4 space-y-2 text-sm text-slate-300">
        <div class="flex items-center justify-between">
          <span>Статус:</span>
          <span class="font-medium text-emerald-400">
            {{ authStore.isAuthenticated ? '✓ Авторизован' : '✗ Не авторизован' }}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span>Логин:</span>
          <span class="font-medium text-slate-100">{{ authStore.user?.username || '—' }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span>Email:</span>
          <span class="font-medium text-slate-100">{{ authStore.user?.email || '—' }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span>Роль:</span>
          <span class="font-medium text-amber-400">{{ authStore.userRole || '—' }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span>Токен доступа:</span>
          <span class="font-mono text-xs text-slate-400">
            {{ authStore.accessToken ? 'Есть (скрыт)' : 'Нет' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Данные для проверки -->
    <div class="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
      <h2 class="text-lg font-semibold text-slate-100">Данные для входа</h2>
      <div class="mt-4 space-y-3">
        <div class="rounded-lg border border-slate-800 bg-slate-950 p-3">
          <div class="text-xs text-slate-500">Логин</div>
          <div class="font-mono text-sm font-medium text-emerald-400">admin</div>
        </div>
        <div class="rounded-lg border border-slate-800 bg-slate-950 p-3">
          <div class="text-xs text-slate-500">Пароль</div>
          <div class="font-mono text-sm font-medium text-emerald-400">admin</div>
        </div>
        <div class="rounded-lg border border-slate-800 bg-slate-950 p-3">
          <div class="text-xs text-slate-500">Роль</div>
          <div class="font-mono text-sm font-medium text-amber-400">admin</div>
        </div>
      </div>

      <button
        @click="showLoginModal = true"
        class="mt-4 w-full rounded-lg bg-amber-500 py-2 px-4 font-medium text-slate-900 hover:bg-amber-400"
      >
        Показать форму входа
      </button>
    </div>

    <!-- Быстрый переход -->
    <div class="grid gap-4 sm:grid-cols-2">
      <NuxtLink
        to="/admin/users"
        class="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 transition-colors hover:border-amber-500/50"
      >
        <div class="flex items-center gap-3">
          <div class="rounded-lg bg-amber-500/20 p-2">
            <svg class="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-slate-100">Пользователи</h3>
            <p class="text-sm text-slate-400">Управление пользователями</p>
          </div>
        </div>
      </NuxtLink>

      <NuxtLink
        to="/admin/orders"
        class="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 transition-colors hover:border-amber-500/50"
      >
        <div class="flex items-center gap-3">
          <div class="rounded-lg bg-emerald-500/20 p-2">
            <svg class="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-slate-100">Заказы</h3>
            <p class="text-sm text-slate-400">Список всех заказов</p>
          </div>
        </div>
      </NuxtLink>

      <NuxtLink
        to="/admin/warehouse"
        class="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 transition-colors hover:border-amber-500/50"
      >
        <div class="flex items-center gap-3">
          <div class="rounded-lg bg-blue-500/20 p-2">
            <svg class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-slate-100">Склад</h3>
            <p class="text-sm text-slate-400">Управление товарами</p>
          </div>
        </div>
      </NuxtLink>

      <NuxtLink
        to="/admin/finance"
        class="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 transition-colors hover:border-amber-500/50"
      >
        <div class="flex items-center gap-3">
          <div class="rounded-lg bg-purple-500/20 p-2">
            <svg class="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-slate-100">Финансы</h3>
            <p class="text-sm text-slate-400">Финансовая отчетность</p>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Модальное окно входа -->
    <div
      v-if="showLoginModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
    >
      <div class="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-100">Вход в систему</h3>
          <button
            @click="showLoginModal = false"
            class="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-300">Логин</label>
            <input
              v-model="loginForm.username"
              type="text"
              required
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="admin"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-300">Пароль</label>
            <input
              v-model="loginForm.password"
              type="password"
              required
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full rounded-lg bg-amber-500 py-2 font-medium text-slate-900 hover:bg-amber-400 disabled:opacity-50"
          >
            {{ loading ? 'Вход...' : 'Войти' }}
          </button>

          <div class="text-xs text-slate-500">
            <p>Для входа используйте:</p>
            <p>Логин: <span class="font-mono text-emerald-400">admin</span></p>
            <p>Пароль: <span class="font-mono text-emerald-400">admin</span></p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth-check',
})

const authStore = useAuthStore()
const showLoginModal = ref(false)
const loading = ref(false)
const loginError = ref('')

const loginForm = reactive({
  username: 'admin',
  password: 'admin',
})

const notification = ref({
  variant: 'info' as const,
  title: '',
  message: '',
})

function showNotification(variant: 'success' | 'error', title: string, message: string) {
  notification.value = {
    variant,
    title,
    message,
  }
}

function clearNotification() {
  notification.value = {
    variant: 'info' as const,
    title: '',
    message: '',
  }
}

async function handleLogin() {
  loading.value = true
  loginError.value = ''

  try {
    await authStore.login(loginForm.username, loginForm.password)
    showNotification('success', 'Успех', 'Вы успешно вошли в систему')
    showLoginModal.value = false
  } catch (error: any) {
    loginError.value = error?.message || 'Не удалось войти в систему'
    showNotification('error', 'Ошибка', loginError.value)
  } finally {
    loading.value = false
  }
}
</script>
