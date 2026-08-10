<template>
  <header
    class="sticky top-0 z-50 border-b border-white/5 bg-black/20 backdrop-blur-2xl"
  >
    <div class="container-main">
      <div class="flex h-[78px] items-center justify-between">
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="group flex items-center gap-4"
        >
          <div
            class="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 shadow-[0_0_35px_rgba(99,102,241,0.35)]"
          >
            <div
              class="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />

            <span class="relative text-sm font-black text-white">
              2G
            </span>
          </div>

          <div class="hidden sm:block">
            <div
              class="text-sm font-black tracking-[0.28em] text-white"
            >
              2GTECHLAB
            </div>

            <div class="text-xs text-slate-400">
              Industrial 3D Printing
            </div>
          </div>
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav
          class="hidden items-center gap-2 rounded-2xl border border-white/5 bg-white/5 p-2 backdrop-blur-xl lg:flex"
        >
          <NuxtLink
            v-for="item in navigationItems"
            :key="item.to"
            :to="item.to"
            class="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            @click="loginModalOpen = true"
          >
            Войти
          </button>

          <NuxtLink
            to="/order"
            class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Заказать
          </NuxtLink>
        </div>
      </div>
    </div>

    <LoginModal v-model:open="loginModalOpen" />
    <RegisterModal v-model:open="registerModalOpen" />
  </header>
</template>

<script setup lang="ts">
const navigationItems = [
  { label: 'Главная', to: '/' },
  { label: 'Заказать', to: '/order' },
  { label: 'Калькулятор', to: '/calculator' },
  { label: 'Магазин', to: '/shop' },
  { label: 'Модели', to: '/models' },
  { label: 'О нас', to: '/about' }
]

const loginModalOpen = ref(false)
const registerModalOpen = ref(false)

defineOptions({
  components: {
    LoginModal: () => import('~/components/LoginModal.vue'),
    RegisterModal: () => import('~/components/RegisterModal.vue')
  }
})
</script>