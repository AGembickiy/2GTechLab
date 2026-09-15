<template>
  <div
    class="flex min-h-screen flex-col bg-gradient-to-br from-graphite via-black to-titanium text-white"
  >
    <header
      class="shrink-0 border-b border-white/10 bg-black/30 px-6 py-5 backdrop-blur-md lg:px-8"
    >
      <h1 class="text-2xl font-bold tracking-tight text-white">
        {{ pageTitle }}
      </h1>

      <p
        v-if="pageSubtitle"
        class="mt-1 text-sm text-slate-400"
      >
        {{ pageSubtitle }}
      </p>
    </header>

    <div class="flex min-h-0 flex-1">
      <aside
        class="flex w-64 shrink-0 flex-col border-r border-white/10 bg-black/40 backdrop-blur-md"
      >
        <nav class="flex flex-col gap-2 px-3 py-5">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all"
            :class="
              route.path === item.to
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            "
          >
            <Icon
              :name="item.icon"
              class="h-5 w-5 shrink-0"
              :class="
                route.path === item.to
                  ? 'text-white'
                  : 'text-slate-500'
              "
            />
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="border-t border-white/10 p-4">
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
            class="mt-3 block rounded-xl py-2 text-center text-xs font-medium text-slate-500 transition-colors hover:bg-white/5 hover:text-indigo-400"
          >
            На сайт
          </NuxtLink>
        </div>
      </aside>

      <main class="min-w-0 flex-1 overflow-auto p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const { logout } = useAdminAuth();

const navItems = [
  {
    label: 'Аналитика',
    to: '/admin/analytics',
    icon: 'i-heroicons-chart-bar',
  },
  {
    label: 'Заказы',
    to: '/admin/orders',
    icon: 'i-heroicons-clipboard-document-list',
  },
  {
    label: 'Финансы',
    to: '/admin/finance',
    icon: 'i-heroicons-banknotes',
  },
  {
    label: 'Оборудование',
    to: '/admin/equipment',
    icon: 'i-heroicons-wrench-screwdriver',
  },
  {
    label: 'Склад',
    to: '/admin/warehouse',
    icon: 'i-heroicons-cube',
  },
  {
    label: 'Пользователи',
    to: '/admin/users',
    icon: 'i-heroicons-users',
  },
  {
    label: 'Сообщения',
    to: '/admin/messages',
    icon: 'i-heroicons-chat-bubble-left-right',
  },
  {
    label: 'Профиль',
    to: '/admin/profile',
    icon: 'i-heroicons-user-circle',
  },
  {
    label: 'Настройки сайта',
    to: '/admin/settings',
    icon: 'i-heroicons-cog-6-tooth',
  },
] as const;

const titles: Record<string, { title: string; subtitle?: string }> = {
  '/admin': {
    title: 'Панель',
    subtitle: 'Обзор',
  },
  '/admin/analytics': {
    title: 'Аналитика',
    subtitle: 'Показатели и отчёты',
  },
  '/admin/orders': {
    title: 'Заказы',
    subtitle: 'Список и статусы заказов',
  },
  '/admin/finance': {
    title: 'Финансы',
    subtitle: 'Доходы, расходы, счета',
  },
  '/admin/equipment': {
    title: 'Оборудование',
    subtitle: 'Принтеры и станки',
  },
  '/admin/warehouse': {
    title: 'Склад',
    subtitle: 'Остатки и перемещения',
  },
  '/admin/users': {
    title: 'Пользователи',
    subtitle: 'Учётные записи',
  },
  '/admin/messages': {
    title: 'Сообщения',
    subtitle: 'Обращения пользователей',
  },
  '/admin/profile': {
    title: 'Профиль',
    subtitle: 'Личные данные администратора',
  },
  '/admin/settings': {
    title: 'Настройки сайта',
    subtitle: 'Управление настройками frontend',
  },
};

const pageTitle = computed(
  () => titles[route.path]?.title ?? 'Админ-панель',
);

const pageSubtitle = computed(
  () => titles[route.path]?.subtitle,
);

function onLogout() {
  logout();
  router.push('/auth/login');
}
</script>
