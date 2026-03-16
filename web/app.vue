<template>
  <div class="app">
    <header class="app-header">
      <NuxtLink href="/" class="logo">
        2GTECHLAB
      </NuxtLink>

      <nav class="nav">
        <NuxtLink href="/">Главная</NuxtLink>
        <NuxtLink href="/order">Заказать</NuxtLink>
        <NuxtLink href="/calculator">Рассчитать</NuxtLink>
        <NuxtLink href="/shop">Магазин</NuxtLink>
        <NuxtLink href="/models">Модели</NuxtLink>
        <NuxtLink href="/about">О нас</NuxtLink>
        <button type="button" class="nav__auth-trigger">
          Войти
        </button>
      </nav>
    </header>

    <HeroSlider v-if="route.path === '/'" />

    <main class="app-main">
      <NuxtPage />
    </main>

    <footer class="app-footer">
      © 2026 Платформа 3D‑печати
    </footer>
  </div>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components';
import { useRoute } from '#app';
import HeroSlider from '~/components/HeroSlider.vue';

const route = useRoute();
</script>

