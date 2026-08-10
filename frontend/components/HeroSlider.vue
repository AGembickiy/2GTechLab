<template>
  <section class="relative overflow-hidden py-16 lg:py-20">

    <div class="container-main">

      <div class="grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr]">


        <!-- Text -->

        <div class="flex min-h-[420px] flex-col justify-between pt-2">


          <div>

            <h1
              class="max-w-xl text-4xl font-black leading-[1.08] text-white lg:text-5xl"
            >
              Профессиональная
              <span class="text-indigo-400">
                3D печать
              </span>
              на заказ
            </h1>


            <p
              class="mt-8 max-w-lg text-lg leading-relaxed text-slate-300 lg:text-xl"
            >
              Производство деталей, прототипов
              и инженерных моделей.
              От идеи до готового изделия.
            </p>


            <div class="mt-12 flex flex-wrap gap-4">

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



          <!-- Info -->

          <div
            class="grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-8"
          >


            <div>

              <div class="text-2xl font-black text-white">
                24/7
              </div>

              <div class="mt-1 text-sm text-slate-400">
                Приём заказов
              </div>

            </div>



            <div>

              <div class="text-2xl font-black text-white">
                Высокая
              </div>

              <div class="mt-1 text-sm text-slate-400">
                Точность печати
              </div>

            </div>



            <div>

              <div class="text-2xl font-black text-white">
                AMS
              </div>

              <div class="mt-1 text-sm text-slate-400">
                Разные материалы
              </div>

            </div>


          </div>


        </div>





        <!-- Gallery -->


        <div
          class="relative h-[420px]"
        >


          <img
            v-for="(image,index) in slides"
            :key="image"
            :src="image"
            alt="3D project"
            class="absolute h-52 w-72 rounded-3xl object-cover shadow-[0_25px_60px_rgba(0,0,0,0.45)] transition-all duration-700 hover:z-50 hover:scale-125 hover:rotate-0"
            :class="[
              positions[index],
              animations[index]
            ]"
          />


        </div>


      </div>


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



const positions = [

  "top-0 right-28 rotate-6",
  "top-20 right-0 -rotate-6",
  "bottom-16 right-36 rotate-3",
  "bottom-0 right-4 -rotate-3",
  "top-10 right-52"

]



const animations = [

  "animate-float1",
  "animate-float2",
  "animate-float3",
  "animate-float4",
  "animate-float5"

]


</script>