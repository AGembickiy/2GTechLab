<script setup lang="ts">

import { computed } from 'vue';

interface OrderFormModel {
  prototypeType: 'standard' | 'strong' | 'solid';
  copies: number;
  postProcessing: Array<'sanding' | 'priming' | 'painting'>;
  comment: string;
}

const modelValue = defineModel<OrderFormModel>({
  required: true,
});


const prototypeStrength = computed({

  get() {

    if (modelValue.value.prototypeType === 'strong') {
      return 50;
    }

    if (modelValue.value.prototypeType === 'solid') {
      return 100;
    }

    return 20;

  },


  set(value: number) {

    if (value < 34) {

      modelValue.value.prototypeType = 'standard';

    } else if (value < 67) {

      modelValue.value.prototypeType = 'strong';

    } else {

      modelValue.value.prototypeType = 'solid';

    }

  },

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


</script>


<template>

<div class="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-5">


<h2 class="text-sm font-semibold text-slate-100">
  Параметры изготовления
</h2>



<div class="mt-4 grid gap-4 md:grid-cols-2">



<!-- Тип прототипа -->

<div>

<label class="mb-2 block text-xs font-semibold text-slate-200">
  Тип прототипа
</label>


<div class="flex items-center gap-4">

<input
  v-model.number="prototypeStrength"
  type="range"
  min="0"
  max="100"
  step="1"
  class="w-full cursor-pointer"
/>


<div class="w-14 text-right text-sm text-slate-200">
  {{ prototypeStrength }}%
</div>


</div>


<div class="mt-2 text-xs text-slate-400">
  {{ prototypeLabel }}
</div>


</div>





<!-- Количество -->

<div>

<label class="mb-2 block text-xs font-semibold text-slate-200">
  Количество штук
</label>


<input

v-model.number="modelValue.copies"

type="number"

min="1"

class="w-full rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/20"

/>


</div>


</div>





<!-- Постобработка -->

<div class="mt-5 rounded-xl border border-slate-800/60 bg-slate-950/20 p-4">


<div class="mb-3 text-xs font-semibold text-slate-200">
  Постобработка
</div>



<div class="space-y-3 text-sm text-slate-200">



<label class="flex items-center gap-2">

<input

v-model="modelValue.postProcessing"

type="checkbox"

value="sanding"

class="h-4 w-4"

/>

Шлифовка / полировка

</label>




<label class="flex items-center gap-2">

<input

v-model="modelValue.postProcessing"

type="checkbox"

value="priming"

class="h-4 w-4"

/>

Нанесение грунтовки

</label>




<label class="flex items-center gap-2">

<input

v-model="modelValue.postProcessing"

type="checkbox"

value="painting"

class="h-4 w-4"

/>

Покраска

</label>



</div>


</div>





<!-- Комментарий -->


<div class="mt-5">


<label class="mb-2 block text-xs font-semibold text-slate-200">

Комментарий к заказу

</label>



<textarea

v-model="modelValue.comment"

rows="5"

placeholder="Дополнительные требования к изготовлению..."

class="w-full resize-y rounded-xl border border-slate-800/70 bg-slate-950/30 px-3 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/20"

/>



</div>



</div>


</template>