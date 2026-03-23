<template>
  <section class="flex flex-col gap-10">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        to="/order"
        class="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-6 py-4 text-sm font-extrabold tracking-[0.18em] text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)] transition hover:bg-blue-500"
      >
        ЗАКАЗАТЬ
      </NuxtLink>
      <NuxtLink
        to="/shop"
        class="inline-flex w-full items-center justify-center rounded-lg bg-violet-600 px-6 py-4 text-sm font-extrabold tracking-[0.18em] text-white shadow-[0_10px_30px_rgba(124,58,237,0.35)] transition hover:bg-violet-500"
      >
        КУПИТЬ
      </NuxtLink>
      <NuxtLink
        to="/models"
        class="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-6 py-4 text-sm font-extrabold tracking-[0.18em] text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)] transition hover:bg-blue-500 sm:col-span-2 lg:col-span-1"
      >
        МОДЕЛИ
      </NuxtLink>
    </div>
    <div class="mt-3">
      <NuxtLink
        to="/print/pipeline"
        class="inline-flex w-full items-center justify-center rounded-lg border border-slate-600 bg-slate-900/40 px-6 py-3 text-xs font-bold tracking-[0.12em] text-slate-200 transition hover:bg-slate-800 sm:text-sm sm:tracking-[0.16em]"
      >
        Печать API (Django + Celery)
      </NuxtLink>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div class="flex items-center gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/30 p-5">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl text-sky-300">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-6 w-6">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
            />
          </svg>
        </div>
        <div>
          <div class="text-sm font-bold tracking-widest">РАЗРАБОТКА</div>
          <div class="text-sm text-slate-300">Воплотим идею</div>
        </div>
      </div>

      <div class="flex items-center gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/30 p-5">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl text-sky-300">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-6 w-6">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
            />
          </svg>
        </div>
        <div>
          <div class="text-sm font-bold tracking-widest">ВЫСШЕЕ КАЧЕСТВО</div>
          <div class="text-sm text-slate-300">Точность, надёжность</div>
        </div>
      </div>

      <div class="flex items-center gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/30 p-5">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl text-sky-300">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-6 w-6">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <div class="text-sm font-bold tracking-widest">ИЗГОТОВИМ В СРОК</div>
          <div class="text-sm text-slate-300">Соблюдаем дедлайны</div>
        </div>
      </div>

      <div class="flex items-center gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/30 p-5">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl text-sky-300">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-6 w-6">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.806H14.25M16.5 18.75h-2.25m0-11.25v11.25m-10.5-6h10.5"
            />
          </svg>
        </div>
        <div>
          <div class="text-sm font-bold tracking-widest">БЫСТРАЯ ДОСТАВКА</div>
          <div class="text-sm text-slate-300">Бережно вовремя</div>
        </div>
      </div>
    </div>

    <div class="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-6">
      <h2 class="text-lg font-semibold">Основные преимущества сервиса</h2>
      <ul class="mt-4 grid gap-4 md:grid-cols-2">
        <li class="rounded-xl border border-slate-800/60 bg-slate-950/30 p-4">
          <div class="font-semibold">Быстрая подготовка и подача заказа</div>
          <p class="mt-2 text-sm text-slate-300">
            Загрузите готовую 3D‑модель или пришлите рисунок/эскиз изделия — мы поможем довести его до печати.
          </p>
        </li>
        <li class="rounded-xl border border-slate-800/60 bg-slate-950/30 p-4">
          <div class="font-semibold">Удобное редактирование и визуальный контроль</div>
          <p class="mt-2 text-sm text-slate-300">
            Меняйте масштаб и оценивайте объём прямо в браузере с помощью интерактивного 3D‑просмотра.
          </p>
        </li>
        <li class="rounded-xl border border-slate-800/60 bg-slate-950/30 p-4">
          <div class="font-semibold">Поддержка профессиональных форматов</div>
          <p class="mt-2 text-sm text-slate-300">
            Поддерживаются форматы STL, OBJ, FBX, DAE, GLTF, BLEND, SKP, IGES, STEP, VRML и другие совместимые.
          </p>
        </li>
        <li class="rounded-xl border border-slate-800/60 bg-slate-950/30 p-4">
          <div class="font-semibold">Помощь дизайнеров и готовность к производству</div>
          <p class="mt-2 text-sm text-slate-300">
            Если у вас нет модели, наши специалисты создадут её по вашим материалам и подготовят к печати.
          </p>
        </li>
      </ul>
    </div>
  </section>
</template>
