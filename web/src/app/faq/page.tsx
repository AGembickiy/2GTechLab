import { fetchFaq } from "@/lib/sanity/fetch";
import FaqAccordion from "@/components/FaqAccordion";

export const metadata = {
  title: "Часто задаваемые вопросы",
  description: "Ответы на популярные вопросы об услугах 3D-печати, материалах, сроках и заказе.",
};

export default async function FaqPage() {
  const items = await fetchFaq();

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-[var(--foreground)]">Часто задаваемые вопросы</h1>
        <p className="mt-4 text-[var(--muted)]">
          Ответы на популярные вопросы об услугах 3D-печати
        </p>
        <FaqAccordion items={items} />
      </div>
    </div>
  );
}
