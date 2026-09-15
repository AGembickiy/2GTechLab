<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import FileUpload from './FileUpload.vue';
import PrintSettings from './PrintSettings.vue';

const props = defineProps<{
  modelUrl?: string;
}>();

const { form } = useOrderForm();
const fileUploadRef = ref<InstanceType<typeof FileUpload> | null>(null);

function goToSettings() {
  if (!form.file) {
    return;
  }

  form.step = 2;
}

async function loadCatalogModel(url: string) {
  if (!url || form.file) {
    return;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Не удалось загрузить модель: ${response.status}`);
  }

  const blob = await response.blob();
  const fileName = url.split('/').pop() || 'model.glb';
  const file = new File([blob], fileName, {
    type: blob.type || 'model/gltf-binary',
  });

  await nextTick();
  await fileUploadRef.value?.selectFile(file);
}

watch(
  () => props.modelUrl,
  (url) => {
    if (!url) {
      return;
    }

    void loadCatalogModel(url).catch((error: unknown) => {
      console.error('Ошибка загрузки модели из каталога:', error);
    });
  },
  { immediate: true },
);

function goToFile() {
  form.step = 1;

  nextTick(() => {
    fileUploadRef.value?.openPreview();
  });
}
</script>

<template>
  <form
    class="space-y-4"
    @submit.prevent
  >
    <template v-if="form.step === 1">
      <FileUpload
        ref="fileUploadRef"
        v-model="form.file"
        v-model:original-file="form.originalFile"
      />

      <button
        type="button"
        :disabled="!form.file"
        class="w-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        @click="goToSettings"
      >
        Далее
      </button>
    </template>

    <template v-else>
      <button
        type="button"
        class="w-full rounded-full border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
        @click="goToFile"
      >
        Назад к модели
      </button>

      <PrintSettings v-model="form" />
    </template>
  </form>
</template>
