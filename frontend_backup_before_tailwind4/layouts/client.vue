<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <LayoutHeader />
    
    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>
    
    <!-- Footer -->
    <footer class="py-6 bg-slate-900 border-t border-slate-800">
      <div class="container mx-auto px-4 text-center text-slate-400">
        <p>&copy; 2024 2GTechLab. Все права защищены.</p>
      </div>
    </footer>
  </div>
</template>
