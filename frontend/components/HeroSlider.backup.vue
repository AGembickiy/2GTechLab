<template>
  <section class="relative h-[620px] overflow-hidden">

    <div
      class="absolute inset-0"
    >
      <img
        :src="slides[currentSlide]"
        class="h-full w-full object-cover"
        alt="3D printing"
      />

      <div
        class="absolute inset-0 bg-black/50"
      ></div>
    </div>


    <div
      class="relative z-10 flex h-full items-center"
    >
      <div class="container-main">

        <div class="max-w-3xl">

          <h1
            class="text-5xl font-black leading-tight text-white"
          >
            Профессиональная
            <span class="text-indigo-400">
              3D печать
            </span>
            на заказ
          </h1>


          <p
            class="mt-6 text-xl text-slate-300"
          >
            Производство деталей, прототипов
            и инженерных моделей.
          </p>


          <div class="mt-8 flex gap-4">

            <NuxtLink
              to="/order"
              class="button-primary"
            >
              Создать заказ
            </NuxtLink>


            <NuxtLink
              to="/models"
              class="button-secondary"
            >
              Каталог моделей
            </NuxtLink>

          </div>

        </div>

      </div>
    </div>


    <!-- dots -->

    <div
      class="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3"
    >

      <button
        v-for="(_, index) in slides"
        :key="index"
        @click="currentSlide=index"
        class="h-3 w-3 rounded-full bg-white/50"
        :class="{
          'bg-white': currentSlide===index
        }"
      ></button>

    </div>


  </section>
</template>


<script setup lang="ts">

const slides = [
  "/portfolio/work-1.avif",
  "/portfolio/work-2.avif",
  "/portfolio/work-3.avif",
  "/portfolio/work-4.avif",
  "/portfolio/work-5.webp"
]


const currentSlide = ref(0)


let timer:any


onMounted(()=>{

  timer=setInterval(()=>{

    currentSlide.value =
      (currentSlide.value + 1)
      % slides.length

  },5000)

})


onUnmounted(()=>{

  clearInterval(timer)

})

</script>