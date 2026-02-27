"use client";

import { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@/store/slices/authSlice";
import LoginModal from "./LoginModal";

export default function AppNav() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  return (
    <>
      <nav className="nav">
        <Link href="/">Главная</Link>
        <Link href="/order">Заказать</Link>
        <Link href="/calculator">Расчитать</Link>
        <Link href="/catalog">Магазин</Link>
        <Link href="/models">Модели</Link>
        <Link href="/about">О нас</Link>
        {isAuthenticated ? (
          <Link href="/account">ЛК</Link>
        ) : (
          <button
            type="button"
            className="nav__auth-trigger"
            onClick={() => setLoginModalOpen(true)}
          >
            Войти
          </button>
        )}
      </nav>
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  );
}
