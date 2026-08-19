<script setup lang="ts">
import { computed, ref, watch } from 'vue';

interface OrderFormModel {
  copies: number
  postProcessing: Array<'sanding' | 'priming' | 'painting'>
  comment: string
}

const modelValue = defineModel<OrderFormModel>({
  required: true,
});

const prototypeStrength = ref(5);

watch(prototypeStrength, (value) => {
  const normalized = Math.min(
    100,
    Math.max(5, Math.round(value / 5) * 5),
  );

  if (normalized !== value) {
    prototypeStrength.value = normalized;
  }
});

const prototypeLabel = computed(() => {
  if (prototypeStrength.value < 34) {
    return 'Стандартный прототип';
  }

  if (prototypeStrength.value < 67) {
    return 'Прочный прототип';
  }

  return 'Монолитный прототип';
});

const postProcessingOptions = [
  {
    value: 'sanding',
    label: 'Шлифовка / полировка',
  },
  {
    value: 'priming',
    label: 'Нанесение грунтовки',
  },
  {
    value: 'painting',
    label: 'Покраска',
  },
] as const;
</script>

<template>
  <section class="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl">
    <!-- Заголовок -->
    <div class="border-b border-white/[0.06] px-5 py-5 sm:px-6">
      <div class="flex items-start gap-4">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 text-white shadow-[0_0_22px_rgba(99,102,241,0.2)]"
        >
          <span class="text-lg">⚙</span>
        </div>

        <div class="min-w-0">
          <h2 class="text-base font-bold tracking-tight text-white">
            Параметры изготовления
          </h2>

          <p class="mt-1 text-xs leading-relaxed text-slate-400">
            Настройте качество, количество и дополнительную обработку модели.
          </p>
        </div>
      </div>
    </div>

    <!-- Основные параметры -->
    <div class="px-5 py-5 sm:px-6">
      <div class="grid gap-5 md:grid-cols-2">
        <!-- Тип прототипа -->
        <div class="rounded-[18px] bg-white/[0.025] p-4">
          <div class="mb-4 flex items-center justify-between gap-3">
            <label class="text-xs font-semibold text-slate-200">
              Тип прототипа
            </label>

            <span
              class="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-300"
            >
              {{ prototypeStrength }}%
            </span>
          </div>

          <input
            v-model.number="prototypeStrength"
            type="range"
            min="5"
            max="100"
            step="5"
            class="prototype-range w-full cursor-pointer"
          >

          <div class="mt-3 flex items-center justify-between gap-3">
            <span class="text-[11px] text-slate-500">
              Стандарт
            </span>

            <span class="text-xs font-semibold text-indigo-300">
              {{ prototypeLabel }}
            </span>

            <span class="text-[11px] text-slate-500">
              Монолит
            </span>
          </div>
        </div>

        <!-- Количество -->
        <div class="rounded-[18px] bg-white/[0.025] p-4">
          <label
            class="mb-3 block text-xs font-semibold text-slate-200"
            for="copies"
          >
            Количество штук
          </label>

          <input
            id="copies"
            v-model.number="modelValue.copies"
            type="number"
            min="1"
            class="w-full rounded-xl bg-white/[0.025] px-4 py-3 text-sm font-semibold text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20"
          >

          <p class="mt-2 text-[11px] leading-relaxed text-slate-500">
            Укажите необходимое количество экземпляров.
          </p>
        </div>
      </div>

      <!-- Постобработка -->
      <div class="mt-5 rounded-[18px] bg-white/[0.025] p-4">
        <div class="mb-4">
          <div class="text-xs font-semibold text-slate-200">
            Постобработка
          </div>

          <p class="mt-1 text-[11px] leading-relaxed text-slate-500">
            Дополнительные работы после печати.
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-3">
          <label
            v-for="option in postProcessingOptions"
            :key="option.value"
            class="group flex cursor-pointer items-center gap-3 rounded-xl bg-white/[0.025] px-3 py-3 text-xs text-slate-300 transition hover:bg-indigo-500/[0.06]"
          >
            <input
              v-model="modelValue.postProcessing"
              type="checkbox"
              :value="option.value"
              class="h-4 w-4 shrink-0 cursor-pointer rounded border-white/10 bg-black/30 text-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >

            <span class="leading-relaxed">
              {{ option.label }}
            </span>
          </label>
        </div>
      </div>

      <!-- Комментарий -->
      <div class="mt-5">
        <label
          class="mb-2 block text-xs font-semibold text-slate-200"
          for="order-comment"
        >
          Комментарий к заказу
        </label>

        <textarea
          id="order-comment"
          v-model="modelValue.comment"
          rows="5"
          placeholder="Дополнительные требования к изготовлению..."
          class="min-h-[130px] w-full resize-y rounded-xl bg-white/[0.025] px-4 py-3 text-sm leading-relaxed text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20"
        />

        <p class="mt-2 text-[11px] leading-relaxed text-slate-500">
          Например: требования к поверхности, цвету, обработке или другим
          особенностям изготовления.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.prototype-range {
  height: 5px;
  appearance: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  outline: none;
}

.prototype-range::-webkit-slider-thumb {
  width: 17px;
  height: 17px;
  appearance: none;
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  background: #4f46e5;
  box-shadow:
    0 4px 14px rgba(79, 70, 229, 0.35),
    0 0 0 4px rgba(79, 70, 229, 0.12);
}

.prototype-range::-moz-range-thumb {
  width: 17px;
  height: 17px;
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  background: #4f46e5;
  box-shadow:
    0 4px 14px rgba(79, 70, 229, 0.35),
    0 0 0 4px rgba(79, 70, 229, 0.12);
}

.prototype-range::-webkit-slider-runnable-track {
  height: 5px;
  border-radius: 999px;
  background: linear-gradient(
    to right,
    #4f46e5 0%,
    #6366f1 50%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.08) 100%
  );
}

.prototype-range::-moz-range-track {
  height: 5px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.prototype-range:focus-visible {
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);
}
</style>