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
import { authService } from '@/services/authService';

const route = useRoute();
const router = useRouter();


const navItems = [
  {
    label: 'Создать заказ',
    to: '/client/order',
    icon: 'i-heroicons-plus',
  },
  {
    label: 'Мои заказы',
    to: '/client/my-orders',
    icon: 'i-heroicons-shopping-bag',
  },
  {
    label: 'Модели',
    to: '/client/models',
    icon: 'i-heroicons-cube',
  },
  {
    label: 'Сообщения',
    to: '/client/messages',
    icon: 'i-heroicons-chat-bubble-left-right',
  },
  {
    label: 'Профиль',
    to: '/client/profile',
    icon: 'i-heroicons-user-circle',
  },
] as const;

const titles: Record<string, { title: string; subtitle?: string }> = {
  '/client': {
    title: 'Личный кабинет',
    subtitle: 'Обзор',
  },
  '/client/order': {
    title: 'Создать заказ',
    subtitle: 'Оформление нового заказа',
  },
  '/client/my-orders': {
    title: 'Мои заказы',
    subtitle: 'История и статусы заказов',
  },
  '/client/models': {
    title: 'Модели',
    subtitle: 'Ваши 3D-модели',
  },
  '/client/messages': {
    title: 'Сообщения',
    subtitle: 'Обращения и переписка',
  },
  '/client/profile': {
    title: 'Профиль',
    subtitle: 'Личные данные',
  },
};

const pageTitle = computed(
  () => titles[route.path]?.title ?? 'Личный кабинет',
);

const pageSubtitle = computed(
  () => titles[route.path]?.subtitle,
);

async function onLogout() {
  try {
    await authService.logout();
  } finally {
    await router.push('/auth/login');
  }
}
</script>
