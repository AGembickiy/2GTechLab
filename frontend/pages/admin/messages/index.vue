<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth-check',
});
</script>

<template>
  <div class="space-y-6">
    <section
      class="rounded-2xl border border-white/10 bg-white/[0.025] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl"
    >
      <p
        class="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400"
      >
        TechLab Control Center
      </p>

      <h2 class="mt-2 text-2xl font-black tracking-tight text-white">
        Сообщения
      </h2>

      <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
        Здесь будут отображаться сообщения от клиентов, менеджеров и партнёров.
      </p>
    </section>
  </div>
</template>
