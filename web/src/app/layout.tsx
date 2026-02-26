import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Providers } from "./providers";
import { fetchHeroSlider } from "../lib/sanity/fetch";
import HeroSlider from "../components/HeroSlider";

export const metadata: Metadata = {
  title: "Платформа 3D‑печати",
  description: "Калькулятор 3D‑печати, магазин изделий и админ‑панель.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sliderData = await fetchHeroSlider();
  const sliderItems = sliderData?.items ?? [];

  return (
    <html lang="ru">
      <body>
        <Providers>
          <div className="app">
            <header className="app-header">
              <div className="logo">2GTechLab</div>
              <nav className="nav">
                <Link href="/">Главная</Link>
                <Link href="/order">Заказать</Link>
                <Link href="/calculator">Расчитать</Link>
                <Link href="/catalog">Магазин</Link>
                <Link href="/models">Модели</Link>
                <Link href="/about">О нас</Link>
                <Link href="/account">ЛК</Link>
              </nav>
            </header>
            {sliderItems.length > 0 && <HeroSlider items={sliderItems} />}
            <main className="app-main">{children}</main>
            <footer className="app-footer">
              <span>© {new Date().getFullYear()} Платформа 3D‑печати</span>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
