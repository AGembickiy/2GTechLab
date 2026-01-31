import { fetchSiteSettings } from "@/lib/sanity/fetch";
import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Контакты",
  description: "Свяжитесь с мастерской 3D-печати 2G Tech Lab. Телефон, email, форма обратной связи.",
};

export default async function ContactsPage() {
  const settings = await fetchSiteSettings();

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold text-[var(--foreground)]">Контакты</h1>
        <p className="mt-4 text-[var(--muted)]">
          Свяжитесь с нами — ответим на вопросы и обсудим ваш проект
        </p>

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Контактная информация</h2>
            <div className="mt-6 space-y-4">
              {settings?.phone && (
                <div>
                  <span className="text-sm text-[var(--muted)]">Телефон</span>
                  <a
                    href={`tel:${settings.phone.replace(/\D/g, "")}`}
                    className="block text-[var(--accent)] hover:underline"
                  >
                    {settings.phone}
                  </a>
                </div>
              )}
              {settings?.email && (
                <div>
                  <span className="text-sm text-[var(--muted)]">Email</span>
                  <a
                    href={`mailto:${settings.email}`}
                    className="block text-[var(--accent)] hover:underline"
                  >
                    {settings.email}
                  </a>
                </div>
              )}
              {settings?.address && (
                <div>
                  <span className="text-sm text-[var(--muted)]">Адрес</span>
                  <p className="text-[var(--foreground)]">{settings.address}</p>
                </div>
              )}
            </div>

            <div className="mt-8 aspect-video overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card-bg)]">
              <div className="flex h-full items-center justify-center text-[var(--muted)]">
                <p className="text-center text-sm">
                  Карта
                  <br />
                  <span className="text-xs">Добавьте Yandex Maps или Google Maps</span>
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Форма обратной связи</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
