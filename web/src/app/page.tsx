import Link from "next/link";
import { fetchServices, fetchPortfolio, fetchReviews, fetchSiteSettings } from "@/lib/sanity/fetch";
import ServiceIcon from "@/components/ServiceIcon";
import PortfolioPreview from "@/components/PortfolioPreview";
import ReviewsSlider from "@/components/ReviewsSlider";

export default async function HomePage() {
  const [services, portfolio, reviews, settings] = await Promise.all([
    fetchServices(),
    fetchPortfolio(4),
    fetchReviews(),
    fetchSiteSettings(),
  ]);

  const heroTitle = settings?.heroTitle ?? "Мастерская 3D-печати";
  const heroSubtitle = settings?.heroSubtitle ?? "Услуги печати на заказ, готовые изделия, сотрудничество с дизайнерами. Современные технологии для ваших идей.";

  return (
    <div>
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="absolute inset-0 geo-pattern" aria-hidden />
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
            {heroTitle}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--muted)]">
            {heroSubtitle}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/contacts"
              className="rounded-lg bg-[var(--accent)] px-6 py-3 font-semibold text-[var(--background)] transition-colors hover:bg-[var(--accent-hover)]"
            >
              Связаться с нами
            </Link>
            <Link
              href="/catalog"
              className="rounded-lg border border-[var(--border)] px-6 py-3 font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Каталог продукции
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold text-[var(--foreground)]">Наши услуги</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-[var(--muted)]">
            Полный спектр услуг в области 3D-печати и прототипирования
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service: { _id: string; title: string; description?: string; icon?: string }) => (
              <div
                key={service._id}
                className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 transition-colors hover:border-[var(--accent)]/50"
              >
                <ServiceIcon name={service.icon} />
                <h3 className="mt-4 font-semibold text-[var(--foreground)]">{service.title}</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--card-bg)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold text-[var(--foreground)]">Преимущества 3D-печати</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[var(--accent)]/20 text-2xl font-bold text-[var(--accent)]">1</div>
              <h3 className="mt-4 font-semibold text-[var(--foreground)]">Скорость</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">Быстрое изготовление прототипов и малых серий</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[var(--accent)]/20 text-2xl font-bold text-[var(--accent)]">2</div>
              <h3 className="mt-4 font-semibold text-[var(--foreground)]">Гибкость</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">Любая сложность геометрии, персонализация</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[var(--accent)]/20 text-2xl font-bold text-[var(--accent)]">3</div>
              <h3 className="mt-4 font-semibold text-[var(--foreground)]">Экономия</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">Малые партии без затрат на оснастку</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-[var(--foreground)]">Портфолио</h2>
              <p className="mt-2 text-[var(--muted)]">Примеры наших работ</p>
            </div>
            <Link
              href="/portfolio"
              className="text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
            >
              Смотреть всё →
            </Link>
          </div>
          <PortfolioPreview items={portfolio} />
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="border-y border-[var(--border)] bg-[var(--card-bg)] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-3xl font-bold text-[var(--foreground)]">Отзывы клиентов</h2>
            <ReviewsSlider reviews={reviews} />
          </div>
        </section>
      )}

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-8 text-center">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Готовы начать проект?</h2>
          <p className="mt-4 text-[var(--muted)]">
            Свяжитесь с нами — обсудим ваши идеи и подберём оптимальное решение
          </p>
          <Link
            href="/contacts"
            className="mt-6 inline-block rounded-lg bg-[var(--accent)] px-8 py-3 font-semibold text-[var(--background)] transition-colors hover:bg-[var(--accent-hover)]"
          >
            Написать нам
          </Link>
        </div>
      </section>
    </div>
  );
}
