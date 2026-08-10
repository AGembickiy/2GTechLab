<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >

      <div
        v-if="modelValue"
        class="fixed inset-0 z-50"
      >

        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/70 backdrop-blur-sm"
          @click="close"
        />


        <!-- Container -->
        <div
          class="absolute inset-0 flex items-center justify-center p-6"
        >

          <div
            class="mx-auto w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl"
          >

            <div class="text-center">

              <h2 class="text-lg font-bold text-white">
                Вход в аккаунт
              </h2>

              <p class="mt-2 text-sm leading-relaxed text-slate-400">
                Для оформления заказа войдите или создайте аккаунт.
              </p>

            </div>


            <div class="mt-5 space-y-2.5">

              <NuxtLink
                to="/auth/login"
                class="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Войти
              </NuxtLink>


              <NuxtLink
                to="/auth/register"
                class="flex w-full items-center justify-center rounded-full border border-slate-700 bg-slate-950/50 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                Регистрация
              </NuxtLink>

            </div>


            <button
              type="button"
              class="mt-4 w-full text-xs text-slate-500 transition hover:text-white"
              @click="close"
            >
              Продолжить без входа
            </button>


          </div>

        </div>

      </div>

    </Transition>
  </Teleport>
</template>


<script setup lang="ts">

interface Props {
  modelValue: boolean
}


const props = defineProps<Props>()


const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()


function close() {
  emit('update:modelValue', false)
}


watch(
  () => props.modelValue,
  (value) => {

    if (typeof document === 'undefined') return

    document.body.style.overflow = value
      ? 'hidden'
      : ''

  }
)


onUnmounted(() => {

  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }

})

</script>