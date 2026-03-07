"use client";

import { usePathname } from "next/navigation";
import HeroSlider from "./HeroSlider";
import type { HeroSliderItem } from "./HeroSlider";

export default function MainWithOptionalSlider({
  sliderItems,
  children,
}: {
  sliderItems: HeroSliderItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showSlider = pathname === "/" && sliderItems.length > 0;

  return (
    <main className="app-main">
      {showSlider && <HeroSlider items={sliderItems} />}
      {children}
    </main>
  );
}
