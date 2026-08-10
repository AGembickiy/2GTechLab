<template>
  <div class="min-h-screen flex flex-col bg-slate-950 font-sans antialiased selection:bg-blue-500/30">
    <AppHeader />

    <main class="flex-grow w-full">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>