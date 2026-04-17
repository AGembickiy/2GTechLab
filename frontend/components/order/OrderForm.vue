<script setup lang="ts">
import FileUpload from './FileUpload.vue';
import PrintSettings from './PrintSettings.vue';
import ContactForm from './ContactForm.vue';

const { form, derived } = useOrderForm();
</script>

<template>
  <form class="space-y-4">
    <FileUpload v-model="form.file" v-model:original-file="form.originalFile" />

      <div class="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-5">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="mb-2 block text-xs font-semibold text-slate-200">
              Название изделия <span class="text-rose-300">*</span>
            </label>
            <input
              v-model="form.productName"
              type="text"
              placeholder="Например, корпус датчика"
              class="w-full rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/20"
            />
          </div>

          <div>
            <label class="mb-2 block text-xs font-semibold text-slate-200">
              Количество экземпляров <span class="text-rose-300">*</span>
            </label>
            <input
              v-model.number="form.copies"
              type="number"
              min="1"
              class="w-full rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/20"
            />
          </div>
        </div>

        <div class="mt-4 grid gap-3 md:grid-cols-3">
          <div class="rounded-xl border border-slate-800/60 bg-slate-950/20 px-4 py-3">
            <div class="text-[11px] text-slate-400">Размеры, мм</div>
            <div class="mt-1 text-sm text-slate-200">{{ derived.sizeText }}</div>
          </div>
          <div class="rounded-xl border border-slate-800/60 bg-slate-950/20 px-4 py-3">
            <div class="text-[11px] text-slate-400">Вес, г</div>
            <div class="mt-1 text-sm text-slate-200">{{ derived.weightText }}</div>
          </div>
          <div class="rounded-xl border border-slate-800/60 bg-slate-950/20 px-4 py-3">
            <div class="text-[11px] text-slate-400">Формат файла</div>
            <div class="mt-1 text-sm text-slate-200">{{ derived.fileFormatText }}</div>
          </div>
        </div>
      </div>

    <PrintSettings v-model="form" />
    <ContactForm v-model="form" />
  </form>
</template>

