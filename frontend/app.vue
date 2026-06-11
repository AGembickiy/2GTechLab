<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// Ленивая загрузка компонентов
const ThreeViewer = defineAsyncComponent(
  () => import('~/components/ThreeViewer.vue')
)
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
