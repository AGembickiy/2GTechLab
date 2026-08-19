<template>
  <section class="mx-auto flex min-h-[60vh] w-full max-w-md items-center justify-center px-4 py-16">
    <div class="w-full rounded-2xl border border-slate-800 bg-white/[0.04] p-8 shadow-xl">
      <h1 class="text-center text-2xl font-bold text-slate-100">
        Регистрация
      </h1>

      <p class="mt-2 text-center text-sm text-slate-400">
        Укажите номер телефона. На него будет отправлен пароль для входа.
      </p>

      <form
        class="mt-8 space-y-5"
        @submit.prevent="onSubmit"
      >
        <div>
          <label class="mb-2 block text-xs font-semibold text-slate-200">
            Номер телефона
          </label>

          <input
            v-model.trim="phone"
            type="tel"
            autocomplete="tel"
            inputmode="tel"
            placeholder="+7 900 000 00 00"
            class="w-full rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/20"
          >
        </div>

        <p
          v-if="error"
          class="text-center text-sm text-rose-400"
        >
          {{ error }}
        </p>

        <AppButton
          type="submit"
          block
          variant="primary"
          size="lg"
          :loading="submitting"
        >
          Получить пароль
        </AppButton>
      </form>

      <NuxtLink
        to="/"
        class="mt-6 block text-center text-sm font-semibold text-slate-400 transition-colors hover:text-cyan-300"
      >
        Вернуться на главную
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin-guest',
});

const phone = ref('');
const error = ref('');
const submitting = ref(false);

function validatePhone() {
  error.value = '';

  const digits = phone.value.replace(/\D/g, '');

  if (!phone.value) {
    error.value = 'Введите номер телефона.';
    return false;
  }

  if (digits.length !== 11) {
    error.value = 'Введите корректный номер телефона.';
    return false;
  }

  if (!digits.startsWith('7') && !digits.startsWith('8')) {
    error.value = 'Введите номер телефона в российском формате.';
    return false;
  }

  return true;
}

async function onSubmit() {
  if (!validatePhone()) {
    return;
  }

  submitting.value = true;

  try {
    // Backend подключим позже.
    await new Promise((resolve) => setTimeout(resolve, 500));
  } finally {
    submitting.value = false;
  }
}
</script>
