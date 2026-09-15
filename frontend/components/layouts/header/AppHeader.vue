<template>
  <header
    class="sticky top-0 z-50 border-b border-white/5 bg-black/20 backdrop-blur-2xl"
  >
    <div class="container-main">
      <div class="flex h-[78px] items-center justify-between">
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="group flex items-center gap-4"
        >
          <AppLogo size="md" />

          <div class="hidden sm:block">
            <div class="text-sm font-black tracking-[0.28em] text-white">
              TECHLAB
            </div>

            <div class="text-xs text-slate-400">
              Industrial 3D Printing
            </div>
          </div>
        </NuxtLink>


        <!-- Desktop Navigation -->
        <nav
          class="hidden items-center gap-8 lg:flex"
        >
          <NuxtLink
            v-for="item in navigationItems"
            :key="item.to"
            :to="item.to"
            class="text-sm font-medium transition-colors duration-200"
            :class="[
              route.path === item.to
                ? 'text-white'
                : 'text-slate-300 hover:text-indigo-300'
            ]"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>


        <!-- Actions -->
        <div class="flex items-center gap-5">
          <NuxtLink
            v-if="messagesPath"
            :to="messagesPath"
            class="text-sm font-semibold text-indigo-300 transition-colors duration-200 hover:text-indigo-200"
          >
            Сообщения
          </NuxtLink>

          <NuxtLink
            v-if="profilePath"
            :to="accountPath"
            class="text-sm font-semibold text-indigo-300 transition-colors duration-200 hover:text-indigo-200"
          >
            {{ authStore.getUserName }}
          </NuxtLink>

          <template v-if="!authStore.isAuthenticated">
            <NuxtLink
              to="/auth/login"
              class="text-sm font-medium text-slate-300 transition-colors duration-200 hover:text-white"
            >
              Войти
            </NuxtLink>

            <NuxtLink
              to="/auth/register"
              class="text-sm font-semibold text-white transition-colors duration-200 hover:text-indigo-300"
            >
              Регистрация
            </NuxtLink>
          </template>

          <button
            v-else
            type="button"
            class="text-sm font-medium text-slate-300 transition-colors duration-200 hover:text-white"
            @click="onLogout"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  </header>
</template>


<script setup lang="ts">
import { authService } from '@/services/authService';

const route = useRoute();
const authStore = useAuthStore();
const router = useRouter();

const navigationItems = computed(() => [
  {
    label: 'Главная',
    to: '/',
  },
  {
    label: 'Создать заказ',
    to: authStore.isAuthenticated && authStore.user?.role === 'client'
      ? '/client/order'
      : '/order',
  },
  {
    label: 'Каталог моделей',
    to: '/models',
  },
  {
    label: 'О компании',
    to: '/about',
  },
]);

async function onLogout() {
  try {
    await authService.logout();
  } catch {
    authStore.logout();
  } finally {
    await router.push('/auth/login');
  }
}

const accountPath = computed(() => {
  if (!authStore.isAuthenticated) {
    return '';
  }

  switch (authStore.user?.role) {
    case 'manager':
      return '/manager';
    case 'partner':
      return '/partner';
    case 'admin':
      return '/admin';
    case 'client':
    default:
      return '/client';
  }
});

const profilePath = computed(() => {
  if (!authStore.isAuthenticated) {
    return '';
  }

  switch (authStore.user?.role) {
    case 'manager':
      return '/manager/profile';
    case 'partner':
      return '/partner/profile';
    case 'admin':
      return '/admin/profile';
    case 'client':
    default:
      return '/client/profile';
  }
});

const messagesPath = computed(() => {
  if (!authStore.isAuthenticated) {
    return '';
  }

  switch (authStore.user?.role) {
    case 'manager':
      return '/manager/messages';
    case 'partner':
      return '/partner/messages';
    case 'client':
      return '/client/messages';
    case 'admin':
      return '';
    default:
      return '';
  }
});
</script>
