<template>
  <div class="min-h-screen flex flex-col bg-slate-950 font-sans antialiased selection:bg-blue-500/30">
    <LayoutHeader />
    <main class="flex-grow w-full">
      <slot />
    </main>
    <footer class="border-t border-slate-900 py-12 bg-slate-950">
      <UContainer class="flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="flex items-center gap-2 opacity-50">
          <div class="h-6 w-6 rounded-full bg-slate-700"></div>
          <span class="text-sm font-bold uppercase tracking-tighter text-white">2GTechLab</span>
        </div>
        <p class="text-slate-500 text-sm">© {{ new Date().getFullYear() }} 2GTechLab. Все права защищены.</p>
      </UContainer>
    </footer>
  </div>
</template>
