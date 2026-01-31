import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: {
    default: "2G Tech Lab — Мастерская 3D-печати | Услуги и заказ печати",
    template: "%s | 2G Tech Lab",
  },
  description:
    "Мастерская 3D-печати. Услуги 3D-печати на заказ, продажа готовых изделий, сотрудничество с дизайнерами. Закажите печать уже сегодня!",
  keywords: ["3D-печать", "услуги 3D-печати", "заказать печать", "мастерская 3D-печати"],
  openGraph: {
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
