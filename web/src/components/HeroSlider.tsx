"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { urlFor } from "../lib/sanity/image";

export type HeroSliderItem = {
  _key?: string;
  image?: { asset?: { _ref?: string } } | null;
  imageUrl?: string;
  alt?: string | null;
  order?: number;
};

// Позиции и повороты для 5 фото (в % и deg), с симметричными отступами слева/справа
// По вертикали блоки центрируются относительно контейнера (top: 50% + translateY(-50%))
// Карточки равномерно распределены с одинаковыми отступами от краев (5% слева и справа)
const LAYOUTS: { left: number; rotate: number; width: number }[][] = [
  [
    // 5 карточек: одинаковая ширина 18%, отступы по 5% слева/справа, равномерное распределение
    { left: 5, rotate: -6, width: 18 },
    { left: 23, rotate: 3, width: 18 },
    { left: 41, rotate: -4, width: 18 },
    { left: 59, rotate: 5, width: 18 },
    { left: 77, rotate: -3, width: 18 },
  ],
];

export default function HeroSlider({ items }: { items: HeroSliderItem[] }) {
  const list = (items || []).slice(0, 5);
  const layout = LAYOUTS[0];
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;

    const handleGlobalClick = () => {
      setActiveIndex(null);
    };

    // Добавляем слушатель на window, чтобы поймать клик ВООБЩЕ везде
    window.addEventListener("click", handleGlobalClick);
    
    return () => {
      window.removeEventListener("click", handleGlobalClick);
    };
  }, [activeIndex]);

  if (list.length === 0) return null;

  return (
    <section
      className="hero-slider relative"
      aria-label="Фото мастерской"
    >
      <div
        className="hero-slider__inner"
        role="presentation"
      >
        {list.map((item, i) => {
          const pos = layout[i % layout.length];
          const imageSrc = item.imageUrl ?? (item.image ? urlFor(item.image).width(800).height(600).url() : null);
          const alt = item.alt || `Фото мастерской ${i + 1}`;
          const isExternal = typeof imageSrc === "string" && imageSrc.startsWith("http");
          const isActive = activeIndex === i;

          return (
            <div
              key={item._key ?? `slide-${i}`}
              className={`hero-slider__item transition-all duration-500 ease-out ${isActive ? "hero-slider__item--active cursor-default" : "cursor-pointer"}`}
              style={{
                left: isActive ? "50%" : `${pos.left}%`,
                top: "50%",
                width: isActive ? "30%" : `${pos.width}%`,
                transform: isActive
                  ? "translate(-50%, -50%) scale(1.03) rotate(0deg)"
                  : `translateY(-50%) rotate(${pos.rotate}deg)`,
                zIndex: isActive ? 1000 : 10 + i,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((prev) => (prev === i ? null : i));
              }}
            >
              <div className="hero-slider__frame">
                {imageSrc ? (
                  isExternal ? (
                    <img src={imageSrc} alt={alt} className="hero-slider__img" />
                  ) : (
                    <Image
                      src={imageSrc}
                      alt={alt}
                      fill
                      className="hero-slider__img"
                      sizes="(max-width: 900px) 50vw, 400px"
                    />
                  )
                ) : (
                  <div className="hero-slider__placeholder">Фото</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
