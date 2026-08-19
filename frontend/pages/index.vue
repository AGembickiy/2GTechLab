<template>
  <div class="flex flex-col">


    <!-- Hero Section -->

    <HeroSlider />




    <!-- Process Section -->

    <section
      class="py-16 bg-gradient-to-br from-graphite via-black to-titanium"
    >

      <AppContainer>


        <h2 class="text-3xl font-bold text-white mb-12 text-center">
          Как это работает
        </h2>



        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >


          <div
            v-for="(step,index) in steps"
            :key="index"
            class="text-center"
          >


            <div
              class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white"
            >
              {{ index + 1 }}
            </div>



            <h3 class="text-xl font-bold text-white mb-2">
              {{ step.title }}
            </h3>



            <p class="text-slate-400">
              {{ step.text }}
            </p>


          </div>


        </div>


      </AppContainer>


    </section>


  </div>
</template>




<script setup lang="ts">


const steps = [

  {
    title:'Модель или эскиз',
    text:'Загрузите 3D модель или отправьте эскиз — мы создадим модель'
  },


  {
    title:'Мгновенный расчёт',
    text:'Расчет онлай стоимость и время производства'
  },


  {
    title:'Изготовление',
    text:'Изготовим точно в срок'
  },


  {
    title:'Доставка',
    text:'Надёжно упакуем отправим к Вам'
  }


]


</script>