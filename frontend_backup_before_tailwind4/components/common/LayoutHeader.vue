<template>
  <header class="sticky top-0 z-50 bg-slate-950/70 backdrop-blur-md">
    <div class="relative">
      <div
        class="pointer-events-none absolute inset-x-0 -bottom-8 h-8 bg-gradient-to-b from-slate-950/70 via-slate-950/30 to-transparent"
      />

      <div class="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-[10px]">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-3 rounded-full bg-[radial-gradient(circle_at_0_0,_rgba(56,189,248,0.18),_transparent_60%)] px-[10px] py-[10px] shadow-[0_0_20px_rgba(37,99,235,0.12)]"
        >
          <span
            class="inline-flex h-[25px] w-[25px] items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-600 to-violet-600 shadow-[0_0_16px_rgba(37,99,235,0.45)]"
            aria-hidden="true"
          />
          <span class="text-sm font-extrabold tracking-[0.22em]">2GTECHLAB</span>
        </NuxtLink>

        <nav class="hidden items-center gap-6 md:flex">
          <NuxtLink
            v-for="item in navigationItems"
            :key="item.to"
            :to="item.to"
            class="text-sm font-semibold text-slate-200 transition-colors duration-200 hover:text-cyan-300"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="md:hidden">
          <AppButton to="/order" variant="primary" size="sm">Заказать</AppButton>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const navigationItems = [
  { label: 'Главная', to: '/' },
  { label: 'Заказать', to: '/order' },
  { label: 'Рассчитать', to: '/calculator' },
  { label: 'Магазин', to: '/catalog/shop' },
  { label: 'Загрузка', to: '/upload' },
  { label: 'Модели', to: '/models' },
  { label: 'О нас', to: '/about' },
  { label: 'Войти', to: '/auth/login' },
] as const;
</script>
