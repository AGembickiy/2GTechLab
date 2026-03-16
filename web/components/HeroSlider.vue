<template>
  <section class="hero-slider" aria-label="Фото мастерской">
    <div class="hero-slider__inner" role="presentation">
      <div
        v-for="(item, index) in items"
        :key="item.src"
        class="hero-slider__item"
        :class="[{ 'hero-slider__item--active': index === activeIndex }, 'transition-all duration-500 ease-out']"
        :style="itemStyle(index)"
        @click.stop="toggleActive(index)"
      >
        <div class="hero-slider__frame">
          <img :src="item.src" :alt="item.alt" class="hero-slider__img" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
const items = [
  { src: '/slider/slide-1.avif', alt: '3D‑принтер — синий объект' },
  { src: '/slider/slide-2.avif', alt: '3D‑принтер — механическая деталь' },
  { src: '/slider/slide-3.avif', alt: '3D‑печать декоративной вазы' },
  { src: '/slider/slide-4.avif', alt: 'Печать вазы с разноцветным PLA' },
  { src: '/slider/slide-5.webp', alt: 'Детали, напечатанные на 3D‑принтере' }
];

// Позиции и повороты как в old HeroSlider.tsx
const LAYOUT = [
  { left: 5, rotate: -6, width: 18 },
  { left: 23, rotate: 3, width: 18 },
  { left: 41, rotate: -4, width: 18 },
  { left: 59, rotate: 5, width: 18 },
  { left: 77, rotate: -3, width: 18 }
];

const activeIndex = ref<number | null>(null);

const clearActive = () => {
  activeIndex.value = null;
};

const toggleActive = (index: number) => {
  activeIndex.value = activeIndex.value === index ? null : index;
};

onMounted(() => {
  window.addEventListener('click', clearActive);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', clearActive);
});

const itemStyle = (index: number) => {
  const pos = LAYOUT[index % LAYOUT.length];
  const isActive = activeIndex.value === index;

  return {
    left: isActive ? '50%' : `${pos.left}%`,
    top: '50%',
    width: isActive ? '30%' : `${pos.width}%`,
    transform: isActive
      ? 'translate(-50%, -50%) scale(1.03) rotate(0deg)'
      : `translateY(-50%) rotate(${pos.rotate}deg)`,
    zIndex: isActive ? 1000 : 10 + index
  };
};
</script>
