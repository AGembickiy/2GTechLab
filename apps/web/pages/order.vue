<template>
  <div class="space-y-4">
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
</template>

<script setup lang="ts">
import OrderForm from '~/components/order/OrderForm.vue';
import OrderSummary from '~/components/order/OrderSummary.vue';
</script>

