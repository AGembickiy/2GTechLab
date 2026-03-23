<script setup lang="ts">
interface OrderFormModel {
  file: File | null;
  quality: string;
  material: string;
  color: string;
  amsSlots: Array<{
    material: string;
    color: string;
  }>;
  printType: string;
  postProcessing: string[];
  comment: string;
  email: string;
}

const modelValue = defineModel<OrderFormModel>({ required: true });

// Keep AMS slot 1 in sync with single-material selections.
// This way the rest of the app can rely on `form.material/color` for pricing/submission,
// while the modal can edit `form.amsSlots`.
watch(
  () => [modelValue.material, modelValue.color, modelValue.printType],
  ([material, color, printType]) => {
    if (printType !== 'single') return;
    const slot0 = modelValue.amsSlots?.[0];
    if (!slot0) return;
    if (slot0.material !== material) slot0.material = material;
    if (slot0.color !== color) slot0.color = color;
  },
  { immediate: true },
);
</script>

<template>
  <div class="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-5">
    <h2 class="text-sm font-semibold">Параметры печати</h2>

    <div class="mt-4 grid gap-4 md:grid-cols-2">
      <div>
        <label class="mb-2 block text-xs font-semibold text-slate-200">
          Материал <span class="text-rose-300" v-if="modelValue.printType === 'single'">*</span>
        </label>
        <select
          v-if="modelValue.printType === 'single'"
          v-model="modelValue.material"
          class="w-full rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/20"
        >
          <option disabled value="">Выберите материал</option>
          <option value="pla">PLA (базовый пластик)</option>
          <option value="petg">PETG (повышенная прочность)</option>
          <option value="abs">ABS (термостойкий)</option>
        </select>
        <div v-else class="text-xs text-slate-400">
          Материал на AMS задаётся в модалке предпросмотра
        </div>
      </div>

      <div>
        <label class="mb-2 block text-xs font-semibold text-slate-200">
          Цвет <span class="text-rose-300" v-if="modelValue.printType === 'single'">*</span>
        </label>
        <select
          v-if="modelValue.printType === 'single'"
          v-model="modelValue.color"
          class="w-full rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/20"
        >
          <option disabled value="">Выберите цвет</option>
          <option value="white">Белый</option>
          <option value="black">Чёрный</option>
          <option value="gray">Серый</option>
          <option value="custom">Другой (уточнить)</option>
        </select>
        <div v-else class="text-xs text-slate-400">
          Цвет на AMS задаётся в модалке предпросмотра
        </div>
      </div>

      <div>
        <label class="mb-2 block text-xs font-semibold text-slate-200">Качество печати</label>
        <select
          v-model="modelValue.quality"
          class="w-full rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/20"
        >
          <option value="draft">Черновое качество</option>
          <option value="standard">Стандартное качество</option>
          <option value="high">Высокое качество</option>
        </select>
      </div>

      <div>
        <label class="mb-2 block text-xs font-semibold text-slate-200">Тип печати</label>
        <select
          v-model="modelValue.printType"
          class="w-full rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/20"
        >
          <option value="single">Один материал</option>
          <option value="multi">Несколько материалов / цветов</option>
        </select>
      </div>
    </div>

    <div class="mt-5 grid gap-4 md:grid-cols-2">
      <div class="rounded-xl border border-slate-800/60 bg-slate-950/20 p-4">
        <div class="mb-2 text-xs font-semibold text-slate-200">Доп. обработка</div>
        <div class="space-y-2 text-sm text-slate-200">
          <label class="flex items-center gap-2">
            <input v-model="modelValue.postProcessing" type="checkbox" value="sanding" class="h-4 w-4 accent-sky-400" />
            Шлифовка / зачистка
          </label>
          <label class="flex items-center gap-2">
            <input v-model="modelValue.postProcessing" type="checkbox" value="priming" class="h-4 w-4 accent-sky-400" />
            Грунтовка под покраску
          </label>
          <label class="flex items-center gap-2">
            <input v-model="modelValue.postProcessing" type="checkbox" value="painting" class="h-4 w-4 accent-sky-400" />
            Покраска в один цвет
          </label>
        </div>
      </div>

      <div>
        <label class="mb-2 block text-xs font-semibold text-slate-200">Комментарий к заказу</label>
        <textarea
          v-model="modelValue.comment"
          rows="5"
          placeholder="Особые требования к точности, форматам файлов, упаковке и т.п."
          class="w-full resize-y rounded-xl border border-slate-800/70 bg-slate-950/30 px-3 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/20"
        />
      </div>
    </div>
  </div>
</template>

