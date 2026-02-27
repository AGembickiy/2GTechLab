"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Script from "next/script";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/slices/authSlice";
import {
  graphqlRequest,
  authMutations,
  getUserDisplayFromAuth,
  type AuthResponse,
} from "@/lib/graphql";

const TELEGRAM_BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
};

export default function LoginModal({ isOpen, onClose, initialMode = "login" }: Props) {
  const dispatch = useDispatch();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setMode(initialMode);
  }, [isOpen, initialMode]);

  const handleAuthSuccess = useCallback(
    (res: AuthResponse) => {
      const display = getUserDisplayFromAuth(res);
      dispatch(setCredentials({ accessToken: res.accessToken, userDisplay: display }));
      setError(null);
      onClose();
    },
    [dispatch, onClose]
  );

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await graphqlRequest<{ login: AuthResponse }>(authMutations.login, {
        input:
          method === "email"
            ? { email: email.trim(), password }
            : { phone: phone.trim(), password },
      });
      handleAuthSuccess(data.login);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (method === "email") {
        const data = await graphqlRequest<{ register: AuthResponse }>(authMutations.register, {
          input: {
            email: email.trim(),
            password,
          },
        });
        handleAuthSuccess(data.register);
      } else {
        const data = await graphqlRequest<{ registerByPhone: AuthResponse }>(
          authMutations.registerByPhone,
          {
            input: {
              phone: phone.trim(),
              password,
              firstName: firstName.trim() || undefined,
              lastName: lastName.trim() || undefined,
            },
          }
        );
        handleAuthSuccess(data.registerByPhone);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  const handleTelegramAuth = useCallback(
    (tgUser: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
      auth_date: number;
      hash: string;
    }) => {
      setLoading(true);
      setError(null);
      graphqlRequest<{ loginByTelegram: AuthResponse }>(authMutations.loginByTelegram, {
        input: {
          id: tgUser.id,
          first_name: tgUser.first_name,
          last_name: tgUser.last_name,
          username: tgUser.username,
          photo_url: tgUser.photo_url,
          auth_date: tgUser.auth_date,
          hash: tgUser.hash,
        },
      })
        .then((data) => {
          handleAuthSuccess(data.loginByTelegram);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Ошибка входа через Telegram");
        })
        .finally(() => setLoading(false));
    },
    [handleAuthSuccess]
  );

  useEffect(() => {
    if (!isOpen || !TELEGRAM_BOT_USERNAME) return;
    (window as unknown as { onTelegramAuth?: (user: unknown) => void }).onTelegramAuth =
      handleTelegramAuth;
    return () => {
      delete (window as unknown as { onTelegramAuth?: (user: unknown) => void }).onTelegramAuth;
    };
  }, [isOpen, handleTelegramAuth]);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setPassword("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <>
      <Script src="https://telegram.org/js/telegram-widget.js?22" strategy="afterInteractive" />
      <div
        className="login-modal-overlay"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        <div
          className="login-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="login-modal__close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
          <h2 id="login-modal-title" className="feature-tile__text login-modal__title">
            {mode === "login" ? "Вход" : "Регистрация"}
          </h2>

          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="login-modal__form">
              <div className="login-modal__field">
                <span className="login-modal__label">Войти по</span>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="method"
                      checked={method === "email"}
                      onChange={() => setMethod("email")}
                      className="rounded-full"
                    />
                    <span className="feature-tile__subtext">Email</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="method"
                      checked={method === "phone"}
                      onChange={() => setMethod("phone")}
                      className="rounded-full"
                    />
                    <span className="feature-tile__subtext">Телефон</span>
                  </label>
                </div>
              </div>

              <div className="login-modal__field">
                <label htmlFor="login-modal-email-phone" className="login-modal__label">
                  {method === "email" ? "Email" : "Номер телефона"}
                </label>
                {method === "email" ? (
                  <input
                    id="login-modal-email-phone"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.ru"
                    required
                    autoComplete="email"
                    className="login-modal__input"
                  />
                ) : (
                  <input
                    id="login-modal-email-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 999 123-45-67"
                    required
                    autoComplete="tel"
                    className="login-modal__input"
                  />
                )}
              </div>

              <div className="login-modal__field">
                <label htmlFor="login-modal-password" className="login-modal__label">
                  Пароль
                </label>
                <input
                  id="login-modal-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Не менее 6 символов"
                  required
                  autoComplete="current-password"
                  minLength={6}
                  className="login-modal__input"
                />
              </div>

              {error && (
                <p className="login-modal__error">{error}</p>
              )}

              <button type="submit" disabled={loading} className="cta-btn cta-btn--blue w-full login-modal__submit">
                {loading ? "Проверка…" : "Войти"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="login-modal__form">
              <div className="login-modal__field">
                <span className="login-modal__label">Регистрация по</span>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="method-reg"
                      checked={method === "email"}
                      onChange={() => setMethod("email")}
                      className="rounded-full"
                    />
                    <span className="feature-tile__subtext">Email</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="method-reg"
                      checked={method === "phone"}
                      onChange={() => setMethod("phone")}
                      className="rounded-full"
                    />
                    <span className="feature-tile__subtext">Телефон</span>
                  </label>
                </div>
              </div>

              <div className="login-modal__field">
                <label htmlFor="reg-modal-email-phone" className="login-modal__label">
                  {method === "email" ? "Email" : "Номер телефона"}
                </label>
                {method === "email" ? (
                  <input
                    id="reg-modal-email-phone"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.ru"
                    required
                    autoComplete="email"
                    className="login-modal__input"
                  />
                ) : (
                  <input
                    id="reg-modal-email-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 999 123-45-67"
                    required
                    autoComplete="tel"
                    className="login-modal__input"
                  />
                )}
              </div>

              <div className="login-modal__field">
                <label htmlFor="reg-modal-password" className="login-modal__label">
                  Пароль
                </label>
                <input
                  id="reg-modal-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Не менее 6 символов"
                  required
                  autoComplete="new-password"
                  minLength={6}
                  className="login-modal__input"
                />
              </div>

              {error && (
                <p className="login-modal__error">{error}</p>
              )}

              <button type="submit" disabled={loading} className="cta-btn cta-btn--purple w-full login-modal__submit">
                {loading ? "Создание…" : "Зарегистрироваться"}
              </button>
            </form>
          )}

          <div className="login-modal__telegram">
            {TELEGRAM_BOT_USERNAME ? (
              <>
                <p className="feature-tile__subtext text-center login-modal__telegram-title">
                  {mode === "login" ? "Или войти через Telegram" : "Или зарегистрироваться через Telegram"}
                </p>
                <div
                  className="telegram-login-widget flex justify-center"
                  data-telegram-login={TELEGRAM_BOT_USERNAME}
                  data-size="medium"
                  data-onauth="onTelegramAuth(user)"
                  data-request-access="write"
                />
              </>
            ) : (
              <p className="feature-tile__subtext text-center login-modal__telegram-title">
                Вход через Telegram уже реализован. Чтобы включить: создайте бота в @BotFather, в <code className="text-[#94a3b8]">web/.env.local</code> добавьте <code className="text-[#94a3b8]">NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=имя_бота</code>, в <code className="text-[#94a3b8]">api/.env</code> — <code className="text-[#94a3b8]">TELEGRAM_BOT_TOKEN=токен</code>. Перезапустите dev-серверы.
              </p>
            )}
          </div>

          <p className="feature-tile__subtext text-center login-modal__register">
            {mode === "login" ? (
              <>
                Нет аккаунта?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("register"); setError(null); }}
                  className="login-modal__link login-modal__link-btn"
                >
                  Зарегистрироваться
                </button>
              </>
            ) : (
              <>
                Уже есть аккаунт?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(null); }}
                  className="login-modal__link login-modal__link-btn"
                >
                  Войти
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
