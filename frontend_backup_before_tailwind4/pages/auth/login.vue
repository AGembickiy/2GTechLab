<template>
  <section class="mx-auto flex min-h-[60vh] w-full max-w-md items-center justify-center px-4 py-16">
    <div class="w-full rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl">
      <h1 class="text-center text-2xl font-bold text-slate-100">Вход в аккаунт</h1>
      <p class="mt-2 text-center text-sm text-slate-400">
        Для доступа к админ-панели введите логин и пароль.
      </p>

      <form class="mt-8 space-y-5" @submit.prevent="onSubmit">
        <div>
          <label class="mb-2 block text-xs font-semibold text-slate-200">Логин</label>
          <input
            v-model.trim="username"
            type="text"
            autocomplete="username"
            class="w-full rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/20"
          />
        </div>
        <div>
          <label class="mb-2 block text-xs font-semibold text-slate-200">Пароль</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="w-full rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/20"
          />
        </div>

        <p v-if="error" class="text-center text-sm text-rose-400">{{ error }}</p>

        <AppButton type="submit" block variant="primary" size="lg" :loading="submitting">
          Войти
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
})

const route = useRoute()
const { login } = useAdminAuth()

const username = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function onSubmit() {
  error.value = ''
  submitting.value = true
  try {
    const ok = await login(username.value, password.value)
    if (!ok) {
      error.value = 'Неверный логин или пароль.'
      return
    }
    const redirect =
      typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
        ? route.query.redirect
        : '/admin'
    await navigateTo(redirect)
  } finally {
    submitting.value = false
  }
}
</script>
