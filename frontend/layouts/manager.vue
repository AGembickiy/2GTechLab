<template>
  <div
    class="min-h-screen flex flex-col bg-gradient-to-br from-graphite via-black to-titanium font-sans antialiased selection:bg-indigo-500/30"
  >
    <AppHeader />

    <main class="flex-grow w-full">
      <div class="container-main py-8">
        <slot />
      </div>
    </main>

    <AppFooter />
  </div>
</template>
