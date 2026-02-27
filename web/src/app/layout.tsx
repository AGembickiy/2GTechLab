import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { fetchHeroSlider } from "../lib/sanity/fetch";
import AppNav from "../components/AppNav";
import MainWithOptionalSlider from "../components/MainWithOptionalSlider";

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
              <AppNav />
            </header>
            <MainWithOptionalSlider sliderItems={sliderItems}>{children}</MainWithOptionalSlider>
            <footer className="app-footer">
              <span>© {new Date().getFullYear()} Платформа 3D‑печати</span>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
