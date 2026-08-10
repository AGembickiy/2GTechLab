<template>
  <div class="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased">
    <div class="flex min-h-screen">
      <aside
        class="flex w-64 shrink-0 flex-col border-r border-slate-800/80 bg-slate-900/80 backdrop-blur-md"
      >
        <div class="border-b border-slate-800/80 px-5 py-5">
          <NuxtLink
            to="/admin"
            class="text-sm font-extrabold tracking-[0.18em] text-slate-100 transition-colors hover:text-cyan-300"
          >
            АДМИН-ПАНЕЛЬ
          </NuxtLink>
          <p class="mt-1 text-xs text-slate-500">2GTechLab</p>
        </div>

        <nav class="flex flex-1 flex-col gap-1 px-3 py-4">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors"
            :class="
              route.path === item.to
                ? 'bg-cyan-500/15 text-cyan-300'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
            "
          >
            <UIcon :name="item.icon" class="h-5 w-5 shrink-0 opacity-90" />
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="border-t border-slate-800/80 p-4">
          <AppButton
            block
            variant="secondary"
            icon="i-heroicons-arrow-left-on-rectangle-20-solid"
            @click="onLogout"
          >
            Выйти
          </AppButton>
          <NuxtLink
            to="/"
            class="mt-3 block text-center text-xs font-medium text-slate-500 transition-colors hover:text-cyan-400"
          >
            На сайт
          </NuxtLink>
        </div>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <header
          class="border-b border-slate-800/80 bg-slate-950/50 px-6 py-4 backdrop-blur-sm"
        >
          <h1 class="text-lg font-bold text-slate-100">{{ pageTitle }}</h1>
          <p v-if="pageSubtitle" class="mt-0.5 text-sm text-slate-500">{{ pageSubtitle }}</p>
        </header>
        <main class="flex-1 overflow-auto p-6">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { logout } = useAdminAuth()

const navItems = [
  { label: 'Аналитика', to: '/admin/analytics', icon: 'i-heroicons-chart-bar' },
  { label: 'Заказы', to: '/admin/orders', icon: 'i-heroicons-clipboard-document-list' },
  { label: 'Финансы', to: '/admin/finance', icon: 'i-heroicons-banknotes' },
  { label: 'Оборудование', to: '/admin/equipment', icon: 'i-heroicons-wrench-screwdriver' },
  { label: 'Склад', to: '/admin/warehouse', icon: 'i-heroicons-cube' },
  { label: 'Пользователи', to: '/admin/users', icon: 'i-heroicons-users' },
] as const

const titles: Record<string, { title: string; subtitle?: string }> = {
  '/admin': { title: 'Панель', subtitle: 'Обзор' },
  '/admin/analytics': { title: 'Аналитика', subtitle: 'Показатели и отчёты' },
  '/admin/orders': { title: 'Заказы', subtitle: 'Список и статусы заказов' },
  '/admin/finance': { title: 'Финансы', subtitle: 'Доходы, расходы, счета' },
  '/admin/equipment': { title: 'Оборудование', subtitle: 'Принтеры и станки' },
  '/admin/warehouse': { title: 'Склад', subtitle: 'Остатки и перемещения' },
  '/admin/users': { title: 'Пользователи', subtitle: 'Учётные записи' },
}

const pageTitle = computed(() => titles[route.path]?.title ?? 'Админ-панель')
const pageSubtitle = computed(() => titles[route.path]?.subtitle)

function onLogout() {
  logout()
  router.push('/auth/login')
}
</script>
