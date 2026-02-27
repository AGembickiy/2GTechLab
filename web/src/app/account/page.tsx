"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Script from "next/script";
import {
  setCredentials,
  clearCredentials,
  selectIsAuthenticated,
  selectUserDisplay,
} from "@/store/slices/authSlice";
import {
  graphqlRequest,
  authMutations,
  getUserDisplayFromAuth,
  type AuthResponse,
} from "@/lib/graphql";

const TELEGRAM_BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "";

export default function AccountPage() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userDisplay = useSelector(selectUserDisplay);

  const [mode, setMode] = useState<"login" | "register">(
    searchParams.get("register") === "1" ? "register" : "login"
  );
  const [method, setMethod] = useState<"email" | "phone" | "telegram">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuthSuccess = useCallback(
    (res: AuthResponse) => {
      const display = getUserDisplayFromAuth(res);
      dispatch(setCredentials({ accessToken: res.accessToken, userDisplay: display }));
      setError(null);
    },
    [dispatch]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        const data = await graphqlRequest<{ login: AuthResponse }>(authMutations.login, {
          input:
            method === "email"
              ? { email: email.trim(), password }
              : { phone: phone.trim(), password },
        });
        handleAuthSuccess(data.login);
      } else {
        if (method === "email") {
          const data = await graphqlRequest<{ register: AuthResponse }>(authMutations.register, {
            input: {
              email: email.trim(),
              password,
              firstName: firstName.trim() || undefined,
              lastName: lastName.trim() || undefined,
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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа или регистрации");
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
    if (!TELEGRAM_BOT_USERNAME) return;
    (window as unknown as { onTelegramAuth?: (user: unknown) => void }).onTelegramAuth =
      handleTelegramAuth;
    return () => {
      delete (window as unknown as { onTelegramAuth?: (user: unknown) => void }).onTelegramAuth;
    };
  }, [handleTelegramAuth]);

  if (isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center min-h-0 w-full px-4">
        <div className="w-full max-w-lg mx-auto text-center">
          <h1 className="feature-tile__text mb-2">Личный кабинет</h1>
          <div className="feature-tile mt-4">
            <p className="feature-tile__subtext !mt-0 mb-2">
              Вы вошли как <strong className="text-[#f1f5f9]">{userDisplay}</strong>
            </p>
            <p className="feature-tile__subtext text-sm mb-4">
              Настройки профиля и история заказов будут доступны в следующих версиях.
            </p>
            <button
              type="button"
              onClick={() => dispatch(clearCredentials())}
              className="cta-btn cta-btn--danger"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center min-h-0 w-full px-4">
      <div className="w-full max-w-md mx-auto text-center">
        <h1 className="feature-tile__text mb-2">Личный кабинет</h1>
        <p className="feature-tile__subtext mb-6">
          Войдите или зарегистрируйтесь через email, телефон или Telegram.
        </p>

        <div className="flex flex-wrap gap-2 justify-center mb-4">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`cta-btn ${mode === "login" ? "cta-btn--blue" : "bg-[rgba(51,65,85,0.6)] text-[#94a3b8] hover:text-[#e5e7eb]"}`}
          >
            Вход
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`cta-btn ${mode === "register" ? "cta-btn--purple" : "bg-[rgba(51,65,85,0.6)] text-[#94a3b8] hover:text-[#e5e7eb]"}`}
          >
            Регистрация
          </button>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {(["email", "phone", "telegram"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              className={`cta-btn text-sm py-1.5 ${
                method === m ? "cta-btn--blue" : "bg-[rgba(51,65,85,0.6)] text-[#94a3b8] hover:text-[#e5e7eb]"
              }`}
            >
              {m === "email" ? "Email" : m === "phone" ? "Телефон" : "Telegram"}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-200 text-sm">
            {error}
          </div>
        )}

        {method === "telegram" ? (
          <div className="feature-tile text-left">
            {TELEGRAM_BOT_USERNAME ? (
              <>
                <Script
                  src="https://telegram.org/js/telegram-widget.js?22"
                  strategy="afterInteractive"
                />
                <div
                  className="telegram-login-widget mt-2 flex justify-center"
                  data-telegram-login={TELEGRAM_BOT_USERNAME}
                  data-size="large"
                  data-onauth="onTelegramAuth(user)"
                  data-request-access="write"
                />
                <p className="feature-tile__subtext mt-4 text-center">
                  Нажмите кнопку выше — откроется окно Telegram для входа. При первом входе будет
                  создан аккаунт.
                </p>
              </>
            ) : (
              <p className="feature-tile__subtext">
                Вход через Telegram не настроен (укажите NEXT_PUBLIC_TELEGRAM_BOT_USERNAME в .env).
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="feature-tile space-y-4 text-left">
            {method === "email" ? (
              <div>
                <label htmlFor="account-email" className="feature-tile__subtext block mb-1 font-medium text-[#cbd5e1]">
                  Email
                </label>
                <input
                  id="account-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[rgba(71,85,105,0.6)] text-[#e5e7eb] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]"
                  placeholder="example@mail.ru"
                />
              </div>
            ) : (
              <div>
                <label htmlFor="account-phone" className="feature-tile__subtext block mb-1 font-medium text-[#cbd5e1]">
                  Номер телефона
                </label>
                <input
                  id="account-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  autoComplete="tel"
                  className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[rgba(71,85,105,0.6)] text-[#e5e7eb] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]"
                  placeholder="+7 999 123-45-67"
                />
              </div>
            )}

            <div>
              <label htmlFor="account-password" className="feature-tile__subtext block mb-1 font-medium text-[#cbd5e1]">
                Пароль
              </label>
              <input
                id="account-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={6}
                className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[rgba(71,85,105,0.6)] text-[#e5e7eb] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]"
                placeholder="Не менее 6 символов"
              />
            </div>

            {mode === "register" && (
              <>
                <div>
                  <label htmlFor="account-firstname" className="feature-tile__subtext block mb-1 font-medium text-[#cbd5e1]">
                    Имя (необязательно)
                  </label>
                  <input
                    id="account-firstname"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[rgba(71,85,105,0.6)] text-[#e5e7eb] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]"
                  />
                </div>
                <div>
                  <label htmlFor="account-lastname" className="feature-tile__subtext block mb-1 font-medium text-[#cbd5e1]">
                    Фамилия (необязательно)
                  </label>
                  <input
                    id="account-lastname"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[rgba(71,85,105,0.6)] text-[#e5e7eb] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="cta-btn cta-btn--blue w-full"
            >
              {loading ? "Проверка…" : mode === "login" ? "Войти" : "Зарегистрироваться"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
