<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth-check',
});

const siteName = ref('TECHLAB');
const siteDescription = ref('Industrial 3D Printing');
const contactEmail = ref('');
const maintenanceMode = ref(false);
const publicCatalog = ref(true);
const success = ref('');

function saveSettings() {
  const settings = {
    siteName: siteName.value,
    siteDescription: siteDescription.value,
    contactEmail: contactEmail.value,
    maintenanceMode: maintenanceMode.value,
    publicCatalog: publicCatalog.value,
  };

  localStorage.setItem('techlab-site-settings', JSON.stringify(settings));
  success.value = 'Настройки сохранены в браузере.';
}
</script>

<template>
  <section class="space-y-6">
    <div
      class="rounded-2xl border border-white/10 bg-white/[0.025] p-6 shadow-xl backdrop-blur-xl"
    >
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">
          Администрирование
        </p>

        <h2 class="mt-2 text-xl font-bold text-white">
          Настройки сайта
        </h2>

        <p class="mt-2 text-sm leading-6 text-slate-400">
          Управление основными параметрами интерфейса сайта.
        </p>
      </div>

      <div
        v-if="success"
        class="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3 text-sm text-emerald-300"
      >
        {{ success }}
      </div>

      <form
        class="mt-6 max-w-3xl space-y-5"
        @submit.prevent="saveSettings"
      >
        <div>
          <label class="mb-2 block text-xs font-semibold text-slate-200">
            Название сайта
          </label>

          <input
            v-model.trim="siteName"
            type="text"
            class="w-full rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/20"
          >
        </div>

        <div>
          <label class="mb-2 block text-xs font-semibold text-slate-200">
            Описание сайта
          </label>

          <input
            v-model.trim="siteDescription"
            type="text"
            class="w-full rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/20"
          >
        </div>

        <div>
          <label class="mb-2 block text-xs font-semibold text-slate-200">
            Контактный Email
          </label>

          <input
            v-model.trim="contactEmail"
            type="email"
            placeholder="admin@example.com"
            class="w-full rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/20"
          >
        </div>

        <label class="flex items-center justify-between gap-4 rounded-xl border border-slate-800/60 bg-slate-950/30 p-4">
          <span>
            <span class="block text-sm font-semibold text-slate-200">
              Режим обслуживания
            </span>
            <span class="mt-1 block text-xs text-slate-500">
              Подготовка интерфейса к временному отключению.
            </span>
          </span>

          <input
            v-model="maintenanceMode"
            type="checkbox"
            class="h-5 w-5 accent-indigo-500"
          >
        </label>

        <label class="flex items-center justify-between gap-4 rounded-xl border border-slate-800/60 bg-slate-950/30 p-4">
          <span>
            <span class="block text-sm font-semibold text-slate-200">
              Публичный каталог
            </span>
            <span class="mt-1 block text-xs text-slate-500">
              Показывать каталог моделей вне личного кабинета.
            </span>
          </span>

          <input
            v-model="publicCatalog"
            type="checkbox"
            class="h-5 w-5 accent-indigo-500"
          >
        </label>

        <div class="flex justify-end pt-2">
          <AppButton
            type="submit"
            color="primary"
          >
            Сохранить настройки
          </AppButton>
        </div>
      </form>
    </div>
  </section>
</template>
