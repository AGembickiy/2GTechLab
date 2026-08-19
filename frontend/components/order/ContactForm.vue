<script setup lang="ts">
import type { OrderFormState } from '~/composables/useOrderForm';

const modelValue = defineModel<OrderFormState>({
  required: true,
});
</script>

<template>
  <div class="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-5">
    <h2 class="text-sm font-semibold">
      Контактные данные
    </h2>

    <div class="mt-4 grid gap-4 md:grid-cols-2">
      <div>
        <label class="mb-2 block text-xs font-semibold text-slate-200">
          Имя / компания <span class="text-rose-300">*</span>
        </label>

        <input
          v-model="modelValue.name"
          type="text"
          class="w-full rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-400/20"
        >
      </div>

      <div>
        <label class="mb-2 block text-xs font-semibold text-slate-200">
          Телефон <span class="text-rose-300">*</span>
        </label>

        <input
          v-model="modelValue.phone"
          type="tel"
          class="w-full rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-400/20"
        >
      </div>

      <div>
        <label class="mb-2 block text-xs font-semibold text-slate-200">
          Email <span class="text-rose-300">*</span>
        </label>

        <input
          v-model="modelValue.email"
          type="email"
          placeholder="you@example.com"
          class="w-full rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-400/20"
        >
      </div>

      <div>
        <label class="mb-2 block text-xs font-semibold text-slate-200">
          Адрес доставки (если нужен)
        </label>

        <input
          v-model="modelValue.deliveryAddress"
          type="text"
          placeholder="Город, улица, дом, офис/квартира"
          class="w-full rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-400/20"
        >
      </div>
    </div>
  </div>
</template>
