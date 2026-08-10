<template>
  <section
    class="relative h-[50vh] min-h-[220px] w-full overflow-hidden bg-[radial-gradient(circle_at_center,_#0f172a_0%,_#020617_100%)]"
    aria-label="Фото мастерской"
  >
    <div class="relative mx-auto h-full w-full max-w-[1400px]" role="presentation">
      <div
        v-for="(item, index) in items"
        :key="item.src"
        class="absolute aspect-[4/3] cursor-pointer transition-all duration-500 ease-out"
        :class="[{ 'z-[1000]': index === activeIndex }, '']"
        :style="itemStyle(index)"
        @click.stop="toggleActive(index)"
      >
        <div class="h-full w-full overflow-hidden rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <img
            :src="item.src"
            :alt="item.alt"
            loading="lazy"
            class="block h-full w-full object-cover transition-transform duration-500 hover:scale-[1.05]"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
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
