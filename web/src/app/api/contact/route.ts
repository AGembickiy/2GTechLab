import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Заполните все поля" },
        { status: 400 }
      );
    }

    // TODO: Интегрировать Resend, SendGrid или Nodemailer для отправки email
    // Пример с Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: "noreply@2gtechlab.ru",
    //   to: process.env.CONTACT_EMAIL,
    //   subject: `Новое сообщение от ${name}`,
    //   replyTo: email,
    //   text: message,
    // });

    // В режиме разработки логируем
    if (process.env.NODE_ENV === "development") {
      console.log("Contact form submission:", { name, email, message });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
