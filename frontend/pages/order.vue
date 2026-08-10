```vue
<template>
  <div class="flex flex-col">

    <!-- Order -->
    <section class="bg-gradient-to-br from-graphite via-black to-titanium py-16">
      <AppContainer>
        <div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
          <OrderForm />

          <OrderSummary />
        </div>
      </AppContainer>
    </section>

  </div>
</template>

<script setup lang="ts">
</script>
```
