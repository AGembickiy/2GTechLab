<template>
  <div class="sr-only" aria-live="polite">Перенаправление в раздел аналитики…</div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

await navigateTo('/admin/analytics', { replace: true })
</script>
