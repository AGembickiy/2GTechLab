<template>
  <div class="min-h-dvh overflow-x-hidden bg-slate-950 text-slate-100">
    <header
      class="sticky top-0 z-50 bg-slate-950/70 backdrop-blur-md"
    >
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
              to="/"
              class="text-sm font-semibold text-slate-200 transition hover:text-white"
            >
              Главная
            </NuxtLink>
            <NuxtLink
              to="/order"
              class="text-sm font-semibold text-slate-200 transition hover:text-white"
            >
              Заказать
            </NuxtLink>
            <NuxtLink
              to="/calculator"
              class="text-sm font-semibold text-slate-200 transition hover:text-white"
            >
              Рассчитать
            </NuxtLink>
            <NuxtLink
              to="/shop"
              class="text-sm font-semibold text-slate-200 transition hover:text-white"
            >
              Магазин
            </NuxtLink>
            <NuxtLink
              to="/models"
              class="text-sm font-semibold text-slate-200 transition hover:text-white"
            >
              Модели
            </NuxtLink>
            <NuxtLink
              to="/about"
              class="text-sm font-semibold text-slate-200 transition hover:text-white"
            >
              О нас
            </NuxtLink>

            <UButton color="primary" variant="soft" size="sm">Войти</UButton>
          </nav>

            <div class="md:hidden">
              <UButton to="/order" color="primary" size="sm">Заказать</UButton>
            </div>
          </div>
        </div>
    </header>

    <HeroSlider v-if="route.path === '/'" />

    <main class="mx-auto w-full max-w-6xl px-4 py-6">
      <NuxtPage />
    </main>

    <footer class="border-t border-slate-800/60 bg-slate-950 px-4 py-4 text-center text-xs text-slate-400">
      © 2026 Платформа 3D‑печати
    </footer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
</script>

