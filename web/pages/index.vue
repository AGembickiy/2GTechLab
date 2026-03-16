<template>
  <section class="home-content">
      <div class="cta-row">
        <div>
          <NuxtLink href="/order" class="cta-btn cta-btn--blue">ЗАКАЗАТЬ</NuxtLink>
        </div>
        <div>
          <NuxtLink href="/catalog" class="cta-btn cta-btn--purple">КУПИТЬ</NuxtLink>
        </div>
        <div>
          <NuxtLink href="/models" class="cta-btn cta-btn--blue">МОДЕЛИ</NuxtLink>
        </div>
      </div>

      <div class="features-grid">
        <article class="feature-tile">
          <div class="feature-tile__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </div>
          <div>
            <div class="feature-tile__text">РАЗРАБОТКА</div>
            <div class="feature-tile__subtext">Воплотим идею</div>
          </div>
        </article>

        <article class="feature-tile">
          <div class="feature-tile__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>
          <div>
            <div class="feature-tile__text">ВЫСШЕЕ КАЧЕСТВО</div>
            <div class="feature-tile__subtext">Точность, надёжность</div>
          </div>
        </article>

        <article class="feature-tile">
          <div class="feature-tile__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div class="feature-tile__text">ИЗГОТОВИМ В СРОК</div>
            <div class="feature-tile__subtext">Соблюдаем дедлайны</div>
          </div>
        </article>

        <article class="feature-tile">
          <div class="feature-tile__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.806H14.25M16.5 18.75h-2.25m0-11.25v11.25m-10.5-6h10.5" />
            </svg>
          </div>
          <div>
            <div class="feature-tile__text">БЫСТРАЯ ДОСТАВКА</div>
            <div class="feature-tile__subtext">Бережно вовремя</div>
          </div>
        </article>
      </div>
      <section class="service-benefits">
        <h2 class="service-benefits__title">
          Основные преимущества сервиса
        </h2>
        <ul class="service-benefits__list">
          <li class="service-benefits__item">
            <div class="service-benefits__item-title">Быстрая подготовка и подача заказа</div>
            <p class="service-benefits__item-text">
              Загрузите готовую 3D‑модель или пришлите рисунок/эскиз изделия — мы поможем довести его до печати.
            </p>
          </li>
          <li class="service-benefits__item">
            <div class="service-benefits__item-title">Удобное редактирование и визуальный контроль</div>
            <p class="service-benefits__item-text">
              Меняйте масштаб и оценивайте объём прямо в браузере с помощью интерактивного 3D‑просмотра.
            </p>
          </li>
          <li class="service-benefits__item">
            <div class="service-benefits__item-title">Поддержка профессиональных форматов</div>
            <p class="service-benefits__item-text">
              Поддерживаются форматы STL, OBJ, FBX, DAE, GLTF, BLEND, SKP, IGES, STEP, VRML и другие совместимые.
            </p>
          </li>
          <li class="service-benefits__item">
            <div class="service-benefits__item-title">Помощь дизайнеров и готовность к производству</div>
            <p class="service-benefits__item-text">
              Если у вас нет модели, наши специалисты создадут её по вашим материалам и подготовят к печати.
            </p>
          </li>
        </ul>
      </section>
    </section>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components';
</script>
