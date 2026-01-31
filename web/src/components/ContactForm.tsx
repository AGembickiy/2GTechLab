"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Введите имя"),
  email: z.string().email("Некорректный email"),
  message: z.string().min(10, "Сообщение должно быть не короче 10 символов"),
});

type FormData = z.infer<typeof schema>;

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus("success");
        reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[var(--foreground)]">
          Имя
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-4 py-3 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
          placeholder="Ваше имя"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)]">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-4 py-3 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
          placeholder="email@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-[var(--foreground)]">
          Сообщение
        </label>
        <textarea
          id="message"
          rows={4}
          {...register("message")}
          className="mt-1 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-4 py-3 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
          placeholder="Расскажите о вашем проекте..."
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
        )}
      </div>
      {status === "success" && (
        <p className="rounded-lg bg-green-500/20 p-3 text-sm text-green-400">
          Сообщение отправлено! Мы свяжемся с вами в ближайшее время.
        </p>
      )}
      {status === "error" && (
        <p className="rounded-lg bg-red-500/20 p-3 text-sm text-red-400">
          Ошибка отправки. Попробуйте позже или напишите на email напрямую.
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-lg bg-[var(--accent)] px-6 py-3 font-semibold text-[var(--background)] transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
      >
        {status === "sending" ? "Отправка..." : "Отправить"}
      </button>
    </form>
  );
}
