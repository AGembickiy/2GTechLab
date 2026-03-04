import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Введите имя").max(200),
  email: z.string().email("Некорректный email").max(320),
  message: z.string().min(10, "Сообщение не короче 10 символов").max(5000),
});

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Слишком много запросов. Попробуйте позже." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const message = first.name?.[0] || first.email?.[0] || first.message?.[0] || "Заполните все поля";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { name, email, message } = parsed.data;

    // TODO: Интегрировать Resend, SendGrid или Nodemailer для отправки email
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({ from: "...", to: process.env.CONTACT_EMAIL, subject: `...`, replyTo: email, text: message });

    if (process.env.NODE_ENV === "development") {
      console.log("Contact form submitted");
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
