<template>
  <footer class="border-t border-white/10 bg-black/20 py-12 backdrop-blur-xl">
    <AppContainer class="flex flex-col items-center justify-between gap-6 md:flex-row">
      <div class="flex items-center gap-3">

        <span class="text-sm font-bold uppercase tracking-[0.2em] text-white">
          TechLab
        </span>
      </div>

      <p class="text-sm text-slate-400">
        © {{ new Date().getFullYear() }} TechLab. Все права защищены.
      </p>
    </AppContainer>
  </footer>
</template>
