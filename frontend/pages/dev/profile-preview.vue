<script setup lang="ts">
const authStore = useAuthStore();

if (!import.meta.dev) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Not Found',
  });
}

const profiles = [
  {
    role: 'client',
    label: 'Клиент',
    path: '/client/profile?preview=1',
    user: {
      id: 1001,
      username: 'client-demo',
      email: 'client@example.com',
      role: 'client',
      phone: '+7 900 000 00 01',
      address: 'Москва',
    },
  },
  {
    role: 'manager',
    label: 'Менеджер',
    path: '/manager/profile?preview=1',
    user: {
      id: 1002,
      username: 'manager-demo',
      email: 'manager@example.com',
      role: 'manager',
      phone: '+7 900 000 00 02',
      address: 'Москва',
    },
  },
  {
    role: 'partner',
    label: 'Партнёр',
    path: '/partner/profile?preview=1',
    user: {
      id: 1003,
      username: 'partner-demo',
      email: 'partner@example.com',
      role: 'partner',
      phone: '+7 900 000 00 03',
      address: 'Москва',
    },
  },
  {
    role: 'admin',
    label: 'Администратор',
    path: '/admin/profile?preview=1',
    user: {
      id: 1004,
      username: 'admin-demo',
      email: 'admin@example.com',
      role: 'admin',
      phone: '+7 900 000 00 04',
      address: 'Москва',
    },
  },
] as const;

function openProfile(profile: (typeof profiles)[number]) {
  authStore.setTokens('frontend-preview-token');
  authStore.setUser(profile.user);

  navigateTo(profile.path);
}
</script>

<template>
  <section class="mx-auto w-full max-w-4xl py-8">
    <div class="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-xl">
      <p class="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">
        Frontend Preview
      </p>

      <h1 class="mt-2 text-2xl font-black tracking-tight text-slate-100">
        Предпросмотр личных кабинетов
      </h1>

      <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
        Временный режим для визуальной проверки интерфейса.
        Backend для просмотра интерфейса не требуется.
      </p>

      <div class="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          v-for="profile in profiles"
          :key="profile.role"
          type="button"
          class="rounded-xl border border-slate-800/70 bg-slate-950/30 px-4 py-4 text-left transition hover:border-indigo-400/40 hover:bg-indigo-500/[0.06]"
          @click="openProfile(profile)"
        >
          <div class="text-sm font-bold text-slate-100">
            {{ profile.label }}
          </div>

          <div class="mt-1 text-xs text-slate-500">
            {{ profile.user.username }} · {{ profile.user.phone }}
          </div>
        </button>
      </div>
    </div>
  </section>
</template>
