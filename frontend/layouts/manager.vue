<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <AppHeader />
    
    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>
    
    <!-- Footer -->
    <AppFooter />
  </div>
</template>
