<template>
  <div class="space-y-6">
    <div class="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
      <h1 class="text-xl font-semibold text-slate-100">
        dashboard
      </h1>
      <p class="mt-2 text-sm text-slate-400">
        Раздел находится в разработке.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'manager',
  middleware: 'auth-check',
})
</script>
