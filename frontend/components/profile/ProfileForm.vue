<script setup lang="ts">
import { authService } from '@/services/authService';

const authStore = useAuthStore();

const isClient = computed(() => authStore.userRole === 'client');

const loading = ref(false);
const loadingUser = ref(false);
const success = ref('');
const error = ref('');

const form = reactive({
  username: '',
  email: '',
  phone: '',
});

function loadUser() {
  const user = authStore.user;

  form.username = user?.username ?? '';
  form.email = user?.email ?? '';
  form.phone = user?.phone ?? '';
}

async function refreshUser() {
  loadingUser.value = true;
  error.value = '';

  try {
    await authService.getCurrentUser();
    loadUser();
  } catch (err: unknown) {
    const responseError = err as {
      data?: {
        detail?: string
        message?: string
      }
      message?: string
    };

    error.value =
      responseError?.data?.detail ||
      responseError?.data?.message ||
      responseError?.message ||
      'Не удалось загрузить данные профиля.';
  } finally {
    loadingUser.value = false;
  }
}

const route = useRoute();

onMounted(async () => {
  loadUser();

  if (route.query.preview === '1') {
    return;
  }

  await refreshUser();
});

async function saveProfile() {
  success.value = '';
  error.value = '';

  if (!form.username.trim()) {
    error.value = 'Имя обязательно.';
    return;
  }

  if (!form.email.trim()) {
    error.value = 'Email обязателен.';
    return;
  }

  loading.value = true;

  try {
    await authService.updateProfile({
      username: form.username.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
    });

    await authService.getCurrentUser();

    loadUser();

    success.value = 'Профиль успешно сохранён.';
  } catch (err: unknown) {
    const responseError = err as {
      data?: {
        detail?: string
        message?: string
      }
      message?: string
    };

    error.value =
      responseError?.data?.detail ||
      responseError?.data?.message ||
      responseError?.message ||
      'Не удалось сохранить профиль.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="mx-auto w-full max-w-3xl">
    <div
      class="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-xl"
    >
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">
          Личный кабинет
        </p>

        <h1 class="mt-2 text-2xl font-black tracking-tight text-slate-100">
          Мой профиль
        </h1>

        <p class="mt-2 text-sm leading-6 text-slate-400">
          Управление основными данными вашей учётной записи.
        </p>
      </div>

      <div
        v-if="loadingUser"
        class="mt-6 rounded-xl border border-slate-800/60 bg-slate-950/30 px-4 py-3 text-sm text-slate-400"
      >
        Загрузка профиля...
      </div>

      <div
        v-if="success"
        class="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3 text-sm text-emerald-300"
      >
        {{ success }}
      </div>

      <div
        v-if="error"
        class="mt-6 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-300"
      >
        {{ error }}
      </div>

      <div
        v-if="isClient"
        class="mt-6 rounded-2xl border border-indigo-400/20 bg-indigo-500/[0.06] p-5"
      >
        <div class="flex items-start gap-4">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
            <Icon
              name="i-heroicons-briefcase"
              class="h-5 w-5"
            />
          </div>

          <div class="min-w-0 flex-1">
            <h2 class="text-base font-bold text-slate-100">
              Стать партнёром
            </h2>

            <p class="mt-1 text-sm leading-6 text-slate-400">
              Подключите партнёрский кабинет для работы с моделями,
              заказами и другими партнёрскими возможностями.
            </p>

            <AppButton
              type="button"
              class="mt-4"
              variant="secondary"
              @click="navigateTo('/partner')"
            >
              Стать партнёром
            </AppButton>
          </div>
        </div>
      </div>

      <form
        class="mt-6 space-y-5"
        @submit.prevent="saveProfile"
      >
        <div>
          <label class="mb-2 block text-xs font-semibold text-slate-200">
            Имя
          </label>

          <input
            v-model.trim="form.username"
            type="text"
            autocomplete="name"
            placeholder="Ваше имя"
            class="w-full rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/20"
            :disabled="loading || loadingUser"
          >
        </div>

        <div>
          <label class="mb-2 block text-xs font-semibold text-slate-200">
            Email
          </label>

          <input
            v-model.trim="form.email"
            type="email"
            autocomplete="email"
            placeholder="name@example.com"
            class="w-full rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/20"
            :disabled="loading || loadingUser"
          >
        </div>

        <div>
          <label class="mb-2 block text-xs font-semibold text-slate-200">
            Номер телефона
          </label>

          <input
            v-model.trim="form.phone"
            type="tel"
            autocomplete="tel"
            inputmode="tel"
            placeholder="+7 900 000 00 00"
            class="w-full rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/20"
            :disabled="loading || loadingUser"
          >

          <p class="mt-2 text-xs leading-5 text-slate-500">
            Номер телефона используется вашей системой авторизации.
          </p>
        </div>

        <div class="flex justify-end pt-2">
          <AppButton
            type="submit"
            color="primary"
            :loading="loading"
            :disabled="loading || loadingUser"
          >
            Сохранить изменения
          </AppButton>
        </div>
      </form>
    </div>
  </section>
</template>
