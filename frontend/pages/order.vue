<template>
  <div class="w-full py-6 px-4">
    <div class="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 class="text-2xl font-bold">Заказать 3D‑печать</h1>
        <p class="mt-2 text-sm text-slate-300">
          Загрузите модель или отправьте эскиз — система рассчитает примерную стоимость и время печати.
        </p>
      </div>

      <div class="grid gap-6 lg:grid-cols-[1fr_min(360px,100%)]">
        <OrderForm />
        <OrderSummary />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
