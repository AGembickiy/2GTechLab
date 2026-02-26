import type { Metadata } from "next";
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
                <a href="/">Главная</a>
                <a href="/calculator">Калькулятор</a>
                <a href="/catalog">Магазин</a>
                <a href="/upload">Загрузка модели</a>
                <a href="/orders">Мои заказы</a>
                <a href="/account">Личный кабинет</a>
                <a href="/admin">Админка</a>
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

